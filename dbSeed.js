// seed.js
// Seeds the portfolio database from database.json using node-postgres (pg) only.
// No PrismaClient, no generated enums — plain SQL over a pg Pool.
//
// Install:  npm i pg dotenv
// Run:      node seed.js
//
// Expects DATABASE_URL in .env, e.g.
//   postgresql://postgres:password@localhost:5432/portfolio_db?schema=public

require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  // ssl: { rejectUnauthorized: false }, // uncomment for hosted Postgres (Neon, Supabase, RDS)
});

// Adjust if database.json lives elsewhere.
const DATA_PATH = path.join(__dirname, "database.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Insert one row and return its generated id.
 * @param {import('pg').PoolClient} client
 * @param {string} table      snake_case table name
 * @param {object} data       column -> value map
 */
async function insert(client, table, data) {
  const columns = Object.keys(data);
  if (columns.length === 0) throw new Error(`No columns for ${table}`);

  const values = columns.map((c) => data[c]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  const quoted = columns.map((c) => `"${c}"`).join(", ");

  const sql = `INSERT INTO "${table}" (${quoted}) VALUES (${placeholders}) RETURNING id`;
  const res = await client.query(sql, values);
  return res.rows[0].id;
}

/**
 * Insert many rows into the same table in a single multi-VALUES statement.
 * Skips silently when rows is empty.
 */
async function insertMany(client, table, rows) {
  if (!rows || rows.length === 0) return;

  const columns = Object.keys(rows[0]);
  const quoted = columns.map((c) => `"${c}"`).join(", ");

  const values = [];
  const tuples = rows.map((row, r) => {
    const placeholders = columns.map((c, i) => {
      values.push(row[c]);
      return `$${r * columns.length + i + 1}`;
    });
    return `(${placeholders.join(", ")})`;
  });

  const sql = `INSERT INTO "${table}" (${quoted}) VALUES ${tuples.join(", ")}`;
  await client.query(sql, values);
}

// Postgres text[] columns accept a JS array directly via pg; just guard nulls.
const arr = (v) => (Array.isArray(v) ? v : []);

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function seedProfile(client, entry) {
  const header = entry.header || {};
  const about = entry.about || {};
  const skills = entry.skills || {};
  const services = entry.services || {};
  const projects = entry.projects || {};
  const footer = entry.footer || {};

  const profileId = await insert(client, "profiles", {
    sureName: header.sureName,
    imageUrl: header.imageUrl ?? null,
    requestCV: header.requestCV ?? null,
    professionTexts: arr(header.professionTexts),

    experienceYears: about.experience?.years ?? null,
    experienceTitle: about.experience?.title ?? null,
    experienceDescription: about.experience?.description ?? null,

    workPermitTitle: about.workPermit?.title ?? null,
    workPermitDescription: about.workPermit?.description ?? null,

    aboutImages: arr(about.images),
    interestsTitle: about.interests?.title ?? null,
    interestsDescription: about.interests?.description ?? null,
    interestsAreas: arr(about.interests?.areas),

    updatedAt: new Date(), // @updatedAt is client-side in Prisma, so set it explicitly
  });

  // skills — category is the SkillCategory enum; pass the literal string,
  // Postgres casts it to the enum type on insert.
  await insertMany(client, "skills", [
    ...arr(skills.frontend).map((s) => ({
      category: "FRONTEND",
      label: s.label,
      value: s.value,
      color: s.color,
      profileId,
    })),
    ...arr(skills.backend).map((s) => ({
      category: "BACKEND",
      label: s.label,
      value: s.value,
      color: s.color,
      profileId,
    })),
  ]);

  await insertMany(
    client,
    "experiences",
    arr(entry.experiences).map((e) => ({
      title: e.title,
      date: e.date,
      company: e.company,
      profileId,
    }))
  );

  await insertMany(
    client,
    "educations",
    arr(entry.educations).map((e) => ({
      title: e.title,
      date: e.date,
      location: e.location,
      profileId,
    }))
  );

  await insertMany(
    client,
    "certificates",
    arr(entry.certificates).map((c) => ({
      title: c.title,
      issuer: c.issuer,
      date: c.date,
      imageUrl: c.imageUrl ?? null,
      link: c.link ?? null,
      profileId,
    }))
  );

  await insertMany(
    client,
    "articles",
    arr(entry.articles).map((a) => ({
      title: a.title,
      excerpt: a.excerpt,
      author: a.author,
      readTime: a.readTime,
      imageUrl: a.imageUrl ?? null,
      link: a.link ?? null,
      profileId,
    }))
  );

  await insertMany(
    client,
    "service_hirings",
    arr(services.hiring).map((h) => ({
      title: h.title,
      link: h.link ?? null,
      profileId,
    }))
  );

  await insertMany(
    client,
    "service_items",
    arr(services.items).map((i) => ({
      category: i.category,
      iconFont: i.iconFont ?? null,
      descriptions: arr(i.descriptions),
      profileId,
    }))
  );

  await insertMany(
    client,
    "project_categories",
    arr(projects.categories).map((c) => ({
      category: c.category,
      class: c.class,
      profileId,
    }))
  );

  await insertMany(
    client,
    "projects",
    arr(projects.items).map((p) => ({
      class: arr(p.class),
      placeHolder: p.placeHolder ?? null,
      src: p.src ?? null,
      alt: p.alt ?? null,
      url: p.url ?? null,
      profileId,
    }))
  );

  await insertMany(
    client,
    "social_links",
    arr(footer.socialLinks).map((s) => ({
      name: s.name,
      url: s.url,
      iconName: s.iconName ?? null,
      ariaLabel: s.ariaLabel ?? null,
      profileId,
    }))
  );

  await insertMany(
    client,
    "personal_skills",
    arr(footer.personalInfo?.skills).map((s) => ({
      title: s.title,
      profileId,
    }))
  );

  await insertMany(
    client,
    "freelance_profiles",
    arr(footer.profiles).map((p) => ({
      name: p.name,
      url: p.url,
      profileId,
    }))
  );

  await insertMany(
    client,
    "contact_infos",
    arr(footer.contactInfo).map((c) => ({
      type: c.type,
      iconName: c.iconName ?? null,
      content: c.content,
      url: c.url ?? null,
      isLink: c.isLink ?? false,
      className: c.className ?? null,
      profileId,
    }))
  );

  if (footer.copyright) {
    await insert(client, "copyrights", {
      year: footer.copyright.year,
      website: footer.copyright.website,
      url: footer.copyright.url ?? null,
      profileId,
    });
  }

  return { profileId, sureName: header.sureName };
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const entries = Array.isArray(raw) ? raw : [raw];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const entry of entries) {
      const { profileId, sureName } = await seedProfile(client, entry);
      console.log(`Seeded profile #${profileId} (${sureName})`);
    }

    await client.query("COMMIT");
    console.log(`Done — ${entries.length} profile(s) inserted.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed, rolled back:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();

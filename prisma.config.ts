
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// import { PrismaNeon } from "@prisma/adapter-neon"
// import { PrismaClient } from "./generated/prisma"

// const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
// const prisma = new PrismaClient({ adapter })

export default defineConfig({
  schema: 'schema.prisma',
  migrations: { path: 'migrations' },
  datasource: {
    url: process.env.POSTGRES_URL || 'file:./keystone.db',
    // only necessary if you want to use a specific shadow database
    // shadowDatabaseUrl: env('SHADOW_DATABASE_URL'),
  },
})
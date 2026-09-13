# Portfolio CMS

A modern, headless portfolio CMS built with **Keystone 6**, **Next.js 16**, **Prisma 7**, **GraphQL**, and **PostgreSQL**.

The project provides a flexible content management backend for a personal portfolio, with Keystone handling the CMS and GraphQL API, Prisma providing database access, and PostgreSQL serving as the primary database.

## ✨ Features

- 📝 **Keystone 6** headless CMS
- ⚡ **Next.js 16** and **React 19**
- 🟢 **Node.js** runtime
- 🔌 Built-in **GraphQL API**
- 🗄️ **Prisma 7** ORM
- 🐘 **PostgreSQL** database
- 🔗 Prisma PostgreSQL adapter (`@prisma/adapter-pg`)
- 🔐 Keystone authentication
- 👤 User/session management
- 📄 Document field support
- 📊 GraphQL operation logging
- ☁️ Suitable for serverless PostgreSQL deployments
- 🧩 Schema separated from Keystone configuration
- 🔄 Headless architecture for API-first content delivery

## 🏗️ Tech Stack

| Technology | Version / Role |
|---|---|
| **Next.js** | 16.x — Application framework |
| **React** | 19.x — UI library |
| **Node.js** | JavaScript runtime |
| **KeystoneJS** | 6.x — Headless CMS |
| **GraphQL** | API layer provided by Keystone |
| **Prisma** | 7.x — ORM and database toolkit |
| **PostgreSQL** | Primary relational database |
| **PrismaPg** | PostgreSQL driver adapter |
| **TypeScript** | Application language |

The project's dependencies include Keystone 6 core/authentication, Prisma 7, Next.js 16, React 19, and the PostgreSQL Prisma adapter.

## 🧩 Architecture

The application follows a headless CMS architecture:

```text
                         ┌──────────────────────┐
                         │      Portfolio       │
                         │     Next.js App      │
                         └──────────┬───────────┘
                                    │
                                    │ GraphQL
                                    ▼
                         ┌──────────────────────┐
                         │     Keystone 6       │
                         │     Headless CMS     │
                         │                      │
                         │  Authentication      │
                         │  Sessions            │
                         │  GraphQL API         │
                         └──────────┬───────────┘
                                    │
                                    │ PrismaPg
                                    ▼
                         ┌──────────────────────┐
                         │       Prisma 7       │
                         │         ORM          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     PostgreSQL       │
                         │   Serverless DB      │
                         └──────────────────────┘
```

### Data Flow

1. Content is managed through the **Keystone Admin UI**.
2. Keystone exposes the content through its **GraphQL API**.
3. GraphQL operations are handled by the Keystone backend.
4. Keystone uses **Prisma** for database access.
5. Prisma connects to PostgreSQL through the **PrismaPg adapter**.
6. The Next.js application can consume the GraphQL API to render portfolio content.

The Keystone configuration explicitly uses the PostgreSQL provider and initializes `PrismaPg` with the `POSTGRES_URL` environment variable.

## 📁 Project Structure

The Keystone configuration separates the application into dedicated schema and authentication modules:

```text
portfolio-cms/
├── auth.ts                 # Authentication and session configuration
├── keystone.ts             # Keystone application configuration
├── schema.ts               # Keystone lists / content schema
├── prisma/
│   └── migrations/         # Prisma database migrations
├── package.json
├── tsconfig.json
├── .env                    # Local environment variables
└── README.md
```

The exact project structure may contain additional Next.js components, pages, utilities, and assets.

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- **Node.js** installed
- **npm** or another Node.js package manager
- A **PostgreSQL** database
- **Git**

### 1. Clone the Repository

```bash
git clone <your-repository-url>

cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

The project runs Keystone's post-install setup automatically through the configured `postinstall` script.

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
POSTGRES_URL="postgresql://USER:PASSWORD@HOST:DATABASE"
```

The Keystone configuration reads the PostgreSQL connection string from:

```text
POSTGRES_URL
```



For example:

```env
POSTGRES_URL="postgresql://postgres:password@localhost:5432/portfolio"
```

> **Important:** Never commit your `.env` file or database credentials to Git.

## 🗄️ Database Setup

This project uses PostgreSQL with Prisma 7.

The Keystone configuration specifies:

```text
provider: postgresql
```

and uses:

```text
PrismaPg
```

as the Prisma PostgreSQL adapter.

### Apply Production Migrations

The project provides a dedicated migration script:

```bash
npm run migrate
```

This executes:

```bash
prisma migrate deploy
```



### Generate Prisma Client

If required during development:

```bash
npx prisma generate
```

## ▶️ Development

Start the Keystone development server with:

```bash
npm run dev
```

The project defines this as:

```bash
keystone dev
```



Once running, Keystone's Admin UI and GraphQL API will be available according to your Keystone configuration.

## 📦 Production

Build the application:

```bash
npm run build
```

The project maps this command to:

```bash
keystone build
```

Start the production server:

```bash
npm run start
```

which executes:

```bash
keystone start
```



## 🔌 GraphQL API

Keystone provides the project's GraphQL API.

The API acts as the primary interface between the CMS data layer and consuming applications.

A typical query might look like:

```graphql
query {
  projects {
    id
    title
    description
  }
}
```

> The available queries, mutations, fields, and relationships depend on the lists defined in `schema.ts`.

### GraphQL Monitoring

The Keystone configuration includes an Apollo plugin that logs GraphQL operations:

```text
graphql operation <operation-name>
```

It also logs errors encountered during GraphQL requests.

This can be useful during development and debugging.

## 🔐 Authentication

Authentication is configured separately from the main Keystone configuration.

The project imports:

```typescript
import { withAuth, session } from './auth.ts'
```

and wraps the Keystone configuration with:

```typescript
withAuth(...)
```

while providing the configured session to Keystone. 
This keeps authentication and session configuration separate from the core CMS configuration.

## 👤 Development Admin User

The current development configuration contains an `onConnect` hook that checks whether any users exist.

If no users exist, it creates an initial administrator account:

```text
Email:    admin@example.com
Name:     admin
Password: generated automatically
```

The password is generated randomly at startup and printed to the console.

### ⚠️ Production Warning

The existing implementation explicitly warns that this automatic user creation is intended for development and **should not be used in production**.

Before deploying to production, remove or replace this initialization logic with a secure administrator provisioning process.

## 📝 Content Schema

Keystone loads the application's content schema from:

```text
schema.ts
```

The main Keystone configuration imports:

```typescript
import { lists } from './schema.ts'
```

and passes those lists into the Keystone configuration. 
This means your portfolio's content models and relationships can be maintained independently from the main Keystone configuration.

For example, your schema can contain models such as:

```text
Portfolio
├── Projects
├── Skills
├── Technologies
├── Experience
├── Education
├── Categories
└── Users
```

> The exact models should be documented from `schema.ts`.

## 🛠️ Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Keystone development server |
| `npm run build` | Build Keystone for production |
| `npm run start` | Start production server |
| `npm run migrate` | Deploy Prisma migrations |
| `npm install` | Install dependencies and run Keystone post-install |

These commands are defined directly in the project's `package.json`.

## 🔒 Security Considerations

Before deploying this CMS to production:

- Use a secure PostgreSQL connection string.
- Store secrets in environment variables.
- Never commit `.env` files.
- Remove the automatic development admin creation.
- Use strong administrator credentials.
- Configure appropriate Keystone access controls.
- Restrict administrative access.
- Use HTTPS in production.
- Review GraphQL permissions and mutations.
- Keep dependencies updated.
- Avoid logging sensitive information.

## ☁️ Deployment

The architecture is suitable for deployment using modern cloud and serverless infrastructure.

```text
                         Internet
                            │
                            ▼
                   ┌─────────────────┐
                   │   Next.js App   │
                   └────────┬────────┘
                            │
                         GraphQL
                            │
                            ▼
                   ┌─────────────────┐
                   │   Keystone 6    │
                   │   CMS + API     │
                   └────────┬────────┘
                            │
                         Prisma
                            │
                            ▼
                   ┌─────────────────┐
                   │   PostgreSQL    │
                   │   Serverless    │
                   └─────────────────┘
```

For production deployment:

1. Configure `POSTGRES_URL`.
2. Install dependencies.
3. Deploy database migrations.
4. Build Keystone.
5. Start the production server.
6. Configure authentication and access control.
7. Remove development-only admin initialization.

Example:

```bash
npm install
npm run migrate
npm run build
npm run start
```

## 🔄 Development Workflow

```text
        ┌───────────────────┐
        │  Keystone Admin   │
        │       UI          │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │    GraphQL API    │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │     Prisma 7      │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │    PostgreSQL     │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │    Next.js App    │
        └───────────────────┘
```

The separation between CMS, API, database, and frontend allows portfolio content to be consumed independently from the presentation layer.

## 📌 Why This Architecture?

### Headless CMS

Keystone manages content independently from the frontend.

This makes it possible to reuse the same portfolio content across:

- Web applications
- Mobile applications
- Multiple frontend applications
- Static websites
- External services
- Future applications

### GraphQL

GraphQL allows clients to request only the fields they need and provides a structured API for interacting with CMS data.

### Prisma

Prisma provides a type-safe database layer between Keystone and PostgreSQL.

### PostgreSQL

PostgreSQL provides a robust relational database for structured portfolio content and relationships.

## 🔮 Future Improvements

- [x] Keystone headless CMS
- [x] GraphQL API
- [x] PostgreSQL integration
- [x] Prisma ORM
- [x] Authentication
- [x] Session management
- [x] GraphQL error logging
- [ ] Production administrator provisioning
- [ ] Image optimization/CDN
- [ ] SEO metadata management
- [ ] Draft/publishing workflow
- [ ] Content versioning
- [ ] Automated tests
- [ ] CI/CD pipeline
- [ ] API documentation
- [ ] Monitoring and observability

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

### 1. Fork the repository

### 2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

### 3. Make your changes

### 4. Commit your changes

```bash
git commit -m "Add my feature"
```

### 5. Push your branch

```bash
git push origin feature/my-feature
```

### 6. Open a Pull Request

## 📄 License

This project is licensed under the **MIT License**, unless another license is specified by the repository.

---

## 👨‍💻 About

**Portfolio CMS** is a modern headless content management system designed to manage portfolio content through **Keystone 6** and expose it through a **GraphQL API**.

The system combines:

**Next.js + KeystoneJS + GraphQL + Prisma + PostgreSQL**

to provide a flexible, API-first architecture that separates content management from content presentation.

---

### Core Stack

```text
Next.js 16
     +
KeystoneJS 6
     +
GraphQL
     +
Prisma 7
     +
PostgreSQL
     =
Modern Headless Portfolio CMS
```
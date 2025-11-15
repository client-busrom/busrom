# Busrom - International B2B Glass Hardware Product Website

> **Tech Stack**: Next.js 15 + Keystone 6 + PostgreSQL + AWS
> **Deployment**: AWS (EC2 + S3 + CloudFront + RDS)
> **Target Markets**: Global (24+ languages, excluding mainland China)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D24.11.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.6-black)](https://nextjs.org/)
[![Keystone](https://img.shields.io/badge/Keystone-6.3-purple)](https://keystonejs.com/)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Development](#-development)
- [Deployment](#-deployment)
- [Multi-language Support](#-multi-language-support)
- [Documentation](#-documentation)

---

## 🎯 Project Overview

**Busrom** is a B2B international website for showcasing glass hardware products. The platform is designed to serve global markets with:

- **24+ language support** (English, Chinese, Spanish, Portuguese, French, German, Italian, and more)
- **Headless CMS architecture** (Keystone 6 backend + Next.js 15 frontend)
- **AWS cloud infrastructure** (S3 for media, CloudFront CDN, RDS PostgreSQL)
- **SEO optimization** for international markets
- **Responsive design** with Morandi warm color palette
- **IP-based access control** (blocks mainland China via Cloudflare)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 24.11.0 LTS or higher
- **npm**: 10.0.0 or higher
- **PostgreSQL**: 15+ (or use Docker)
- **AWS Account**: S3 + CloudFront for media storage

### Installation

1. **Clone the repository** (or you're already here):
   ```bash
   cd /path/to/busrom-work
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development services** (PostgreSQL + MinIO + Nginx CDN):
   ```bash
   docker-compose up -d
   ```

   This starts:
   - **PostgreSQL** (port 5432) - Database
   - **MinIO** (port 9000, 9001) - Local S3 storage (free, no AWS costs)
   - **Nginx CDN** (port 8080) - Local CDN for media files

   See [docs/06-本地开发环境配置.md](./docs/06-本地开发环境配置.md) for details.

4. **Configure environment variables**:
   ```bash
   # Copy environment variable templates
   cp cms/.env.example cms/.env
   cp web/.env.example web/.env.local

   # Edit cms/.env
   # For local development, MinIO is pre-configured (no AWS needed!)
   # For production, update with real AWS credentials
   ```

5. **Start development servers**:
   ```bash
   # Start both CMS and Web in one command
   npm run dev

   # Or start them separately:
   npm run dev:cms  # Keystone CMS at http://localhost:3000
   npm run dev:web  # Next.js Web at http://localhost:3001
   ```

6. **Create first admin user**:
   - Visit http://localhost:3000
   - Follow the prompts to create your first admin user
   - This user will have full access to the CMS

---

## 📁 Project Structure

```
busrom-work/
├── docs/                          # 📚 Project documentation (existing)
│   ├── 00-项目总览.md
│   ├── 03-CMS数据模型/
│   └── api-contracts/
├── cms/                           # 🎛️ Keystone 6 Backend CMS
│   ├── schemas/                   # Data models
│   │   ├── User.ts                # Admin users & roles
│   │   ├── HomePage.ts            # Homepage content (singleton)
│   │   ├── Media.ts               # AWS S3 media library
│   │   ├── MediaCategory.ts       # Media categorization
│   │   ├── Category.ts            # Product categories
│   │   ├── ProductSeries.ts       # Product series/collections
│   │   └── Product.ts             # Individual products/SKUs
│   ├── keystone.ts                # Main Keystone configuration
│   ├── schema.ts                  # Schema entry point
│   ├── auth.ts                    # Authentication configuration
│   ├── package.json
│   └── .env.example
├── web/                           # 🌐 Next.js 15 Frontend
│   ├── app/                       # Next.js App Router
│   │   ├── [locale]/              # Localized routes (24 languages)
│   │   │   ├── layout.tsx         # Locale-specific layout
│   │   │   └── page.tsx           # Homepage
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Root page (redirects to /en)
│   │   └── globals.css            # Global styles
│   ├── components/                # React components
│   ├── lib/                       # Utilities
│   │   └── keystone-client.ts     # GraphQL client for Keystone
│   ├── public/                    # Static assets
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── package.json
│   └── .env.example
├── package.json                   # Monorepo root config
├── tsconfig.json                  # Global TypeScript config
├── docker-compose.yml             # PostgreSQL for local dev
└── README.md                      # This file
```

---

## 🛠️ Technology Stack

### Backend (CMS)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Keystone 6** | ^6.3.1 | Headless CMS framework |
| **PostgreSQL** | ^15.0 | Relational database (AWS RDS in production) |
| **Prisma** | ^5.22.0 | ORM (bundled with Keystone) |
| **GraphQL** | ^16.10.0 | API layer |
| **AWS SDK** | ^3.705.0 | S3 integration for media storage |

### Frontend (Web)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | ^15.6.0 | React framework (App Router) |
| **React** | ^19.1.0 | UI library |
| **TypeScript** | ^5.6.3 | Type safety |
| **Tailwind CSS** | ^3.4.17 | Utility-first CSS framework |
| **Apollo Client** | ^3.11.11 | GraphQL client |
| **next-intl** | ^3.27.2 | Internationalization |

### AWS Services

| Service | Purpose |
|---------|---------|
| **EC2** | Application hosting (CMS + Web) |
| **S3** | Media file storage (images) |
| **CloudFront** | CDN for global content delivery |
| **RDS PostgreSQL** | Production database |
| **Cloudflare** | IP-based access control (block China) |

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both CMS and Web in development mode |
| `npm run dev:cms` | Start only Keystone CMS (port 3000) |
| `npm run dev:web` | Start only Next.js Web (port 3001) |
| `npm run build` | Build both projects for production |
| `npm run build:cms` | Build only CMS |
| `npm run build:web` | Build only Web |

### CMS Development

- **Admin UI**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/api/graphql
- **Database migrations**: `npm run migrate --workspace=cms`

### Web Development

- **Frontend**: http://localhost:3001
- **Supported routes**:
  - `/` → Redirects to `/en`
  - `/[locale]` → Homepage for any supported language
  - Example: `/en`, `/zh`, `/es`, `/fr`, etc.

---

## 🌍 Multi-language Support

### Supported Languages (24 total)

**European Languages**:
- English (en), French (fr), German (de), Italian (it), Spanish (es), Portuguese (pt)
- Dutch (nl), Swedish (sv), Danish (da), Norwegian (no), Finnish (fi), Icelandic (is)

**Slavic Languages**:
- Czech (cs), Hungarian (hu), Polish (pl), Slovak (sk)

**Middle Eastern & North African**:
- Arabic (ar), Hebrew (he), Persian/Farsi (fa), Turkish (tr)
- Azerbaijani (az), Kurdish (ku), Tamazight/Berber (ber)

**Asian Languages**:
- Chinese (zh) - Traditional/Simplified

### Implementation

- **CMS**: All content fields have language-specific versions (e.g., `name_en`, `name_zh`)
- **Frontend**: Dynamic routes via `[locale]` parameter
- **RTL Support**: Automatic detection for Arabic, Hebrew, Persian
- **Fallback**: English (en) is required for all content

---

## 📚 Documentation

For detailed information, refer to the documentation in the `docs/` directory:

- **[00-项目总览.md](./docs/00-项目总览.md)** - Project overview and requirements
- **[03-CMS数据模型/](./docs/03-CMS数据模型/)** - Database schema and data models
- **[api-contracts/](./docs/api-contracts/)** - API contract examples

---

## 🔒 Security Features

- **XSS Protection**: Input sanitization and Content Security Policy headers
- **CSRF Protection**: Session-based authentication with secure cookies
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **HTTPS Only**: Force HTTPS in production
- **IP Blocking**: Mainland China IP addresses blocked via Cloudflare
- **Soft Delete**: All content uses `status` field instead of physical deletion

---

## 🚢 Deployment

### AWS Deployment Architecture

```
┌─────────────────┐
│   Cloudflare    │ ← IP filtering (block China)
│   + CloudFront  │ ← CDN
└────────┬────────┘
         │
┌────────▼────────┐
│      EC2        │ ← Next.js + Keystone
│   (t3.medium)   │
└────────┬────────┘
         │
    ┌────▼──────┐     ┌──────────┐
    │    RDS    │────▶│    S3    │
    │PostgreSQL │     │ (Media)  │
    └───────────┘     └──────────┘
```

### Deployment Steps

Detailed deployment instructions will be added in `docs/deployment.md` (to be created).

**Quick Deployment Checklist**:
1. ✅ Set up AWS S3 bucket and CloudFront distribution
2. ✅ Configure RDS PostgreSQL instance
3. ✅ Launch EC2 instance and install Node.js 24+
4. ✅ Clone repository and install dependencies
5. ✅ Configure production environment variables
6. ✅ Build both projects: `npm run build`
7. ✅ Start with PM2 or systemd
8. ✅ Set up Cloudflare for IP filtering and SSL

---

## 🤝 Contributing

This is a private project. For internal team members:

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "Add your feature"`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Create a Pull Request for review

---

## 📝 License

Proprietary - All rights reserved by Busrom

---

## 🆘 Troubleshooting

### Common Issues

**PostgreSQL Connection Error**:
```bash
# Make sure Docker container is running
docker-compose ps
docker-compose up -d
```

**Port Already in Use**:
```bash
# Find and kill the process using port 3000 or 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Keystone Migration Errors**:
```bash
# Reset the database (development only!)
cd cms
npm run migrate -- --reset
```

**AWS S3 Upload Errors**:
- Check your AWS credentials in `cms/.env`
- Verify S3 bucket permissions
- Ensure CloudFront distribution is configured

---

## 📧 Support

For questions or issues, contact the development team:

- **Technical Lead**: [Your Name]
- **Email**: [your-email@busrom.com]
- **Documentation**: See `docs/` directory

---

**Last Updated**: 2025-11-01
**Version**: 1.0.0

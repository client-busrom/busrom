# Busrom - International B2B Glass Hardware Product Website

> **Tech Stack**: Next.js 15 + Payload CMS 3 + PostgreSQL + AWS
> **Deployment**: AWS (ECS Fargate + S3 + CloudFront + RDS)
> **Target Markets**: Global (24+ languages, excluding mainland China)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Payload CMS](https://img.shields.io/badge/Payload-3.0-blue)](https://payloadcms.com/)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Development](#development)
- [Deployment](#deployment)
- [Multi-language Support](#multi-language-support)

---

## Project Overview

**Busrom** is a B2B international website for showcasing glass hardware products. The platform is designed to serve global markets with:

- **24+ language support** (English, Chinese, Spanish, Portuguese, French, German, Italian, and more)
- **Headless CMS architecture** (Payload CMS 3 backend + Next.js 15 frontend)
- **AWS cloud infrastructure** (ECS Fargate, S3 for media, CloudFront CDN, RDS PostgreSQL)
- **SEO optimization** for international markets
- **Responsive design** with Morandi warm color palette
- **IP-based access control** (blocks mainland China via Cloudflare)

---

## Quick Start

### Prerequisites

- **Node.js**: 20.0.0 LTS or higher
- **npm**: 10.0.0 or higher
- **Docker**: For local PostgreSQL and MinIO
- **AWS Account**: S3 + CloudFront for media storage (production)

### Installation

1. **Clone the repository**:
   ```bash
   cd /path/to/busrom-work
   ```

2. **Start local development services** (PostgreSQL + MinIO + Nginx CDN):
   ```bash
   docker-compose up -d
   ```

   This starts:
   - **PostgreSQL** (port 5432) - Database
   - **MinIO** (port 9000, 9001) - Local S3 storage (free, no AWS costs)
   - **Nginx CDN** (port 8080) - Local CDN for media files

3. **Install dependencies**:
   ```bash
   # Install Payload CMS dependencies
   cd payload-cms && npm install

   # Install Web dependencies
   cd ../web && npm install
   ```

4. **Configure environment variables**:
   ```bash
   # Copy environment variable templates
   cp payload-cms/.env.example payload-cms/.env
   cp web/.env.example web/.env.local
   ```

5. **Start development servers**:
   ```bash
   # Start Payload CMS (port 3002)
   cd payload-cms && npm run dev

   # In another terminal, start Web (port 3001)
   cd web && npm run dev
   ```

6. **Access the applications**:
   - **Payload CMS Admin**: http://localhost:3002/admin
   - **Web Frontend**: http://localhost:3001
   - **MinIO Console**: http://localhost:9001 (minioadmin / minioadmin123)

---

## Project Structure

```
busrom-work/
├── docs/                          # Project documentation
├── payload-cms/                   # Payload CMS 3 Backend
│   ├── src/
│   │   ├── collections/           # Data models (Media, Products, etc.)
│   │   ├── globals/               # Global settings (PreloaderConfig, etc.)
│   │   ├── components/            # Custom admin components
│   │   └── hooks/                 # Payload hooks
│   ├── payload.config.ts          # Main Payload configuration
│   ├── package.json
│   └── .env.example
├── web/                           # Next.js 15 Frontend
│   ├── app/                       # Next.js App Router
│   │   └── [locale]/              # Localized routes (24 languages)
│   ├── components/                # React components
│   ├── lib/                       # Utilities
│   │   └── api/                   # API clients for Payload CMS
│   ├── public/                    # Static assets
│   ├── next.config.js
│   ├── package.json
│   └── .env.example
├── docker/                        # Docker configurations
│   └── nginx/                     # Local CDN config
├── .github/workflows/             # GitHub Actions
│   ├── ci.yml                     # CI pipeline
│   └── deploy-aws.yml             # AWS deployment
├── docker-compose.yml             # Local development services
├── Dockerfile.payload-cms         # Payload CMS Docker image
├── Dockerfile.web                 # Web Docker image
└── README.md                      # This file
```

---

## Technology Stack

### Backend (CMS)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Payload CMS** | ^3.0 | Headless CMS framework |
| **PostgreSQL** | ^15.0 | Relational database (AWS RDS in production) |
| **Drizzle ORM** | - | Database ORM (bundled with Payload) |
| **AWS SDK** | ^3.x | S3 integration for media storage |

### Frontend (Web)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | ^15.0 | React framework (App Router) |
| **React** | ^19.0 | UI library |
| **TypeScript** | ^5.6 | Type safety |
| **Tailwind CSS** | ^3.4 | Utility-first CSS framework |
| **GSAP** | ^3.x | Animations |
| **Three.js** | ^0.x | 3D graphics |

### AWS Services

| Service | Purpose |
|---------|---------|
| **ECS Fargate** | Container hosting (CMS + Web) |
| **S3** | Media file storage (images) |
| **CloudFront** | CDN for global content delivery |
| **RDS PostgreSQL** | Production database |
| **ECR** | Docker image registry |
| **Cloudflare** | IP-based access control (block China) |

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:cms` | Start Payload CMS (port 3002) |
| `npm run dev:web` | Start Next.js Web (port 3001) |
| `npm run build:cms` | Build Payload CMS for production |
| `npm run build:web` | Build Web for production |

### Payload CMS Development

- **Admin UI**: http://localhost:3002/admin
- **REST API**: http://localhost:3002/api
- **GraphQL Playground**: http://localhost:3002/api/graphql

### Web Development

- **Frontend**: http://localhost:3001
- **Supported routes**:
  - `/` → Redirects to `/en`
  - `/[locale]` → Homepage for any supported language

---

## Multi-language Support

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

---

## Deployment

### AWS Architecture

```
                    ┌─────────────────┐
                    │   Cloudflare    │ ← IP filtering (block China)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   CloudFront    │ ← CDN (Media + API Cache)
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
     ┌────────▼────────┐           ┌────────▼────────┐
     │   ECS Fargate   │           │   ECS Fargate   │
     │  (Payload CMS)  │           │     (Web)       │
     └────────┬────────┘           └────────┬────────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                    ┌────────▼────────┐
                    │ RDS PostgreSQL  │
                    └─────────────────┘
                             │
                    ┌────────▼────────┐
                    │   S3 (Media)    │
                    └─────────────────┘
```

### Deployment via GitHub Actions

Push to `main` branch triggers automatic deployment to production:
1. Build Docker images
2. Push to ECR
3. Deploy to ECS Fargate
4. Health check

---

## Security Features

- **XSS Protection**: Input sanitization and Content Security Policy headers
- **CSRF Protection**: Session-based authentication with secure cookies
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **HTTPS Only**: Force HTTPS in production
- **IP Blocking**: Mainland China IP addresses blocked via Cloudflare
- **Soft Delete**: All content uses `status` field instead of physical deletion

---

## Troubleshooting

### Common Issues

**PostgreSQL Connection Error**:
```bash
# Make sure Docker container is running
docker-compose ps
docker-compose up -d
```

**Port Already in Use**:
```bash
# Find and kill the process using port 3001 or 3002
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

**AWS S3 Upload Errors**:
- Check your AWS credentials in `payload-cms/.env`
- Verify S3 bucket permissions
- Ensure CloudFront distribution is configured

---

## License

Proprietary - All rights reserved by Busrom

---

**Last Updated**: 2025-12-20
**Version**: 2.0.0

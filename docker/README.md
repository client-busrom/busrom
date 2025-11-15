# Docker Configuration

This directory contains Docker-related configuration files for the Busrom project.

## 📁 Directory Structure

```
docker/
├── nginx/
│   └── cdn.conf          # Nginx CDN configuration (simulates CloudFront)
└── README.md             # This file
```

## 🔧 Configuration Files

### nginx/cdn.conf

Nginx configuration that provides:
- Caching layer in front of MinIO
- CORS support for local development
- Cache-Control headers
- Proxy settings for MinIO S3 API

**Used by**: `nginx-cdn` service in docker-compose.yml

## 📚 Documentation

See [docs/06-本地开发环境配置.md](../docs/06-本地开发环境配置.md) for complete setup instructions.

## 🚀 Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

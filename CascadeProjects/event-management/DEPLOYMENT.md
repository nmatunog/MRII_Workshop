# Event Management System Deployment Guide

## Prerequisites

1. **System Requirements**
   - Docker and Docker Compose installed
   - Node.js (v18 or higher)
   - PostgreSQL (v14 or higher)
   - Nginx (for SSL)
   - Certbot (for SSL certificates)

2. **Install Required Tools**
```bash
# Install Docker and Docker Compose
# On Ubuntu/Debian:
sudo apt-get update
sudo apt-get install docker.io docker-compose

# On macOS:
# Install via Homebrew
brew install docker docker-compose

# Install Certbot
sudo apt-get install certbot python3-certbot-nginx  # Ubuntu/Debian
brew install certbot                               # macOS
```

## 1. Local Development Setup

1. **Clone the Repository**
```bash
git clone [your-repository-url]
cd event-management
```

2. **Copy Environment Variables**
```bash
cp .env.example .env
```

3. **Edit Environment Variables**
Edit `.env` file and set:
- Database credentials
- JWT secret
- Stripe keys
- Monitoring settings
- Other configuration values

4. **Start Development Containers**
```bash
docker-compose up -d
```

## 2. Production Deployment

1. **Prepare Production Environment**

   a. **Create Production Environment File**
   ```bash   cp .env.example .env.production   ```

   b. **Configure SSL**
   ```bash   # Create SSL configuration   cp nginx-ssl.conf nginx.conf   # Run SSL setup script   ./setup-ssl.sh   ```

2. **Build and Deploy**

   a. **Build Docker Images**
   ```bash   # Build images   docker-compose -f docker-compose.yml build   ```

   b. **Deploy Application**
   ```bash   # Start containers   docker-compose -f docker-compose.yml up -d   ```

3. **Verify Deployment**

   a. **Check Container Status**
   ```bash   docker-compose ps   ```

   b. **Check Logs**
   ```bash   docker-compose logs -f   ```

   c. **Verify Services**
   - Frontend: http://your-domain.com
   - Backend API: http://your-domain.com/api
   - Database: Check connection via psql
   - Monitoring: Access Grafana dashboard

## 3. Monitoring Setup

1. **Access Grafana Dashboard**
   - Default URL: http://localhost:3000 (or your domain)
   - Default credentials: admin/admin

2. **Verify Metrics**
   - Check service status
   - Monitor request rates
   - Check memory usage
   - Verify database metrics

## 4. Backup and Maintenance

1. **Database Backup**
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres events > backup.sql

# Restore backup
docker-compose exec postgres psql -U postgres events < backup.sql
```

2. **Update Application**
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

## Troubleshooting

1. **Common Issues**

   - **Container Not Starting**
   ```bash   docker-compose logs -f <service-name>   ```

   - **Database Connection Issues**
   ```bash   docker-compose exec postgres psql -U postgres events   ```

   - **SSL Issues**
   ```bash   sudo certbot renew   ```

2. **Service Recovery**
```bash
# Restart specific service
docker-compose restart <service-name>

# Restart all services
docker-compose restart
```

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use secure secrets management
   - Regularly rotate sensitive credentials

2. **SSL/TLS**
   - Always use HTTPS
   - Keep SSL certificates up to date
   - Use HSTS headers

3. **Regular Updates**
   - Keep Docker images updated
   - Regular security patches
   - Monitor for vulnerabilities

## Next Steps

1. **Configure Domain**
   - Point domain to server IP
   - Configure DNS settings
   - Set up SSL certificates

2. **Set Up Monitoring Alerts**
   - Configure Grafana alerts
   - Set up email notifications
   - Monitor system resources

3. **Backup Schedule**
   - Set up automated backups
   - Test backup restoration
   - Keep multiple backup copies

4. **Security Hardening**
   - Configure firewall rules
   - Set up rate limiting
   - Enable security headers
   - Regular security audits

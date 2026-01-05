# Docker Setup Guide for WayFinder Backend

## 🐳 Local Development & Testing

### Prerequisites
- Docker Desktop installed
- Mobile app configured to point to your local IP

### 1. Build the Docker Image
```bash
cd backend
docker build -t wayfinder-backend .
```

### 2. Run with Docker Compose (Recommended)
```bash
docker-compose up -d
```

### 3. Or Run Directly
```bash
docker run -d \
  --name wayfinder-backend \
  -p 5000:5000 \
  --env-file .env \
  wayfinder-backend
```

### 4. Configure Mobile App
Update your mobile app to connect to:
- **Same WiFi**: `http://<YOUR_LOCAL_IP>:5000`
- Find your IP:
  - Windows: `ipconfig` (look for IPv4)
  - Mac/Linux: `ifconfig` or `ip addr`

Example: `http://192.168.1.100:5000`

### Useful Commands
```bash
# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# Check if running
docker ps

# Enter container shell
docker exec -it wayfinder-backend sh
```

---

## 🚀 CI/CD Workflow (GitHub Actions → Docker Hub → VPS)

### Workflow Overview
```
Code Push → GitHub Actions → Build Image → Push to Docker Hub → SSH to VPS → Pull Image → Run Container
```

### Setup Steps

#### 1. Create Docker Hub Repository
- Go to hub.docker.com
- Create repository: `your-username/wayfinder-backend`

#### 2. Add GitHub Secrets
In your GitHub repo: Settings → Secrets and variables → Actions

Required secrets:
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token (not password!)
- `VPS_HOST`: Your VPS IP address
- `VPS_USER`: SSH username (usually `root` or `ubuntu`)
- `VPS_SSH_KEY`: Private SSH key for VPS access
- `ENV_FILE`: Your production `.env` file contents

#### 3. Generate Docker Hub Token
1. Docker Hub → Account Settings → Security → New Access Token
2. Copy the token (shows only once!)
3. Add to GitHub Secrets as `DOCKERHUB_TOKEN`

#### 4. Generate SSH Key for VPS
```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions" -f github-actions-key

# Copy public key to VPS
ssh-copy-id -i github-actions-key.pub user@your-vps-ip

# Or manually add to VPS
cat github-actions-key.pub
# Then on VPS: echo "PUBLIC_KEY_CONTENT" >> ~/.ssh/authorized_keys

# Copy private key content to GitHub Secret
cat github-actions-key
```

---

## 📦 GitHub Actions Workflow

Create: `.github/workflows/deploy.yml`

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/wayfinder-backend:latest
            ${{ secrets.DOCKERHUB_USERNAME }}/wayfinder-backend:${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/wayfinder-backend:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/wayfinder-backend:buildcache,mode=max

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            # Create app directory
            mkdir -p /opt/wayfinder
            cd /opt/wayfinder

            # Create .env file
            cat > .env << 'EOF'
            ${{ secrets.ENV_FILE }}
            EOF

            # Pull latest image
            docker pull ${{ secrets.DOCKERHUB_USERNAME }}/wayfinder-backend:latest

            # Stop old container
            docker stop wayfinder-backend || true
            docker rm wayfinder-backend || true

            # Run new container
            docker run -d \
              --name wayfinder-backend \
              --restart unless-stopped \
              -p 5000:5000 \
              --env-file .env \
              ${{ secrets.DOCKERHUB_USERNAME }}/wayfinder-backend:latest

            # Clean up old images
            docker image prune -af --filter "until=72h"

            # Show status
            docker ps | grep wayfinder-backend
```

---

## 🔧 VPS Preparation

### Install Docker on VPS
```bash
# SSH into VPS
ssh user@your-vps-ip

# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (optional, avoids sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### Configure Firewall
```bash
# Allow port 5000
sudo ufw allow 5000/tcp
sudo ufw reload
```

### Setup Nginx Reverse Proxy (Optional but Recommended)
```bash
# Install Nginx
sudo apt install nginx

# Create config
sudo nano /etc/nginx/sites-available/wayfinder
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/wayfinder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🎯 Testing the Setup

### 1. Test Locally
```bash
# Check container is running
docker ps

# Test endpoint
curl http://localhost:5000/health

# From mobile (same WiFi)
curl http://192.168.1.100:5000/health
```

### 2. Test on VPS
```bash
# After deployment
curl http://your-vps-ip:5000/health

# Or with domain
curl https://api.yourdomain.com/health
```

### 3. Update Mobile App Config
```typescript
// mobile/constants/api.config.ts
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:5000'  // Local development
  : 'https://api.yourdomain.com'; // Production VPS
```

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker logs wayfinder-backend

# Common issues:
# - Port already in use: Change port mapping
# - Missing env vars: Check .env file
# - Database connection: Verify PRISMA_ACCELERATE_URL
```

### Can't connect from mobile
- Check firewall: `sudo ufw status`
- Verify Docker port mapping: `docker port wayfinder-backend`
- Ensure same WiFi network
- Check mobile app uses correct IP

### GitHub Actions failing
- Verify all secrets are set correctly
- Check Docker Hub credentials
- Test SSH connection manually: `ssh -i key user@vps-ip`
- Review Actions logs on GitHub

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)

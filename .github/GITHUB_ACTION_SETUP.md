# GitHub Actions Setup Guide

## 🚀 Current Status: Docker Hub Push Only

The GitHub Action is configured to:
- ✅ Build Docker image on code push
- ✅ Push to Docker Hub
- 💤 VPS deployment (commented out - activate when ready)

---

## 📋 Initial Setup Do This Once

### 1. Create Docker Hub Repository
1. Go to [hub.docker.com](https://hub.docker.com)
2. Click **"Create Repository"**
3. Name it: `wayfinder-backend`
4. Set to **Public** or **Private** (your choice)

### 2. Generate Docker Hub Access Token
1. Docker Hub → **Account Settings** → **Security**
2. Click **"New Access Token"**
3. Description: `GitHub Actions`
4. Permissions: **Read, Write, Delete**
5. **Copy the token** (shows only once!)

### 3. Add Secrets to GitHub Repository

Go to your GitHub repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

**Required secrets (for Docker Hub push):**

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | e.g., `johnsmith` |
| `DOCKERHUB_TOKEN` | Access token from step 2 | Copy from Docker Hub |

**Optional secrets (for VPS deployment - add when ready):**

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `VPS_HOST` | VPS IP address | e.g., `123.45.67.89` |
| `VPS_USER` | SSH username | Usually `root` or `ubuntu` |
| `VPS_SSH_KEY` | Private SSH key | Generate with `ssh-keygen` (see below) |
| `ENV_FILE` | Production .env contents | Copy from your `.env` file |

---

## 🔄 Daily Workflow: Pushing Code Changes

### When You Change/Add Code:

1. **Make your code changes** in the `backend/` folder

2. **Test locally** (optional but recommended):
   ```powershell
   cd backend
   docker-compose up -d --build
   docker-compose logs -f
   ```

3. **Commit and push to GitHub**:
   ```powershell
   git add .
   git commit -m "Add new feature"
   git push origin main
   ```

4. **GitHub Action automatically triggers** and:
   - Builds Docker image
   - Pushes to Docker Hub
   - (Later: Deploys to VPS)

5. **Check progress**:
   - Go to GitHub repo → **Actions** tab
   - See the workflow running in real-time
   - Green ✓ = Success, Red ✗ = Failed

### View Build Status

In your GitHub repo, click the **Actions** tab to see:
- ✅ Build logs
- ⏱️ Build time
- 📦 Image tags pushed

---

## 🖥️ VPS Setup (When You Buy VPS)

### 1. Prepare Your VPS

SSH into your VPS:
```bash
ssh root@your-vps-ip
```

**Install Docker:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

**Configure Firewall:**
```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Allow your backend port
sudo ufw allow 5000/tcp

# Enable firewall
sudo ufw enable
```

### 2. Generate SSH Key for GitHub Actions

**On your local machine:**
```powershell
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions" -f github-actions-key

# This creates:
# - github-actions-key (private key) → Add to GitHub Secrets
# - github-actions-key.pub (public key) → Add to VPS
```

**Copy public key to VPS:**
```powershell
# View public key
cat github-actions-key.pub

# Then SSH into VPS and add it
ssh root@your-vps-ip
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Add private key to GitHub Secrets:**
```powershell
# View private key
cat github-actions-key

# Copy the entire output (including -----BEGIN and -----END lines)
# Add to GitHub Secrets as VPS_SSH_KEY
```

### 3. Add VPS Secrets to GitHub

Add these secrets in GitHub → Settings → Secrets and variables → Actions:

```
VPS_HOST = 123.45.67.89
VPS_USER = root
VPS_SSH_KEY = (paste entire private key)
ENV_FILE = (paste your production .env contents)
```

### 4. Activate VPS Deployment in Workflow

Edit `.github/workflows/deploy-backend.yml`:

**Uncomment the VPS deployment section:**
```yaml
# Remove the # symbols from lines 48-92
# The section starting with: deploy-to-vps:
```

**Save, commit, and push:**
```powershell
git add .github/workflows/deploy-backend.yml
git commit -m "Activate VPS deployment"
git push origin main
```

### 5. Test VPS Deployment

**After push, GitHub Action will:**
1. Build image
2. Push to Docker Hub
3. SSH into VPS
4. Pull image
5. Start container

**Verify on VPS:**
```bash
# SSH into VPS
ssh root@your-vps-ip

# Check container is running
docker ps

# View logs
docker logs wayfinder-backend

# Test endpoint
curl http://localhost:5000/health
```

---

## 🔧 Optional: Setup Domain with Nginx + SSL

### Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

### Create Nginx Config
```bash
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

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/wayfinder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Setup SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## 🐛 Troubleshooting

### GitHub Action Fails

**Check logs:**
- GitHub repo → Actions tab → Click the failed workflow
- Read the error message

**Common issues:**
- ❌ Docker Hub credentials wrong → Check secrets
- ❌ Syntax error in Dockerfile → Test locally first
- ❌ Missing secrets → Add all required secrets

### Can't Connect to VPS

**Test SSH manually:**
```powershell
ssh -i github-actions-key root@your-vps-ip
```

If this fails:
- Check VPS firewall allows port 22
- Verify SSH key is correct
- Check VPS_USER is correct (root/ubuntu/etc)

### Container Won't Start on VPS

**SSH into VPS and check:**
```bash
# View logs
docker logs wayfinder-backend

# Common issues:
docker ps -a  # Check if container exited
docker port wayfinder-backend  # Check port mapping
```

---

## 📊 Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CODE CHANGE (backend/)                                   │
│    ↓                                                         │
│ 2. GIT PUSH (to main branch)                                │
│    ↓                                                         │
│ 3. GITHUB ACTION TRIGGERS                                    │
│    ├─ Build Docker image                                     │
│    ├─ Push to Docker Hub                                     │
│    └─ [When ready] Deploy to VPS                             │
│                                                              │
│ 4. VIEW PROGRESS (GitHub Actions tab)                        │
│                                                              │
│ 5. TEST (curl your-vps-ip:5000/health)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist

**Phase 1: Docker Hub Only (Now)**
- [ ] Create Docker Hub account & repository
- [ ] Generate Docker Hub access token
- [ ] Add `DOCKERHUB_USERNAME` secret to GitHub
- [ ] Add `DOCKERHUB_TOKEN` secret to GitHub
- [ ] Push code and verify workflow runs successfully

**Phase 2: VPS Deployment (Later)**
- [ ] Buy VPS
- [ ] Install Docker on VPS
- [ ] Configure VPS firewall
- [ ] Generate SSH keys for GitHub Actions
- [ ] Add VPS secrets to GitHub
- [ ] Uncomment VPS deployment in workflow
- [ ] Test deployment
- [ ] (Optional) Setup Nginx + SSL

---

## 🎯 Quick Commands Reference

```powershell
# Daily development
cd backend
docker-compose up -d --build  # Test locally
git add .
git commit -m "Your message"
git push origin main          # Triggers GitHub Action

# Check GitHub Action status
# Go to: github.com/your-username/your-repo/actions

# When you have VPS
ssh root@your-vps-ip
docker ps                     # Check containers
docker logs wayfinder-backend # View logs
docker pull username/wayfinder-backend:latest  # Manual pull
```

---

**🎉 You're all set! Push your code and watch the magic happen!**

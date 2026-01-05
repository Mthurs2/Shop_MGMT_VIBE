# First Run (Ubuntu VPS)

1. Install Docker + Compose
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose-plugin
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. Clone repo and configure env
   ```bash
   git clone <your-repo-url>
   cd Shop_MGMT_VIBE
   cp .env.prod.example .env.prod
   ```
   Edit `.env.prod` with secure secrets and your domain.

3. Start services
   ```bash
   docker compose -f infra/docker-compose.prod.yml up -d --build
   ```

4. Run migrations and seed initial tenant
   ```bash
   docker compose -f infra/docker-compose.prod.yml exec api npx prisma migrate deploy
   docker compose -f infra/docker-compose.prod.yml exec api npx prisma db seed
   ```
   Use the `POST /auth/signup` endpoint to create the first tenant and owner.

5. Confirm HTTPS
   Visit `https://your-domain.com` and `https://your-domain.com/docs`.

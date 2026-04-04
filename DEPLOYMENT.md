# GigShield (CODEZILLA) Deployment Guide

This guide provides step-by-step instructions on how to host both the Frontend (React/Vite) and Backend (Django) parts of this platform. For modern, cost-effective, and fast deployment, we recommend **Vercel** for the Frontend and **Render** (or **Railway**) for the Backend.

---

## 1. Backend Deployment (Render / Railway)

We recommend using [Render.com](https://render.com/) as it offers a free/cheap tier for both PostgreSQL databases and Django web services.

### Prerequisites for Backend
1. **Requirements File:** Ensure you have a `requirements.txt` file in your `backend/` folder. If not, generate one by running `pip freeze > requirements.txt`.
2. **Procfile:** Although Render doesn't strictly require it, adding a `render.yaml` or setting the Start Command is necessary. Wait, for Render, you just need a start command.

### Steps to Deploy
1. **Create a PostgreSQL Database:**
   * Go to Render Dashboard -> New -> PostgreSQL.
   * Name your database (e.g., `gigshield-db`).
   * Once created, copy the **Internal Database URL**.

2. **Create a Web Service:**
   * Go to Render Dashboard -> New -> Web Service.
   * Connect your GitHub repository.
   * **Root Directory:** Set this to `backend`
   * **Environment:** Select `Python`
   * **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   * **Start Command:** `uvicorn core.asgi:application --host 0.0.0.0 --port $PORT`

3. **Environment Variables:** Set the following variables in the Render settings:
   * `DEBUG` = `False`
   * `CURRENT_ENV` = `production`
   * `SECRET_KEY` = `<Generate a long random secure string>`
   * `DATABASE_URL` = `<Paste the Internal Database URL from Step 1>`
   * `ALLOWED_HOSTS` = `*` (Or precisely your Render URL and Frontend URL)
   * `MAPPLS_CLIENT_ID` = `<Your Client ID>`
   * `MAPPLS_CLIENT_SECRET` = `<Your Secret>`
   * `MAPPLS_API_KEY` = `<Your KEY>`
   * `OPEN_METEO_BASE_URL` = `https://api.open-meteo.com/v1/forecast`
   * `CORS_ALLOWED_ORIGINS` = `<Your Frontend URL>` (e.g., `https://gigshield.vercel.app`)

4. **Deploy & Migrate:** Click "Create Web Service". Render will automatically build, apply your database migrations, and go live. Copy the live API URL (e.g., `https://gigshield-api.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

Vercel provides seamless deployment for Vite/React applications.

### Steps to Deploy
1. **Push your code to GitHub:** Ensure your latest frontend changes are pushed.
2. **Import Project to Vercel:**
   * Go to [Vercel](https://vercel.com/) and click "Add New Project".
   * Import your GitHub repository.
3. **Configure the Build Details:**
   * **Framework Preset:** Vercel should auto-detect **Vite**.
   * **Root Directory:** Since your code is inside a subfolder, click 'Edit' and change the root directory to `frontend`.
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
   * **Install Command:** `npm install`
4. **Environment Variables:**
   * Expand the "Environment Variables" tab.
   * Add your API connection URL so that the React app knows where to fetch data from.
   * `VITE_API_URL` = `https://gigshield-api.onrender.com/api` (Use the URL generated from your backend deployment).
5. **Deploy:** Click "Deploy". Vercel will build the frontend and provide you with a live, SSL-secured domain name.

### Handling Client-Side Routing (Vercel.json)
If you encounter 404 errors when refreshing pages on Vercel, create a `vercel.json` file inside the `frontend/` directory with the following configuration:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 3. Alternative: Completely Free VPS Deployment (Oracle Cloud / GCP)

If you want to host both the Django Backend and PostgreSQL Database on a single machine entirely for **free**, a Virtual Private Server (VPS) is the best option.

### Recommended Free VPS Providers
1. **Oracle Cloud (Always Free Tier):** The best free tier available. You get up to 4 ARM-based instances with 24GB RAM, or 2 AMD micro instances. This is more than enough to run both PostgreSQL and Django simultaneously.
2. **Google Cloud Platform (GCP):** Offers one `e2-micro` instance per billing account per month for free (with 1GB RAM) in specific US regions.
3. **AWS EC2 (Free Tier):** Offers a `t2.micro` or `t3.micro` instance (1GB RAM) free for 12 months.

### Typical VPS Setup Steps (Using Docker/Docker Compose)
Running services on a VPS is easiest with Docker Compose:

1. **Provision the Server:** Launch an Ubuntu instance on Oracle Cloud or GCP.
2. **Setup SSH:** SSH into your server (`ssh ubuntu@<your-server-ip>`).
3. **Install Dependencies:**
   ```bash
   sudo apt update && sudo apt install docker.io docker-compose -y
   ```
4. **Clone the Repository:**
   ```bash
   git clone https://github.com/Deb123ayan/CODEZILLA.git
   cd CODEZILLA/backend
   ```
5. **Create a `docker-compose.yml` (Example):**
   ```yaml
   version: '3.8'
   services:
     db:
       image: postgres:15
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: root
         POSTGRES_DB: insurance_db
       volumes:
         - pgdata:/var/lib/postgresql/data
     web:
       build: .
       command: uvicorn core.asgi:application --host 0.0.0.0 --port 8000
       ports:
         - "8000:8000"
       depends_on:
         - db
       environment:
         - DATABASE_URL=postgres://postgres:root@db:5432/insurance_db
   volumes:
     pgdata:
   ```
6. **Run the Services:**
   ```bash
   sudo docker-compose up -d
   ```
7. **Expose Ports:** Ensure port `8000` is open in the VPS firewall (VCN security list in Oracle, or VPC Firewall rules in GCP).

---

## 4. Post-Deployment Checklist
- [ ] Visit the Vercel frontend URL and register a worker.
- [ ] Monitor the backend logs on Render to ensure API hits are coming through.
- [ ] Confirm that your `ALLOWED_HOSTS` in Django strictly contains your Vercel domains for security.
- [ ] Create an admin superuser on your production backend using Render's terminal: `python manage.py createsuperuser` and access the dashboard.

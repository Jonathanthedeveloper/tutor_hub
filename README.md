# Tutor Hub Platform

> **⚠️ Educational Project Notice**
> This application is **not production-ready** and was built solely for **educational and demonstration purposes**. It should not be deployed to production environments or used to handle real user data without significant security audits, hardening, and architectural review.

Tutor Hub is a virtual classroom scheduling and learning management platform built using modern React, Drizzle ORM, MariaDB, and self-hosted Jitsi Meet. It allows tutors to schedule live virtual sessions, manage courses, and hosts built-in video meetings for students.

---

## Tech Stack & Features

- **Frontend Framework**: [TanStack Start](https://tanstack.com/router/latest/docs/start/overview) (React 19 + Vite + SSR)
- **Styling & Components**: Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **State Management & Data Fetching**: TanStack Query (React Query)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/) with MariaDB
- **Video Conferencing**: Self-hosted Jitsi Meet cluster (Prosody, Jicofo, JVB, Nginx Web wrapper) running in Docker

---

## 🚀 Quick Start (Dockerized Development)

To spin up the entire stack (web app, database, Jitsi Meet virtual classrooms, and Adminer UI) in a single command:

### Step 1: Generate Environment Credentials

Run the script to automatically copy the template environment and generate secure passwords and keys:

```bash
./gen-passwords.sh
```

This creates a custom `.env` file. You can review/edit the credentials, SMTP server, or S3 configurations there.

### Step 2: Spin Up the Stack

Run Docker Compose (which automatically loads the `.env` file from the root):

```bash
docker compose up --build
```

> [!NOTE]
> Out of the box, standard defaults are baked into `docker-compose.yml`, so you can also just run `docker compose up --build` if you want a zero-configuration launch.

### Step 3: Access the Services

Once the containers are active:

- **Tutor Hub Web App**: [http://localhost:3000](http://localhost:3000)
- **Adminer DB Viewer**: [http://localhost:8080](http://localhost:8080)
- **Local Jitsi Meet Service**: [https://localhost:8443](https://localhost:8443) (For SSL WebRTC)

---

## Local Desktop Development (Without Dockerizing the Web App)

If you prefer hot-reloading the web app directly on your host machine while keeping only the database running in Docker:

### Step 1: Install Dependencies

Ensure you have [Bun](https://bun.sh) installed, then run:

```bash
bun install
```

### Step 2: Spin Up the Database

Start only the MariaDB service:

```bash
docker compose up -d db
```

### Step 3: Setup Environment & Database

Create a local `.env.local` file in the root of the project (so Vite and TanStack Start load it during host development without conflicting with the docker `.env` file) with your database and environment settings:

```env
DATABASE_URL="mysql://root:f406f2b5236376a59b41d19b6026320a@127.0.0.1:3306/tutor_hub"
BETTER_AUTH_SECRET="your_generated_secret"
BETTER_AUTH_URL="http://localhost:3000"
JITSI_DOMAIN="localhost:8443"
JITSI_APP_ID="tutor_hub"
JITSI_JWT_SECRET="your_jitsi_jwt_secret"
```

Push the database schemas and run migrations:

```bash
bun run db:push
```

### Step 4: Run the Server

Launch the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚠️ Critical Troubleshooting: Jitsi SSL Certificate Warning

Since Jitsi runs locally on port `8443` over HTTPS using a self-signed certificate, your browser will by default block Jitsi's meeting script load due to invalid authority (`net::ERR_CERT_AUTHORITY_INVALID`).

### How to Resolve

1. In your browser, open a new tab and navigate to: **[https://localhost:8443](https://localhost:8443)**
2. You will see a warning page saying *"Your connection is not private"*.
3. Click on **Advanced** (or **Show Details**) and then select **Proceed to localhost (unsafe)** or **Trust Certificate**.
4. You will see Jitsi's empty landing screen. Close this tab.
5. Go back to Tutor Hub ([http://localhost:3000](http://localhost:3000)) and refresh. The meeting iframe will now load seamlessly!

---

## 🔑 Environment Variables Reference

The following environment variables configure the application's runtime. You can specify these in a local `.env.local` file for host execution, or edit the generated `.env` for containerized execution.

| Variable Name | Default Value / Action | Purpose |
| :--- | :--- | :--- |
| **`DATABASE_URL`** | `mysql://root:...@db:3306/tutor_hub` | Full connection URI used by Drizzle ORM to access the MariaDB instance. |
| **`DB_PASSWORD`** | Auto-generated / fallback | The root password for the MariaDB database container. |
| **`DB_DATABASE`** | `tutor_hub` | The database name initialized inside the MariaDB container. |
| **`BETTER_AUTH_SECRET`** | Auto-generated / fallback | Secure key used by Better Auth to sign session tokens and cookies. |
| **`BETTER_AUTH_URL`** | `http://localhost:3000` | The primary canonical URL of the Tutor Hub web application. |
| **`JITSI_DOMAIN`** | `localhost:8443` | The domain and port used by clients to fetch script assets and load the Jitsi Meet frame. |
| **`JITSI_APP_ID`** | `tutor_hub` | JWT Application ID to associate token requests with Prosody auth configuration. |
| **`JITSI_JWT_SECRET`** | Auto-generated / fallback | Secret signing key used to authorize meeting host/attendee tokens. |
| **`JITSI_CONFIG_DIR`** | `./jitsi-meet-cfg` | Local directory mapping to persist service configuration for Jitsi (Prosody, Jicofo, JVB, Nginx). |
| **`JITSI_IMAGE_VERSION`** | `stable` | Docker image tag reference for launching compatible Jitsi container builds. |
| **`SMTP_HOST`** | `smtp.mailtrap.io` | Outbound mail transfer agent host for email notifications. |
| **`SMTP_PORT`** | `587` | Outbound mail port (TLS/STARTTLS). |
| **`SMTP_USER`** | - | SMTP authorization username. |
| **`SMTP_PASS`** | - | SMTP authorization password. |
| **`SMTP_FROM_NAME`** | `"Tutor Hub Classroom"` | Display name used in outgoing emails. |
| **`S3_ENDPOINT`** | - | Custom endpoint to map AWS S3 or MinIO object store. *(Optional - defaults to container storage)* |
| **`S3_ACCESS_KEY_ID`** | - | S3 IAM user access key identifier. *(Optional)* |
| **`S3_SECRET_ACCESS_KEY`** | - | S3 IAM user secret access credential. *(Optional)* |
| **`S3_BUCKET_NAME`** | - | Target S3 bucket name. *(Optional)* |
| **`S3_PUBLIC_URL`** | - | Direct base URL for serving uploaded asset URLs directly via storage. *(Optional)* |

---

## 📦 Useful CLI Commands

| Command | Action |
| :--- | :--- |
| `bun run dev` | Starts local development server on port `3000` |
| `bun run typecheck` | Checks TypeScript files for errors |
| `bun run build` | Compiles the TanStack Start application for production |
| `bun run db:push` | Pushes the Drizzle schema to the database |
| `bun run db:studio` | Opens interactive Drizzle database editor |
| `docker compose down` | Stops and removes all running docker containers |

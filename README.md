 
<div align="center">

  <img src="AI-Job-Portal/frontend/public/favicon.svg" alt="SmartJob Logo" width="88" height="88" />

  # SmartJob — AI-Powered Job Portal

  **An Intelligent, Microservices-Based Recruitment Platform**

  A role-based recruitment platform built with React and Spring Boot microservices, featuring AI-assisted candidate evaluation, resume parsing, and real-time application tracking.

  [🌐 Live Demo](https://ai-job-portal-kirusigan.vercel.app/) · [💻 GitHub Repository](https://github.com/kirusigan03/AI_Job_Portal)

</div>

---

## 🚀 Live Deployment

| Component | Platform | Link |
|---|---|---|
| Frontend | Vercel | [Open SmartJob](https://ai-job-portal-kirusigan.vercel.app/) |
| Backend | AWS EC2 | Connected through Cloudflare Tunnel |
| API Gateway | AWS EC2 + Cloudflare Tunnel | [Backend API Tunnel](https://ears-saturn-tourism-sur.trycloudflare.com) |
| Database | PostgreSQL | Private Docker network |
| Messaging | Apache Kafka | Private Docker network |

**Note:** The Cloudflare Quick Tunnel URL is temporary and may change when the tunnel restarts. If it changes, update the frontend's `VITE_API_BASE_URL` environment variable in Vercel and redeploy the frontend.

---

## 📌 Overview

SmartJob is an AI-powered recruitment platform designed to streamline the hiring process for candidates and recruiters. It uses a microservices architecture to separate authentication, user management, job management, resume processing, applications, AI evaluation, and notifications.

The frontend is deployed on Vercel, while the backend microservices run on AWS EC2 using Docker Compose.

### Key Highlights

- Role-based authentication and authorization.
- Job discovery and job application management.
- Resume upload and parsing.
- AI-assisted candidate evaluation.
- Application status tracking.
- Event-driven communication using Apache Kafka.
- Centralized API access through Spring Cloud Gateway.
- Service discovery with Netflix Eureka.
- Containerized backend deployment using Docker Compose.

---

## ✨ Features

### 👤 Authentication and User Management
- Secure user authentication using JWT.
- Role-based access for supported user types.
- User profile management.
- Protected API endpoints.

### 💼 Job Management
- Browse available job opportunities.
- Search and filter job listings.
- Create and manage job postings for authorized users.
- View job details and requirements.

### 📄 Resume Management
- Upload resumes.
- Extract resume content for processing.
- Support document parsing using Apache PDFBox and Apache POI.

### 🤖 AI-Powered Recruitment
- AI-assisted candidate evaluation.
- Resume and job requirement analysis.
- Candidate evaluation support using the Groq API.
- Configurable AI model through environment variables.

### 📬 Application Management
- Submit job applications.
- Track application status.
- Manage application-related workflows.
- Publish application events through Kafka.

### 🔔 Notifications
- Process application-related notification events.
- Support event-driven communication between backend services.

### 🏗️ Microservices Architecture
- Independent backend services.
- Centralized configuration using Spring Cloud Config.
- Service discovery using Netflix Eureka.
- API routing through Spring Cloud Gateway.
- Inter-service communication using OpenFeign and Spring Cloud LoadBalancer.

---

## 🛠️ Technology Stack

### Frontend
- React 18
- Vite
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS
- Lucide React

### Backend
- Java 21
- Spring Boot
- Spring Cloud
- Spring Security
- Spring Cloud Gateway
- Spring Cloud Config
- Netflix Eureka
- OpenFeign
- Spring Cloud LoadBalancer
- JWT Authentication

### Database and Messaging
- PostgreSQL 17
- Apache Kafka

### AI and Document Processing
- Groq API
- Apache PDFBox
- Apache POI

### DevOps and Deployment
- Docker
- Docker Compose
- AWS EC2
- Vercel
- Cloudflare Tunnel
- GitHub Actions

---

## 🏛️ System Architecture

```text
                         ┌──────────────────────────┐
                         │        User / Browser    │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │    React + Vite Frontend │
                         │          Vercel          │
                         └────────────┬─────────────┘
                                      │ HTTPS
                                      ▼
                         ┌──────────────────────────┐
                         │    Cloudflare Tunnel     │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │   Spring Cloud Gateway   │
                         │         Port 8080        │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
      ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
      │ Auth Service  │       │ User Service  │       │ Job Service   │
      │    :8081      │       │    :8082      │       │    :8083      │
      └───────────────┘       └───────────────┘       └───────────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
              ▼                       ▼                       ▼
      ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
      │ Application   │       │ Resume        │       │ AI Service    │
      │ Service :8084 │       │ Service :8085 │       │    :8087      │
      └───────────────┘       └───────────────┘       └───────────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      │
                         ┌────────────┴────────────┐
                         │                          │
                         ▼                          ▼
                ┌────────────────┐        ┌────────────────┐
                │   PostgreSQL   │        │  Apache Kafka  │
                │ Private Network│        │ Private Network│
                └────────────────┘        └────────────────┘
```

Supporting infrastructure:

- **Config Server** — centralized configuration on port `8888`.
- **Eureka Server** — service discovery dashboard on port `8761`.
- **Notification Service** — processes notification-related events on port `8086`.

---

## 🧩 Microservices

| Service | Port | Responsibility |
|---|---:|---|
| API Gateway | `8080` | Centralized API routing |
| Auth Service | `8081` | Authentication and token handling |
| User Service | `8082` | User and profile management |
| Job Service | `8083` | Job posting and discovery |
| Application Service | `8084` | Job application workflows |
| Resume Service | `8085` | Resume uploads and parsing |
| Notification Service | `8086` | Application-related notifications |
| AI Service | `8087` | AI-assisted candidate evaluation |
| Config Server | `8888` | Centralized service configuration |
| Eureka Server | `8761` | Service registration and discovery |

The PostgreSQL database and Kafka broker run inside the Docker network and are not intended to be exposed publicly.

---

## 🔄 Event-Driven Communication

Apache Kafka supports asynchronous communication between services.

The application uses the following event topics:

- `application-submitted`
- `application-status-changed`
- `candidate-evaluated`

These events help decouple application workflows from downstream processing.

---

## 📂 Project Structure

```text
AI_Job_Portal/
└── AI-Job-Portal/
    ├── frontend/
    │   ├── public/
    │   ├── src/
    │   ├── package.json
    │   └── vite.config.js
    │
    ├── config-server/
    ├── eureka-server/
    ├── auth-service/
    ├── user-service/
    ├── job-service/
    ├── application-service/
    ├── resume-service/
    ├── notification-service/
    ├── ai-service/
    ├── api-gateway/
    │
    ├── docker/
    ├── docker-compose.yml
    ├── .env.example
    └── README.md
```

*Note: The exact structure may vary depending on the current repository version.*

---

## ⚙️ Getting Started

### Prerequisites

Install the following tools before running the project locally:

- Git
- Java 21
- Node.js and npm
- Docker Desktop or Docker Engine
- Docker Compose

### 1. Clone the Repository

```bash
git clone https://github.com/kirusigan03/AI_Job_Portal.git
cd AI_Job_Portal/AI-Job-Portal
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update `.env` with your own configuration.

Typical variables include:

```env
DB_PASSWORD=your_database_password
JWT_SECRET=your_secure_jwt_secret
INTERNAL_SERVICE_KEY=your_internal_service_key

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b

MAIL_USERNAME=your_email
MAIL_PASSWORD=your_email_app_password
```

Use values that match the project's actual configuration. Never commit `.env` or publish passwords, API keys, JWT secrets, or email credentials.

### 3. Start the Backend

From the directory containing `docker-compose.yml`, run:

```bash
docker compose up --build -d
```

Check the running containers:

```bash
docker compose ps
```

View service logs:

```bash
docker compose logs -f
```

To inspect a particular service:

```bash
docker compose logs -f api-gateway
```

### 4. Start the Frontend Locally

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend:

```text
http://localhost:5173
```

Make sure the frontend API base URL is configured for your local backend when running locally.

---

## 🌐 Deployment Configuration

### Frontend — Vercel

The frontend is deployed on Vercel.

**Live application:** https://ai-job-portal-kirusigan.vercel.app/

Configure the frontend's API base URL in the Vercel project environment variables:

```env
VITE_API_BASE_URL=your_backend_api_base_url
```

Use the currently active backend URL and the format expected by the frontend code. Redeploy the frontend after changing environment variables.

### Backend — AWS EC2

The backend microservices run on an AWS EC2 instance using Docker Compose.

Deployment components include:

- Amazon Linux
- Docker Engine
- Docker Compose
- Spring Boot microservices
- PostgreSQL
- Apache Kafka

### Cloudflare Tunnel

Cloudflare Tunnel provides an HTTPS endpoint for reaching the backend API Gateway without directly publishing the internal services.

**Current tunnel URL:** https://ears-saturn-tourism-sur.trycloudflare.com

Quick Tunnels are temporary and are intended for development or testing. For a stable production deployment, configure a persistent Cloudflare Tunnel with a domain you control.

### Network Security

- Expose only the required public entry point.
- Keep PostgreSQL and Kafka private.
- Do not expose Config Server or Eureka publicly unless there is a specific, secured operational requirement.
- Store secrets in environment variables or a suitable secrets manager.
- Use HTTPS for external application traffic.

---

## 🔌 API Overview

The frontend communicates with the backend through the API Gateway.

| API area | Purpose |
|---|---|
| Authentication | Registration, login, and token-related operations |
| Users | User profiles and account management |
| Jobs | Job discovery and job management |
| Applications | Job application workflows |
| Resumes | Resume upload and processing |
| AI | AI-assisted candidate evaluation |
| Notifications | Notification-related workflows |

The exact endpoint paths and HTTP methods depend on the controller mappings implemented in each service.

---

## 🧪 Testing and Quality

The project can be tested using:

- JUnit 5
- Mockito
- Spring Security Test
- Postman
- Frontend testing tools configured in the project

Run backend tests from an individual Spring Boot service directory:

```bash
./mvnw test
```

On Windows:

```powershell
.\mvnw.cmd test
```

Run the frontend scripts configured in `frontend/package.json`:

```bash
npm run
```

Use the listed scripts to identify the available linting and testing commands. Test results depend on the environment and required services being available.

---

## 🛡️ Security Considerations

- Use JWT-based authentication and authorization.
- Keep sensitive environment variables out of version control.
- Restrict public access to backend infrastructure.
- Keep database and messaging services on private networks.
- Validate and sanitize user input.
- Secure file upload and resume-processing workflows.
- Configure CORS to allow only the intended frontend origins.
- Avoid exposing internal service endpoints to the public internet.

---

## 🧰 Troubleshooting

### Frontend cannot connect to the backend

1. Check that the backend services are running.
2. Verify the API Gateway is reachable.
3. Confirm that `VITE_API_BASE_URL` points to the correct backend URL.
4. Check browser developer tools for CORS or network errors.
5. Redeploy Vercel after changing environment variables.

### Cloudflare Tunnel URL no longer works

A Quick Tunnel URL may change or stop working when the tunnel process stops. Start the tunnel again, obtain its current URL, update the Vercel environment variable, and redeploy the frontend.

### Backend services are not starting

Check container status and logs:

```bash
docker compose ps
docker compose logs --tail=100
```

### Database connection errors

Verify that PostgreSQL is running, the database credentials match the environment configuration, and the backend services use the correct internal database hostname.

---

## 🚧 Future Improvements

- Configure a permanent custom domain and persistent Cloudflare Tunnel.
- Add comprehensive automated testing.
- Improve monitoring, centralized logging, and health checks.
- Strengthen deployment automation.
- Add production-grade secrets management and backup procedures.
- Expand AI-assisted recruitment and candidate matching capabilities.

---

## 👨‍💻 Author

**Kirusigan Thevarasa**

IT Undergraduate — University of Moratuwa

- **Portfolio:** [kiruthiyan.me](https://kiruthiyan.me)
- **GitHub:** [kirusigan03](https://github.com/kirusigan03)
- **Live Project:** [SmartJob — AI-Powered Job Portal](https://ai-job-portal-kirusigan.vercel.app/)

---

<div align="center">

  **SmartJob — Making Recruitment Smarter with AI**

  Built with React, Spring Boot, PostgreSQL, Kafka, and AI.

</div>

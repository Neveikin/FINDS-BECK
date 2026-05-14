# FINDS Marketplace

E-commerce marketplace platform with Spring Boot backend and React frontend.

## Project Structure

```
FINDS-BECK/
├── backend/          # Spring Boot backend
├── frontend/         # React frontend
├── .env             # Environment variables (not in git)
├── .env.example     # Example environment variables
├── compose.yaml     # Docker Compose configuration
└── README.md        # This file
```

## Quick Start

### 1. Setup Environment Variables

```bash
cp .env.example .env
# Edit .env and fill in your credentials
```

### 2. Start Services

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**Database & Redis:**
```bash
# Make sure PostgreSQL and Redis are running
redis-server
```

## Environment Variables

See `.env.example` for all required variables. Key variables:

- Database credentials
- Google OAuth credentials
- Email (Brevo) SMTP credentials
- JWT secret

**⚠️ Never commit `.env` file to git!**

## Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## Development

- Backend runs on `http://localhost:8090`
- Frontend runs on `http://localhost:3000`
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

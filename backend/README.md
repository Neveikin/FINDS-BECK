# Backend

Spring Boot backend for FINDS marketplace.

## Prerequisites

- Java 25
- PostgreSQL 15+
- Redis
- Maven

## Environment Variables

Copy `.env.example` from root to `.env` and fill in the values:

```bash
cp ../.env.example ../.env
```

Required variables:
- `DB_URL` - PostgreSQL connection URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `MAIL_USERNAME` - SMTP username
- `MAIL_PASSWORD` - SMTP password
- `JWT_SECRET` - JWT signing secret

## Running

```bash
# From backend directory
mvn spring-boot:run

# Or from root directory
cd backend && mvn spring-boot:run
```

The server will start on port 8090.

## Building

```bash
mvn clean install
```

# Docker Commands

## 1) Start full app with Docker (Postgres + Redis + Backend + Nginx)

```bash
docker compose up -d --build
docker compose ps
```

Open: `http://localhost`

## 2) Start only infrastructure containers (for local backend/frontend dev)

```bash
docker compose up -d postgres redis
docker compose ps
```

Then run app locally:

```bash
./mvnw spring-boot:run
cd frontend
npm install
npm run dev
```

## 3) Logs

```bash
docker compose logs -f postgres
docker compose logs -f redis
docker compose logs -f backend
docker compose logs -f nginx
```

## 4) Stop containers

```bash
docker compose down
```

## 5) Stop + remove volumes (resets database data)

```bash
docker compose down -v
```

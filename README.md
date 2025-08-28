# UBC Planner

This project is a comprehensive exam scheduler designed for UBC, benefiting over 30,000 students. It utilizes a PostgreSQL database to store all exam-related information, a Spring Boot application to create a RESTful API for the backend, and a ReactJS frontend for intuitive user interaction.

---

## Visit The Site
Feel free to check out the [project here!](https://ubc-scheduler.vercel.app/). We are still in the process of accessing live data, so temporary data is utilized for testing purposes.
<img width="3014" height="1870" alt="image" src="https://github.com/user-attachments/assets/22ff2966-34db-4a40-9c2f-08d92d25ca30" />


---

## Features

- **PostgreSQL (Neon in prod):** Stores exams (course/section, date/time, building/room, duration).
- **Spring Boot Backend:** RESTful API, JPA, Flyway migrations, ICS export endpoint.
- **React Frontend (Vite + Tailwind):** Search by Subject → Course → Section, build “My Schedule,” export **.ics**.
- **Importer:** Admin routes to ingest sample HTML or uploaded HTML (CSV/live support ready to plug in).
- **Docker:** Containerized backend + local Postgres via Docker Compose.

---

## Prerequisites

- **Java 17+**
- **Node 18+ & npm**
- **Docker Desktop** (for the one-command local stack)  
  *or* **PostgreSQL** installed locally if running services manually

---

## Installation

### Option A — One-command local dev (recommended)

```bash
git clone https://github.com/manggo-cd/UBC-Exam-Scheduler.git
cd UBC-Exam-Scheduler/infra

# Start DB + backend + frontend
docker compose up --build

# UBC Planner

This project is a comprehensive exam scheduler designed for UBC, benefiting over 30,000 students. It utilizes a PostgreSQL database to store all exam-related information, a Spring Boot application to create a RESTful API for the backend, and a ReactJS frontend for intuitive user interaction.


## Visit The Site
Feel free to check out the [project here!](https://ubc-scheduler.vercel.app/). We are still in the process of accessing live data, so temporary data is utilized for testing purposes.
<img width="3014" height="1870" alt="image" src="https://github.com/user-attachments/assets/22ff2966-34db-4a40-9c2f-08d92d25ca30" />

## Features

- **PostgreSQL (Neon in prod):** Stores exams (course/section, date/time, building/room, duration).
- **Spring Boot Backend:** RESTful API, JPA, Flyway migrations, ICS export endpoint.
- **React Frontend (Vite + Tailwind):** Search by Subject → Course → Section, build “My Schedule,” export **.ics**.
- **Importer:** Admin routes to ingest sample HTML or uploaded HTML (CSV/live support ready to plug in).
- **Docker:** Containerized backend + local Postgres via Docker Compose.

## Prerequisites

Before running this project locally, ensure you have the following installed:

- **Java Development Kit (JDK) 17 or higher**
- **Node.js and npm**
- **PostgreSQL** database
- IDE (IntelliJ IDEA, VS Code, etc.)

## Installation

### Backend Setup

1. Clone this repository.
2. Open the `backend` directory in your preferred IDE.
3. Configure the `application.properties` (or env vars) in `src/main/resources` with your PostgreSQL database credentials.
4. Run the Spring Boot application:
   - Maven Wrapper: `./mvnw -DskipTests package && ./mvnw spring-boot:run`

### Frontend Setup

1. Navigate to the `frontend` directory in your terminal.
2. Run `npm install` to install dependencies.
3. Set the API base URL (Vite):
   - Create a `.env` file with:  
     `VITE_API_BASE_URL=http://localhost:8080/api`
4. Run `npm run dev` to start the React application (Vite default: `http://localhost:5173`).

## Usage

- Access the frontend application via `http://localhost:5173`.
- Use the provided API endpoints to search and export exam data, for example:
  - `GET /api/meta/subjects?campus=V`
  - `GET /api/meta/courses?campus=V&subject=CPSC`
  - `GET /api/meta/sections?campus=V&subject=CPSC&course=221`
  - `GET /api/exams/search?campus=V&subject=CPSC&course=221&sort=startTime,asc`
  - `GET /api/exams/ics?ids=1,2,3` (download selected exams as `.ics`)

## Contributing

Contributions are welcome! If you'd like to enhance this project or report issues, please submit a pull request or open an issue.

## About

Sorting through **UBC** exam schedules using a **PostgreSQL** database and a **Spring Boot** backend to simplify finding exam rooms and times. All information is displayed via a **React** application, allowing users to search for exams and create a personalized schedule which they can export to their own calendar.

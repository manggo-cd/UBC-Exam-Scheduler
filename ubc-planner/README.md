# UBC Planner

A comprehensive course planning and scheduling application for University of British Columbia students.

## Project Structure

```
ubc-planner/
├─ README.md                    ← This file
├─ .gitignore                  ← Git ignore rules
├─ .editorconfig               ← Editor configuration
├─ backend/                    ← Spring Boot application
│  ├─ pom.xml                 ← Maven configuration
│  └─ src/                    ← Source code
├─ frontend/                   ← Angular frontend (coming soon)
│  └─ README.md               ← Frontend documentation
└─ infra/                      ← Infrastructure configuration
   └─ README.md               ← Infrastructure documentation
```

## Getting Started

### Backend
The backend is a Spring Boot application that can be run immediately.

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080`

### Frontend
Frontend development will begin soon with Angular.

### Infrastructure
Database and Docker configurations will be added to the infra folder.

## Development

This project uses:
- **Backend**: Spring Boot 3.2.0, Java 17
- **Frontend**: Angular (coming soon)
- **Build Tool**: Maven
- **Database**: TBD
- **Containerization**: Docker (coming soon)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[License information to be added]

# UBC Planner Frontend

This directory will contain the Angular frontend application for UBC Planner.

## Status

🚧 **Coming Soon** 🚧

The frontend development will begin after the backend is stable and the basic API endpoints are established.

## Planned Features

- **Course Catalog**: Browse and search UBC courses
- **Schedule Builder**: Create and manage course schedules
- **Degree Planning**: Plan your degree requirements
- **Registration Tools**: Tools to help with course registration
- **Responsive Design**: Mobile-first approach for all devices

## Technology Stack

- **Framework**: Angular (latest stable version)
- **Styling**: Angular Material + Custom CSS
- **State Management**: NgRx (if needed)
- **Testing**: Jasmine + Karma
- **Build Tool**: Angular CLI

## Development Setup

Once development begins:

```bash
# Install Angular CLI globally
npm install -g @angular/cli

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
ng serve
```

## Project Structure

```
frontend/
├─ src/
│  ├─ app/
│  │  ├─ components/     ← Reusable UI components
│  │  ├─ services/       ← API services
│  │  ├─ models/         ← Data models
│  │  ├─ pages/          ← Page components
│  │  └─ shared/         ← Shared utilities
│  ├─ assets/            ← Static assets
│  └─ styles/            ← Global styles
├─ package.json           ← Dependencies
└─ angular.json           ← Angular configuration
```

## API Integration

The frontend will integrate with the Spring Boot backend API endpoints for:
- Course data retrieval
- User authentication
- Schedule management
- Degree requirement checking

## Design Principles

- **Accessibility First**: WCAG 2.1 AA compliance
- **Mobile First**: Responsive design starting from mobile
- **Performance**: Fast loading and smooth interactions
- **User Experience**: Intuitive navigation and clear information hierarchy

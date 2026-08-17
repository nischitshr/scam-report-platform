
# Cloud Fullstack Application

A complete full-stack application with Django REST backend and React frontend.


## Quick Start Guide

### Backend Setup

Navigate to the backend directory and follow these steps:

```
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The backend will run on http://localhost:8000


### Frontend Setup

Navigate to the frontend directory and follow these steps:

```
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:5173


## Project Architecture

### Backend Structure

The Django backend is organized as follows:

**Core Configuration** (scam_api/)
- settings.py - Django configuration and environment setup
- urls.py - Main URL router
- asgi.py - ASGI application for async support
- wsgi.py - WSGI application for production
- custom_renderers.py - Custom API response renderers

**Applications**

Reports App (reports/)
- models.py - Database models for report functionality
- views.py - API endpoints for reports
- serializers.py - Data serialization for API responses
- admin.py - Django admin configuration
- filters.py - Query filtering logic
- urls.py - Report-specific routes
- migrations/ - Database migration files

Uploads App (uploads/)
- models.py - File upload data models
- views.py - Upload handling endpoints
- utils.py - Helper functions for file processing
- urls.py - Upload routes

**Database Files**
- requirements.txt - Python dependencies


### Frontend Structure

The React TypeScript frontend is organized as follows:

**Root Files**
- package.json - Project dependencies and scripts
- index.html - Entry HTML file
- vite.config.js - Vite build configuration
- tsconfig.json - TypeScript configuration

**Source Code** (src/)
- App.tsx - Main React component
- App.css - Application styling
- components/ - Reusable React components
- assets/ - Static images and icons

**Public Files** (public/)
- favicon.svg - Site favicon
- icons.svg - Icon sprites


## Available Scripts

### Backend Commands

```
python manage.py runserver          # Start development server
python manage.py migrate            # Apply database migrations
python manage.py makemigrations     # Create new migrations
python manage.py createsuperuser    # Create admin user
python manage.py collectstatic      # Collect static files
```

### Frontend Commands

```
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run code linter
```


## Technology Stack

**Backend**
- Django REST Framework - API development
- Python 3.x - Server language
- SQLite/PostgreSQL - Database

**Frontend**
- React 18+ - UI library
- TypeScript - Type-safe JavaScript
- Vite - Fast build tool
- Tailwind CSS - Utility CSS framework


## API Integration

The frontend communicates with the backend API at http://localhost:8000. Update the API base URL in your frontend environment configuration if needed.


## Deployment Notes

For production deployment:

Backend:
- Use a production database (PostgreSQL recommended)
- Set DEBUG = False in settings.py
- Configure allowed hosts
- Use a production WSGI server (Gunicorn)

Frontend:
- Run npm run build to create optimized bundle
- Serve from static file server or CDN
- Update API endpoints for production domain


## File Organization Summary

```
cloud-fullstack-group1/
├── backend/
│   ├── scam_api/          (Core Django configuration)
│   ├── reports/           (Reports application)
│   ├── uploads/           (File uploads application)
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/               (React components and logic)
│   ├── public/            (Static assets)
│   ├── package.json
│   └── index.html
└── README.md
```

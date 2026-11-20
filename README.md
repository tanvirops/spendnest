<img width="1672" height="941" alt="SpendNest Personal Finance Dashboard Hero" src="https://github.com/user-attachments/assets/4435f95d-82d1-4dda-8b56-79acdb561740" />
# SpendNest

SpendNest is a full-stack personal expense tracker for managing daily spending, budgets, savings, and account profiles.

The application includes a React frontend, an Express REST API, MongoDB persistence, JWT authentication, and Google OAuth.

## Features

- Email/password registration and login
- Google OAuth authentication
- Expense creation, editing, deletion, filtering, and pagination
- Dashboard summaries and spending insights
- Monthly and custom budget tracking
- Monthly savings tracking
- User profile and password management
- Responsive PWA interface
- Docker and Docker Compose deployment
- Automated tests, formatting, image publishing, and release deployment

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- TanStack React Query
- React Hook Form
- Yup
- Axios
- Progressive Web App support

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Tokens
- bcryptjs
- Passport and Google OAuth

### Infrastructure

- Docker
- Docker Compose
- Nginx
- GitHub Actions
- Docker Hub

## Project Structure

```text
spendnest/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # API client modules
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Application context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Shared page layouts
│   │   ├── pages/          # Route-level pages
│   │   └── utils/          # Frontend utilities
│   ├── public/             # Static assets
│   └── Dockerfile
├── server/                 # Express REST API
│   ├── src/
│   │   ├── config/         # Passport configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Authentication middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── app.js
│   │   ├── env.js
│   │   └── server.js
│   └── Dockerfile
├── scripts/                # Deployment utilities
├── docker-compose.yml
└── package.json

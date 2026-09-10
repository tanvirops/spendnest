# Expense Tracker API Server

A complete Express.js backend server for the Expense Tracker application with user authentication, budget management, expense tracking, and savings recording.

## Features

- ✅ User Registration & Login (Email/Password)
- ✅ Google OAuth 2.0 Integration
- ✅ Email Verification
- ✅ JWT Token Authentication
- ✅ Expense Management (CRUD)
- ✅ Budget Tracking
- ✅ Savings Recording
- ✅ User Profile Management
- ✅ Dashboard Summary Statistics
- ✅ CORS Support
- ✅ Error Handling

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense_tracker

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Client URL
CLIENT_URL=http://localhost:5173
```

3. Start MongoDB (if local):

```bash
mongod
```

## Running the Server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`)

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login with email/password
- `GET /verify-email/:token` - Verify email address
- `GET /google` - Initiate Google OAuth login
- `GET /google/callback` - Google OAuth callback

### Expense Routes (`/api/expenses`) - _Protected_

- `GET /dashboard` - Get dashboard summary
- `GET /` - Get all expenses (paginated, filterable)
- `GET /:id` - Get single expense
- `POST /` - Create new expense
- `PUT /:id` - Update expense
- `DELETE /:id` - Delete expense

### Budget Routes (`/api/budgets`) - _Protected_

- `GET /` - Get all budgets
- `GET /active` - Get active budget
- `GET /:id` - Get single budget
- `POST /` - Create new budget
- `PUT /:id` - Update budget
- `DELETE /:id` - Delete budget

### Saving Routes (`/api/savings`) - _Protected_

- `GET /` - Get all savings (with optional year/month filter)
- `GET /total` - Get total savings
- `GET /:month` - Get saving by month (YYYY-MM format)
- `POST /` - Create or update saving
- `DELETE /:id` - Delete saving

### Profile Routes (`/api/profile`) - _Protected_

- `GET /` - Get user profile
- `PUT /` - Update profile (name, avatar)
- `POST /change-password` - Change password
- `PUT /email` - Update email address
- `DELETE /` - Delete user account

### Health Check

- `GET /api/health` - Server health check

## Request/Response Format

### Authentication Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password_123"
}
```

### Expense Request

```json
{
  "name": "Coffee",
  "category": "Food",
  "amount": 5.5,
  "notes": "Morning coffee",
  "expenseDate": "2024-01-15"
}
```

### Budget Request

```json
{
  "type": "monthly",
  "amount": 1000,
  "fromEffective": "2024-01-01",
  "toEffective": "2024-01-31"
}
```

### Saving Request

```json
{
  "month": "2024-01",
  "amount": 500,
  "note": "January savings"
}
```

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Project Structure

```
server/
├── src/
│   ├── server.js                 # Main server file
│   ├── config/
│   │   └── passport.js           # Passport configuration
│   ├── controllers/
│   │   ├── expense.controller.js # Expense operations
│   │   ├── budget.controller.js  # Budget operations
│   │   ├── saving.controller.js  # Saving operations
│   │   └── profile.controller.js # Profile operations
│   ├── middleware/
│   │   └── auth.js               # JWT & verification middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Expense.js            # Expense schema
│   │   ├── Budget.js             # Budget schema
│   │   └── Saving.js             # Saving schema
│   └── routes/
│       ├── auth.js               # Authentication routes
│       ├── expense.js            # Expense routes
│       ├── budget.js             # Budget routes
│       ├── saving.js             # Saving routes
│       └── profile.js            # Profile routes
├── .env                          # Environment variables
├── package.json                  # Dependencies
└── README.md                     # This file
```

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **passport** - Authentication middleware
- **passport-google-oauth20** - Google OAuth strategy
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

## Development Dependencies

- **nodemon** - Auto-reload during development

## Error Handling

The server includes comprehensive error handling with meaningful error messages. All responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "data": {/* response data */},
  "message": "Operation successful"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description"
}
```

## Notes

- Email verification tokens are generated during registration and should be sent via email (not implemented in this version)
- OAuth users have auto-verified email addresses
- Passwords are hashed using bcryptjs with 10 salt rounds
- All dates are stored in UTC format
- Expenses are indexed by userId and expenseDate for optimal query performance

## Future Enhancements

- Email service integration (Nodemailer)
- Rate limiting
- Request validation middleware
- API documentation (Swagger/OpenAPI)
- Unit & integration tests
- Scheduled tasks for budget alerts
- Transaction history & audit logs

## Support

For issues or questions, please open an issue in the repository.

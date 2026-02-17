# Task Tracker

A full-stack task management application built with Next.js, Express.js, MongoDB, and Redis.

## Features

- User authentication (signup/login) with JWT
- Create, read, update, and delete tasks
- Task caching with Redis for improved performance
- RESTful API with Express.js backend
- Modern Next.js frontend

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Redis (optional, for caching)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tasktracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (see Environment Variables below)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGO_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | Secret key for JWT token generation | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` | No |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` | No |
| `CACHE_TTL` | Cache TTL in seconds | `300` | No |
| `PORT` | Server port | `5000` | No |
| `NEXT_PUBLIC_API_URL` | Frontend API URL | `http://localhost:5000` | No |

### Example `.env` file

```env
# Required
MONGO_URI=mongodb://localhost:27017/tasktracker
JWT_SECRET=your-super-secret-key-here

# Optional
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
CACHE_TTL=300
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Running the Application

### Development Mode

Run the frontend (Next.js):
```bash
npm run dev
```

Run the backend server:
```bash
npm run server
```

The frontend will be available at `http://localhost:3000`
The backend API will be available at `http://localhost:5000`

### Production Mode

1. Build the Next.js app:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

## Project Structure

```
tasktracker/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.js          # Root layout
│   ├── page.js            # Home page
│   └── globals.css        # Global styles
├── lib/                   # Utility libraries
│   ├── api.js            # API client functions
│   └── redis.js          # Redis caching utilities
├── middleware/           # Express middleware
│   └── auth.js           # Authentication middleware
├── models/               # Mongoose models
│   ├── Task.js           # Task model
│   └── User.js           # User model
├── routes/               # Express routes
│   ├── auth.js           # Authentication routes
│   └── tasks.js          # Task CRUD routes
├── app.js                # Express app configuration
├── server.js             # Server entry point
└── package.json          # Dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Tasks
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Testing

Run tests:
```bash
npm test
```

Run linter:
```bash
npm run lint
```

## License

MIT

# SwiftTrack – Courier Tracking System

## Project Overview

SwiftTrack is a courier tracking system developed to demonstrate web development, frontend programming, backend development, REST APIs, authentication, and database integration.

The system allows users to view shipments, track courier deliveries, add new shipment records, and manage shipment information.

## Technologies Used

- HTML5, CSS3 and JavaScript
- React.js and React Router
- Node.js
- Express.js
- MongoDB Atlas and Mongoose
- JSON and REST APIs
- JWT authentication
- bcrypt password hashing
- Git and GitHub

## Programs Implemented

### Program 1 – Browser-Based Courier Tracking System

**Folder:** `programs/program-1-browser/`

Features:
- Courier tracking interface using HTML, CSS and JavaScript.
- Shipment search and status filtering.
- Input validation and DOM manipulation.
- Fetch API with async/await.
- JSON data handling.
- Demonstration of HTTP GET, POST, PUT and DELETE methods.

### Program 2 – React Courier Tracking Application

**Folder:** `programs/program-2-react/`

Features:
- React functional components.
- Reusable components and JSX.
- Props and state management.
- useState and useEffect hooks.
- Conditional rendering and event handling.
- React Router navigation.
- Shipment tracking and management interface.

### Program 3 – Node.js Utility and HTTP Server

**Folder:** `programs/program-3-node/`

Features:
- File System and Path modules.
- EventEmitter for shipment update events.
- File streams.
- Basic HTTP server without Express.
- GET and POST shipment endpoints.
- Input validation and error handling.

### Program 4 – Express REST API

**Folder:** `programs/program-4-express/`

Features:
- Express.js REST API.
- Shipment CRUD operations.
- Request logging middleware.
- Input validation middleware.
- Centralized error handling.
- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication and protected routes.

### Program 5 – Frontend, Backend and Database Integration

**Frontend:** `programs/program-2-react/`

**Backend:** `programs/program-4-express/`

Features:
- React frontend connected to Express backend.
- MongoDB Atlas database integration using Mongoose.
- CORS configuration.
- API-based shipment operations.
- Persistent shipment records in MongoDB.
- Environment variables for sensitive configuration.

## How to Run the Project

### 1. Run Program 1

Open `programs/program-1-browser/index.html` in a web browser.

### 2. Run Program 2

Open a terminal in `programs/program-2-react/` and run:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL displayed in the terminal.

### 3. Run Program 3

Open a terminal in `programs/program-3-node/` and run:

```powershell
node server.js
```

### 4. Run Program 4

Configure the environment variables in the `.env` file, then open a terminal in `programs/program-4-express/` and run:

```powershell
npm.cmd install
node server.js
```

The Express API runs at:

`http://localhost:3002`

### 5. Run Program 5

Start the Express backend using the instructions above.

In a separate terminal, start the React frontend:

```powershell
cd programs/program-2-react
npm.cmd run dev
```

The frontend communicates with the backend API, which stores shipment information in MongoDB Atlas.

## Database

**Database:** MongoDB Atlas

**Database name:** `swifttrack`

**Collection:** `shipments`

The shipment collection stores shipment IDs, receiver names, destinations, statuses and timestamps.

## Security

- Passwords are hashed using bcrypt.
- JWT tokens are used for protected API routes.
- Database connection details and secret keys are stored in environment variables.
- The `.env` file must not be uploaded to GitHub.

## Project Status

All five assigned programs have been implemented. The React frontend, Express backend and MongoDB Atlas integration have been tested locally.

## Author

Developed as part of an academic programming assignment.
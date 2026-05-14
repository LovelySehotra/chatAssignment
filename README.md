# ChatFlow - Real-Time Scalable Chat Platform

A production-ready real-time chat application built with Node.js, Express, MongoDB, Redis, and React. This project implements a robust messaging system following **Clean Architecture** principles to ensure scalability, maintainability, and clear separation of concerns.

## 🚀 Key Features

-   **Real-Time Messaging**: Instant message delivery and status updates using Socket.IO.
-   **Presence Tracking**: Real-time online/offline status powered by Redis.
-   **Comprehensive Conversations**: 
    -   **Direct Messages**: Secure 1-on-1 private chats.
    -   **Group Chats**: Collaborative group messaging with multiple participants.
-   **Persistent Message History**: Scalable storage with MongoDB and efficient cursor-based pagination.
-   **Secure Authentication**: JWT-based authentication with secure password hashing and token-based access control.
-   **Advanced User Profiles**: Customizable user metadata including avatars, bios, and account management.
-   **Interactive Testing Dashboard**: A feature-rich React-based frontend for debugging and testing API functionality in real-time.

## 🛠 Tech Stack

### Backend (Clean Architecture)
-   **Runtime**: Node.js (ESM)
-   **Framework**: Express.js (v5)
-   **Database**: MongoDB (Mongoose ODM)
-   **Caching/Presence**: Redis (ioredis)
-   **Real-time Communication**: Socket.IO
-   **Validation**: Zod & Class-Validator
-   **Logging**: Pino
-   **Language**: TypeScript

### Frontend (Testing Client)
-   **Library**: React 19
-   **Build Tool**: Vite
-   **State Management**: React Hooks
-   **API Communication**: Axios
-   **Real-time Integration**: Socket.IO Client
-   **Language**: TypeScript

## 📁 Project Structure

The project is divided into two main components: the backend API and the frontend testing client.

```text
.
├── server/             # Backend Application (Clean Architecture)
│   ├── src/
│   │   ├── domain/         # Entities, Repository Interfaces & Domain Logic
│   │   ├── application/    # Use Cases, DTOs & Service Interfaces
│   │   ├── infrastructure/ # DB connections, Redis, Repository Implementations
│   │   ├── interface/      # Controllers, Express Routers, Socket Handlers
│   │   └── config/         # Environment Configuration & Constants
│   └── scripts/            # ESM/TypeScript Registration Scripts
├── client/             # Frontend Application (Testing Dashboard)
│   ├── src/
│   │   ├── api/            # API Service Layer & Axios Configuration
│   │   ├── components/     # UI Components & Layouts
│   │   ├── hooks/          # Custom Hooks (e.g., useSocket)
│   │   └── pages/          # View Components (Auth, Chat, Sockets)
└── postman_collection.json # Comprehensive API Test Suite
```

## ⚙️ Getting Started

### Prerequisites
-   **Node.js** (v18.x or higher)
-   **MongoDB** (Local instance or Atlas URI)
-   **Redis** (Required for presence tracking)

### Backend Installation & Setup
1.  Navigate to the backend directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    Create a `.env` file in `server/` and populate it:
    ```env
    PORT=1209
    DATABASE_URL='mongodb://127.0.0.1:27017/chat'
    JWT_SECRET='your_secure_secret'
    ENV='DEV'
    REDIS_HOST='127.0.0.1'
    REDIS_PORT=6379
    ```
4.  Run the application:
    ```bash
    npm run dev
    ```

### Frontend Installation & Setup
1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure the environment:
    Ensure `.env` in `client/` points to your backend:
    ```env
    VITE_API_BASE_URL=http://localhost:1209/api
    VITE_SOCKET_URL=http://localhost:1209
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

## 🧪 Testing & Documentation

### Postman Collection
A complete Postman collection is provided at the root (`postman_collection.json`).
-   Import the JSON file into Postman.
-   Environment variables for `accessToken` and `userId` are automatically handled via collection scripts.

### Live Testing Flow
1.  Open the Frontend Dashboard at `http://localhost:5173`.
2.  **Auth**: Create two users (User A and User B).
3.  **Conversations**: Login as User A and create a direct conversation with User B's ID.
4.  **Sockets**: Go to the Socket Test page to see real-time events as messages are sent and read.

## 🏗 Architecture Overview
This project adheres to **Clean Architecture** to ensure the business logic remains independent of external frameworks:
-   **Domain Layer**: Contains the core business entities and repository definitions.
-   **Application Layer**: Implements use cases and business rules, acting as a bridge between the domain and interface.
-   **Infrastructure Layer**: Handles external concerns such as database persistence (MongoDB), caching (Redis), and third-party integrations.
-   **Interface Layer**: Manages external entry points including RESTful APIs and WebSocket events.

---
Developed as a robust solution for real-time communication assignments.

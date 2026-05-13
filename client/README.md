# Chat API Testing Frontend

A React + TypeScript frontend for testing and debugging the Chat Assignment backend API.

## Quick Start

```bash
# 1. Install dependencies
cd client
npm install

# 2. Configure backend URL (optional — defaults to localhost:1209)
# Edit .env if your backend runs on a different port
cat .env

# 3. Start dev server
npm run dev
```

The frontend will start at `http://localhost:5173` (Vite default).

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:1209/api` | Backend REST API base URL |
| `VITE_SOCKET_URL` | `http://localhost:1209` | Socket.IO server URL |

## Connecting to Backend

1. Start your backend server: `cd server && npm run dev`
2. Ensure MongoDB is running on `localhost:27017`
3. Start this frontend: `cd client && npm run dev`
4. The backend CORS is configured to accept `*` origins, so no CORS issues expected.

## Pages & Testing Flow

### 1. Auth (🔐)
- **Signup**: Create a user with email + password (password requires uppercase, lowercase, digit, special char, 8+ chars)
- **Login**: Get JWT tokens
- Tokens are auto-saved to localStorage on success

### 2. Users (👥)
- **Get Me**: Fetch current authenticated user profile
- **Get All Users**: List all users (useful to get user IDs for conversations)
- **Update Profile**: Change username, avatar, bio
- **Delete Account**: Permanently delete current user

### 3. Conversations (💬)
- **Create Direct**: Start a 1-on-1 conversation (needs another user's ID)
- **Create Group**: Start a group chat with multiple user IDs
- **List Conversations**: Get all conversations you're part of
- **Get by ID**: Fetch a specific conversation

### 4. Messages (✉️)
- **Send Message**: Send via HTTP POST
- **Mark Read**: Mark a specific message as read
- **Get Messages**: Fetch messages with cursor pagination
- **Unread Count**: Get count of unread messages in a conversation

### 5. Socket.IO (🔌)
- **Connect/Disconnect**: Manage WebSocket connection
- **Join/Leave Room**: Join or leave a conversation room
- **Send Message**: Send message via Socket.IO with acknowledgement
- **Mark Read**: Mark read via Socket.IO
- **Event Log**: Real-time log of all socket events

## Recommended Testing Flow

1. **Signup** two users (use two browser tabs or different emails)
2. **Login** with one user
3. **Get All Users** to find the other user's ID
4. **Create Direct Conversation** with the other user's ID
5. **Send Messages** via HTTP or Socket.IO
6. **Login** as the other user and check unread count
7. **Mark messages as read**
8. **Test edge cases**: wrong IDs, missing auth, validation errors

## Postman Collection

A complete Postman collection is at `postman_collection.json` in the project root.

### How to use:
1. Open Postman → Import → select `postman_collection.json`
2. The collection includes auto-set variables for tokens and IDs
3. Run **Signup** or **Login** first — tokens are auto-saved
4. Run **Get All Users** — the `otherUserId` variable is auto-populated
5. Proceed through Conversations → Messages endpoints

## Known Backend Issues

1. **Message router not mounted**: `/api/messages/*` routes point to the Conversation router instead of Message router
2. **Missing `type`/`createdBy` in conversation creation**: Will cause Mongoose validation errors
3. **Socket `userId` undefined**: `socket.data.userId` is never set — socket messaging fails
4. **Cursor pagination broken**: The cursor parameter is ignored in message queries

## Project Structure

```
client/
├── .env                        # Backend URL config
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root component with navigation
│   ├── App.css                 # All styles
│   ├── api/
│   │   ├── axiosClient.ts     # Axios instance + interceptors
│   │   ├── authApi.ts         # POST /users, POST /users/login
│   │   ├── userApi.ts         # GET/PATCH/DELETE /users
│   │   ├── conversationApi.ts # Conversation CRUD
│   │   └── messageApi.ts      # Message operations
│   ├── hooks/
│   │   └── useSocket.ts       # Socket.IO React hook
│   ├── components/
│   │   ├── ApiResponse.tsx    # JSON response viewer
│   │   ├── Layout.tsx         # App layout + sidebar
│   │   └── TokenManager.tsx   # Auth status display
│   ├── pages/
│   │   ├── AuthPage.tsx       # Signup + Login
│   │   ├── UsersPage.tsx      # User management
│   │   ├── ConversationsPage.tsx
│   │   ├── MessagesPage.tsx
│   │   └── SocketTestPage.tsx # Socket.IO live testing
│   └── utils/
│       └── tokenStorage.ts    # localStorage helpers
```

# IntellMeet – AI-Powered Enterprise Meeting & Collaboration Platform

IntellMeet is a full-stack web application designed to bring video meetings, real-time communication, screen sharing, and meeting collaboration into a single platform.

The project was developed as a MERN-stack portfolio project for Zidio Development.

## 🚀 Live Demo

**Frontend:** https://intell-meet-ai-collaboration-platfo.vercel.app/

**Backend API:** https://intellmeet-ai-collaboration-platform-1.onrender.com/

> Note: The backend may take a short time to wake up when using a free hosting instance.

## ✨ Key Features

- User registration and login
- JWT-based authentication
- Protected application routes
- Meeting creation with unique meeting room codes
- Real-time meeting room communication
- Video and audio communication using WebRTC
- Real-time signaling using Socket.io
- Screen sharing
- Real-time meeting chat
- User presence and peer connection handling
- MongoDB Atlas database integration
- Cloudinary-ready media upload infrastructure
- Responsive modern dashboard interface

## 🛠️ Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- Socket.io Client
- WebRTC
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.io
- Multer
- Cloudinary
- Helmet
- CORS

### Deployment
- Vercel – Frontend
- Render – Backend
- MongoDB Atlas – Database

## 🏗️ Project Architecture

```text
IntellMeet/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── store/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## 🔄 Application Flow

```text
React + TypeScript Frontend
          │
          ▼
       REST API
          │
          ▼
   Node.js + Express
          │
     ┌────┴────┐
     ▼         ▼
 MongoDB    Socket.io
 Atlas         │
               ▼
            WebRTC
               │
               ▼
        Real-time Meeting
```

## 🔐 Environment Variables

Environment files are intentionally excluded from version control.

### Server

Create `server/.env`:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Client

For local development, configure the frontend API URL according to your local or deployed backend.

Do not commit passwords, JWT secrets, database credentials, or private API keys.

## 💻 Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/arsathariff007-alt/IntellMeet-AI-Collaboration-Platform.git
cd IntellMeet/IntellMeet
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

The Vite development server normally runs at:

```text
http://localhost:5173
```

### 4. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

Create the required `.env` file and then start the backend:

```bash
npm start
```

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get authenticated user |
| PUT | `/api/auth/avatar` | Update user avatar |
| POST | `/api/meetings/create` | Create a meeting |

## 🔌 Real-Time Communication

Socket.io is used for real-time signaling and communication between meeting participants.

WebRTC handles peer-to-peer audio and video communication.

The application uses signaling events such as:

- `join-room`
- `user-connected`
- `video-offer`
- `video-answer`
- `ice-candidate`
- `send-message`
- `receive-message`

## 📦 Security

The project includes:

- Password hashing with bcryptjs
- JWT-based authentication
- Protected API routes
- Environment-variable based secret management
- Helmet security middleware
- CORS configuration

## 🎯 Project Goals

The main goal of IntellMeet is to demonstrate how modern web technologies can be combined to build a real-time collaboration platform with:

- Full-stack authentication
- REST APIs
- Real-time WebSocket communication
- Peer-to-peer WebRTC media
- Database-backed meeting management
- Cloud deployment

## 🔮 Future Enhancements

Planned improvements include:

- AI-powered meeting transcription
- Automated meeting summaries
- Action-item extraction
- Calendar integration
- Persistent chat history
- Advanced team workspaces
- Scalable TURN/STUN infrastructure
- Enhanced meeting analytics

## 👨‍💻 Project

**IntellMeet – AI-Powered Enterprise Meeting & Collaboration Platform**

Developed as a Zidio Development Web Development (MERN) project.

**Repository:** https://github.com/arsathariff007-alt/IntellMeet-AI-Collaboration-Platform

# IntellMeet – AI-Powered Enterprise Meeting & Collaboration Platform
A production-grade, full-stack enterprise collaboration suite constructed using the MERN architecture, decentralized real-time WebRTC media streams, and automated AI meeting intelligence processing. Designed for scalability and low-latency interaction, the platform reduces meeting administrative overhead by automatically extracting summaries and tracking task action items.

---

## 🚀 Core Platform Features & System Matrix

### 💻 Frontend Client Viewports (Weeks 2 & 3 Foundations)
* **Secure Session Navigation Guard (F-01):** Token-protected client routes mapped via `react-router-dom` grids, backed by a lightweight Zustand global client state management engine layer.
* **Low-Latency Dual-Video Mesh Grid (F-02):** Automated Peer-to-Peer camera and microphone connection pipelines using native browser WebRTC constructors. Employs a custom delay-buffered signaling handler to split screen layouts automatically side-by-side upon peer arrival.
* **On-the-Fly Screen Content Presenter (F-02):** Dynamic media display capture track swappers that inject open application windows inside active connection streams without interrupting current calls.
* **Automated AI Intelligence Hub (F-03 & F-05):** Single-click smart report generator that extracts core call summaries and individual task ownership arrays onto a clean dashboard presentation panel card.

### ⚙️ Backend Architecture Engine (Week 1 Foundation)
* **User Authentication & Hashing:** Fully validated registration and login check loops featuring secure password hashing implementations via `bcryptjs`.
* **Stateless Session Guard:** Cryptographically fortified endpoint security utilizing dual short-lived Access Tokens (15m) and long-lived Refresh Tokens (7d) managed via `jsonwebtoken`.
* **Relational Meeting Room Allocator:** Dynamic database row allocation mapping unique 9-character room codes (`abc-def-ghi`) directly to specific Host IDs in MongoDB.
* **WebSocket Message Pipeline:** Event-driven multi-user socket clustering supporting real-time user room entry, active presence states, and bi-directional text chats.
* **Media Upload Infrastructure:** Scalable multipart file parsing logic implemented via `multer` alongside a configured cloud storage pipeline targeting `Cloudinary`.

---

## 🛠️ Unified Technology Stack

| Layer | Primary Technology | Rationale / Architecture Alternatives |
| :--- | :--- | :--- |
| **Frontend UI** | React 19 + TypeScript + Vite | Blazing-fast HMR compilation speeds, rigid type safety, and optimized module splitting. |
| **Styling Grid** | Tailwind CSS v4 | Utility-first architecture providing sleek enterprise dark layouts. |
| **State Engine** | Zustand | Lightweight client state management skipping heavy rendering context cycles. |
| **Backend Core** | Node.js + Express.js | Asynchronous, event-driven request loops built for heavy user traffic. |
| **Database Layer**| MongoDB Atlas (Mongoose) | High-throughput document schemas for dynamic calls and user tracking profiles. |
| **Real-Time Mesh**| WebRTC + Socket.io | Full-duplex WebSockets paired with decentralized peer-to-peer data streams. |

---

## 🚦 REST API Endpoints Map

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Registers a fresh user account and issues tokens |
| **POST** | `/api/auth/login` | Public | Authenticates credentials and returns user tokens |
| **GET** | `/api/auth/me` | Private | Extracts active Bearer token and returns session user |
| **PUT** | `/api/auth/avatar` | Private | Handles multipart form-data image upload paths |
| **POST** | `/api/meetings/create`| Private | Allocates unique meeting rooms mapping host profiles |

---

## 📡 Live WebSocket Events Mapped
* `join-room`: Bridges an authenticated user session socket directly to an active meeting room code track.
* `user-connected`: Signals to existing call room participants to trigger a WebRTC peer discovery handshake.
* `video-offer` / `video-answer`: Forwards cryptographic connection descriptors to open the peer data pipeline.
* `ice-candidate`: Syncs network candidate route pathways to bypass local firewalls and hardware blocks.
* `send-message` / `receive-message`: Broadcasts instant chat message data packets across meeting panel timelines.

---

## 📦 Local Installation & Deployment Guidelines

Ensure you have **Node.js 22+** and **MongoDB** configured locally before initializing setup routines.

### 1. Backend Server Inception
```bash
cd server
npm install
```
Configure your secure key parameters inside a clean **`.env`** file at the root of the server directory:
```env
PORT=8000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_session_encryption_key
```
Spin up the backend listener process engine:
```bash
node server.js
```

### 2. Frontend Client Inception
Open a separate terminal window pane workspace:
```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173/`** inside your web browser to enter the active dashboard lobby system.

---
*Developed with precision for Zidio Development Portfolio Project Submissions — April 2026.*

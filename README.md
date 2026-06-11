# 🚀 Realtime Chat Application

A full-stack realtime chat application built using **FastAPI**, **Next.js**, **PostgreSQL**, **Redis**, and **WebSockets**.

The application supports realtime messaging, online/offline presence, unread message tracking, read receipts, and infinite scrolling for chat history.

---

## ✨ Features

### 🔐 Authentication

- User Registration
- User Login
- JWT Authentication
- Protected Routes

### 💬 Messaging

- One-to-One Chat
- Realtime Messaging using WebSockets
- Persistent Message Storage
- Conversation Management

### 👥 User Features

- User Search
- Start New Conversations
- Online / Offline Presence
- Last Seen Status

### ✅ Read Receipts

- Message Seen Status
- Realtime Seen Updates
- Conversation Read Tracking

### 🔔 Notifications

- Unread Message Count
- Realtime Updates
- Conversation Ordering

### 📜 Chat History

- Infinite Scroll
- Message Pagination
- Conversation History

---

## 🛠️ Tech Stack

### Backend

- FastAPI
- PostgreSQL
- SQLAlchemy
- Redis
- WebSockets
- JWT Authentication

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Zustand

### Realtime Infrastructure

- Redis Pub/Sub
- FastAPI WebSockets

---

## 🏗️ System Architecture

```text
Frontend (Next.js)
        │
        ▼
WebSocket Connection
        │
        ▼
FastAPI Backend
        │
 ┌──────┴──────┐
 ▼             ▼
PostgreSQL    Redis Pub/Sub
(Messages)    (Realtime Events)
```

---

## 📂 Project Structure

```text
Whatsapp-Clone/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── hooks/
│
├── routers/
├── services/
├── schemas/
├── Models/
├── websocket/
├── redisc/
├── core/
├── Depends/
│
├── app.py
├── db.py
└── README.md
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/Vivek11004/Whatsapp-Clone.git

cd Whatsapp-Clone
```

---

## Backend Setup

### Create Virtual Environment

```bash
python -m venv .venv
```

### Activate Environment

Windows

```bash
.venv\Scripts\activate
```

Linux / Mac

```bash
source .venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost/chat_db

SECRET_KEY=your_secret_key

ALGORITHM=HS256

REDIS_URL=redis://localhost:6379
```

### Run Backend

```bash
uvicorn app:app --reload
```

Backend runs at:

```text
http://localhost:8000
```

---

## Frontend Setup

Move to frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000

NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

Run frontend:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

---



---



---

## 🔥 Implemented Features

- [x] JWT Authentication
- [x] User Search
- [x] Conversation Creation
- [x] Realtime Messaging
- [x] Redis Pub/Sub
- [x] Online Presence
- [x] Last Seen
- [x] Read Receipts
- [x] Unread Message Count
- [x] Infinite Scroll Pagination
- [x] Responsive UI

---

## 📈 Future Improvements

- Typing Indicators
- Group Chats
- File Sharing
- Message Reactions
- Voice Messages
- Push Notifications

---

## 👨‍💻 Author

**Vivek**

GitHub:
https://github.com/Vivek11004

LinkedIn:
www.linkedin.com/in/maraasu-vivekananda

---

## ⭐ Support

If you found this project useful, consider giving it a star ⭐ on GitHub.

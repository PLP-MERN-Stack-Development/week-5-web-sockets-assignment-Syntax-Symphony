# 💬 Real-Time Chat App – Socket.io Project (Week 5)

## 🚀 Project Overview

This is a real-time chat application built using **Node.js**, **Express**, **React**, and **Socket.io**. The app supports real-time bidirectional communication between users, showcasing live messaging, online status updates, typing indicators, and notifications.

This project was developed for the **PLP MERN Stack Development Program – Week 5 Assignment**.

---

## 🧪 Features Implemented

✅ User authentication (username-based)  
✅ Global public chat room  
✅ Live message updates  
✅ Display of sender name and timestamp  
✅ Typing indicators  
✅ Online users list  
✅ Join/leave notifications  
✅ Sound/browser notifications (optional)  

---

## 📁 Project Structure

project-root/
├── client/ # React front-end
│ ├── src/
│ │ ├── App.jsx
│ │ ├── socket.js
│ │ ├── main.jsx
│ │ └── index.css
│ └── vite.config.js
│
├── server/ # Express + Socket.io backend
│ └── index.js
│
└── README.md


---

## 🛠️ Setup Instructions

### 🔧 Prerequisites
- Node.js (v18+)
- npm

---

### 🖥️ Local Installation

#### 1. Clone the Repository

```bash
git clone <your-repo-link>
cd <project-folder>
2. Install Server Dependencies
bash
Copy
Edit
cd server
npm install
npm run dev
3. Install Client Dependencies
bash
Copy
Edit
cd ../client
npm install
npm run dev
4. Access the App
Frontend: http://localhost:5173

Backend: http://localhost:5000



# Taskly FRONTEND

Taskly [Backend](https://github.com/daniojey/Taskly-backend.git)
 
**Real-time task and team management platform with live notifications, session tracking, and built-in task discussions.**
 
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
 
[Features](#features) • [Tech Stack](#tech-stack) • [Screenshots](#screenshots) • [Getting Started](#getting-started) • [Demo](#demo)
 
---
 
## Overview
 
Taskly is a group-based project management tool built for teams that need to organize work, track time, and communicate — all in one place. Managers can organize users into groups, spin up projects, assign tasks with deadlines, and see real-time statistics on how their team is spending time. Every task doubles as a lightweight chat, so discussion never gets separated from the work itself.
 
<!-- Optional: 1-2 sentence "why I built this" or "what problem it solves" can go here -->
 
## Features
 
### 👥 Group & Access Management
- Create user groups and invite members
- Group managers assign task-level access to specific users
- Role-based permissions between managers and regular members
### 📋 Projects & Tasks
- Create projects inside a group
- Add tasks with assignees and deadlines
- Per-task access control — managers grant visibility to specific group members
### 💬 Task Discussions
- Built-in chat scoped to each task
- Discuss approach, blockers, and suggestions without leaving the task
### ⏱️ Time Tracking
- Start/stop session timers directly on a task
- Manager-facing statistics: total sessions, average session duration, and per-user breakdowns
### 🔔 Real-Time Notifications
- WebSocket-based live notifications
- Notification events generated server-side via Celery + Redis, delivered instantly to connected clients
## Tech Stack
 
| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Vite |
 
## Screenshots
 
<!-- Add screenshots here once ready. Replace each placeholder line with:
![Alt text](path/to/screenshot.png)
-->
 
**GroupPage**
 
<div align="center">
  <img src="screenshots/group_page.png">
</div>
 
**Group management**
 
<div align="center">
  <img src="screenshots/group_detail.png">
</div>
 
**Tasks view**
 
<div align="center">
  <img src="screenshots/tasks_view.png">
</div>
 
**Task discussion (chat)**
 
<div align="center">
  <img src="screenshots/chat_discussion.png">
</div>
 
**Manager statistics**
 
<div align="center">
  <img src="screenshots/task_statistic.png">
</div>

---

<div align="center">
  <img src="screenshots/diagram_count.png">
</div>

---

<div align="center">
  <img src="screenshots/diagram_duration.png">
</div>

---

<div align="center">
  <img src="screenshots/diagram_users.png">
</div>
 
## Demo
 
<!-- Add a short screen recording / GIF / hosted demo link here -->
 
> 🎥 Demo video coming soon
 
## Getting Started

I recommend starting the installation with the app's backend —> [Taskly Backend](https://github.com/daniojey/Taskly-backend)
 
### Prerequisites
- Node.js 18+ (for local frontend dev outside Docker, optional)
### Setup
 
```bash
# Clone the repository
git clone https://github.com/daniojey/Taskly-Frontend.git
cd Taskly-Frontend

# Create a .env file in the project root (Taskly-Frontend folder)
# And specify the parameters as shown in this example 

VITE_REACT_APP_API_BASE_URL = http://localhost:8000/ # example your backend url 
VITE_REACT_APP_API_BASE_URL_IMAGES = http://localhost:8000 # example your backend url for images


# After create .env install requirements
npm install

# Finally run project!!
npm run dev

```
 
The app will be available at `http://localhost:5173`.

And for the app to start working, we'll also need to set up the backend
 
---
 
Built by [Dmytro](https://github.com/daniojey)

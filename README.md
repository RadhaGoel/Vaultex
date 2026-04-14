 ⚡ Vaultex — Automated Backup & Recovery Manager

A full-stack backup management system inspired by enterprise tools like **Veeam** and **Commvault**. Built with Node.js, Express, MongoDB, and Shell scripting — featuring an admin dashboard, concurrent child-process backups, and point-in-time recovery using binary search.

---

## 🚀 Features

- **Express Admin Dashboard** — Manage and monitor all backups from a clean dark-themed web UI
- **MongoDB Metadata Storage** — Tracks backup records, checksums, status, and timestamps
- **Node.js Child Processes** — Executes backup tasks concurrently using `fork()` without blocking the server
- **Real ZIP Compression** — Uses `archiver` package to create actual zip backups of files/folders
- **Shell Script Support** — `backup.sh` for compress and permission setting
- **Unix Permissions** — Restricts backup file access with `chmod 600`
- **Git Policy Tracking** — Backup configs and schedules tracked for auditing
- **Point-in-Time Recovery** — Binary search algorithm to find the closest backup to any timestamp in O(log n)
- **MD5 Checksum Verification** — Ensures backup integrity after every job
- **Cron Job Scheduling** — Automated backup execution using `node-cron`
- **Recovery Audit Logs** — Every recovery request is logged in MongoDB

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Frontend | HTML, CSS, JS |
| Compression | Archiver (ZIP) |
| Scripting | Bash (Shell Scripts) |
| Security | Unix File Permissions (`chmod 600`) |
| Scheduling | node-cron |
| Versioning | Git |

---

## 📁 Project Structure

```bash
Vaultex/
├── backend/
│   ├── backups/                        # Generated ZIP backup files (auto-created)
│   └── src/
│       ├── config/
│       │   └── db.js                   # MongoDB connection setup
│       ├── controllers/
│       │   ├── backupController.js     # Backup create, schedule, delete logic
│       │   └── recoveryController.js   # Point-in-time recovery logic
│       ├── models/
│       │   ├── Backup.js               # Backup mongoose schema
│       │   └── Recovery.js             # Recovery audit log schema
│       ├── routes/
│       │   ├── backupRoutes.js
│       │   ├── recoveryRoutes.js
│       │   └── statsRoutes.js
│       ├── services/
│       │   ├── binarySearch.js
│       │   └── checksum.js
│       ├── workers/
│       │   └── backupWorker.js
│       └── server.js
├── public/
│   ├── css/
│   │   └── style.css
│   ├── index.html
│   └── app.js
├── scripts/
│   └── backup.sh
├── .env
├── .gitignore
├── package.json
└── README.md

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (running locally)
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/RadhaGoel/Vaultex.git
cd Vaultex

# 2. Go to backend
cd backend

# 3. Install dependencies
npm install

# 4. Configure environment variables
# Create .env file in root with:
PORT=3000
MONGO_URI=mongodb://localhost:27017/backupdb
BACKUP_DIR=./backups
ENCRYPTION_KEY=mysecretkey123

# 5. Start the server
npm start
```

Open your browser and go to: **http://localhost:3000**

---

## 🔑 Environment Variables

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/backupdb
BACKUP_DIR=./backups
ENCRYPTION_KEY=your_secret_key_here
```

---

## 📡 API Endpoints

### Backup Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/backups` | Fetch all backup records |
| `POST` | `/api/backups/create` | Create and run a new backup |
| `POST` | `/api/backups/schedule` | Schedule a future backup |
| `DELETE` | `/api/backups/:id` | Delete a backup record |

### Recovery Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/recovery/point-in-time` | Find recovery point using binary search |
| `GET` | `/api/recovery/logs` | Get all recovery audit logs |

### Stats Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Get dashboard statistics |

### Example — Create Backup

```bash
curl -X POST http://localhost:3000/api/backups/create \
  -H "Content-Type: application/json" \
  -d '{"filename": "mybackup", "destination": "./src"}'
```

### Example — Point-in-Time Recovery

```bash
curl -X POST http://localhost:3000/api/recovery/point-in-time \
  -H "Content-Type: application/json" \
  -d '{"timestamp": "2026-03-27T13:45:00.000Z"}'
```

---

## 🔍 How Point-in-Time Recovery Works

The recovery system uses **Binary Search** to efficiently find the closest backup to any given timestamp:

1. All completed backups are fetched and sorted by `completedAt` (ascending)
2. Binary search runs on the sorted array
3. It finds the latest backup that is **≤ the target timestamp**
4. Returns the exact recovery point in **O(log n)** time
Backups: [12:00] [12:30] [13:00] [13:30] [14:00]
Target:   13:45
Result:  → 13:30  ✅ (closest backup before target)

---

## ⚙️ How Child Process Works
User clicks "Start Backup"
↓
backupController.js — validates path
↓
fork() — spawns backupWorker.js as child process
↓
backupWorker.js — creates real ZIP using archiver
↓
On success — MD5 checksum generated, MongoDB updated
↓
Status → completed ✅

---

## 🔒 Security

- **`chmod 600`** applied to every backup file
- Encryption key stored in `.env` (never committed to Git)
- `.gitignore` excludes `node_modules/`, `.env`, and `backups/`

---

## 📊 Dashboard Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Overview stats — total backups, success rate, failed jobs |
| **Backup Status** | Progress bars for each backup job |
| **Schedules** | Create new backups, view all backup records |
| **Logs** | Timestamped log of all backup activity |
| **Restore** | Point-in-time recovery with datetime picker |
| **Settings** | View and save backup configuration |

---

## 📦 Dependencies

```json
{
  "express": "^5.x",
  "mongoose": "^9.x",
  "dotenv": "^17.x",
  "node-cron": "^4.x",
  "archiver": "^7.x",
  "bcryptjs": "^3.x"
}
```

---

## 🧪 Development

```bash
# Run with auto-restart
npm run dev

# Seed sample data
npm run seed
```

---

> Built as a college mini project demonstrating enterprise-grade backup architecture using Node.js, Express, MongoDB, Shell scripting, and Unix system tools.
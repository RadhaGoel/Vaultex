# ⚡ Vaultex — Automated Backup & Recovery Manager

A full-stack backup management system inspired by enterprise tools like **Veeam** and **Commvault**. Built with Node.js, Express, MongoDB, and Shell scripting — featuring an admin dashboard, concurrent backups, and point-in-time recovery using binary search.

---

## 🚀 Features

- **Express Admin Dashboard** — Manage and monitor all backups from a clean web UI
- **MongoDB Metadata Storage** — Tracks backup records, checksums, status, and timestamps
- **Node.js Child Processes** — Executes backup tasks concurrently without blocking the server
- **Shell Script Compression** — Uses `tar` + `gzip` to compress backup files
- **Unix Permissions** — Restricts backup file access with `chmod 600`
- **Git Policy Tracking** — Backup configs and schedules tracked for auditing
- **Point-in-Time Recovery** — Binary search algorithm to find the closest backup to any timestamp
- **MD5 Checksum Verification** — Ensures backup integrity after every job

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Frontend | HTML, CSS, Vanilla JS |
| Scripting | Bash (Shell Scripts) |
| Security | Unix File Permissions (`chmod 600`) |
| Versioning | Git |

---

## 📁 Project Structure

```
backup-system/
├── src/
│   ├── server.js                  # Express server entry point
│   ├── controllers/
│   │   └── backupController.js    # Backup logic, binary search recovery
│   ├── models/
│   │   └── Backup.js              # Mongoose schema
│   └── routes/
│       └── backup.js              # API routes
├── public/
│   ├── index.html                 # Admin dashboard UI
│   └── css/
│       └── style.css              # Dashboard styles
├── backups/                       # Generated backup files (auto-created)
├── backup.sh                      # Shell script: compress + set permissions
├── .env                           # Environment variables
├── .gitignore
└── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (running locally or Atlas URI)
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/vaultex.git
cd vaultex

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and settings

# 4. Start the server
npm start
```

Open your browser and go to: **http://localhost:3000**

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/backupdb
BACKUP_DIR=./backups
ENCRYPTION_KEY=mysecretkey123
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/backups` | Fetch all backup records |
| `POST` | `/api/backups/create` | Create and run a new backup |
| `POST` | `/api/backups/recovery` | Point-in-time recovery (binary search) |
| `DELETE` | `/api/backups/:id` | Delete a backup record |

### Example — Create Backup

```bash
curl -X POST http://localhost:3000/api/backups/create \
  -H "Content-Type: application/json" \
  -d '{"filename": "mybackup", "destination": "./src"}'
```

### Example — Point-in-Time Recovery

```bash
curl -X POST http://localhost:3000/api/backups/recovery \
  -H "Content-Type: application/json" \
  -d '{"timestamp": "2025-01-15T14:30:00.000Z"}'
```

---

## 🔍 How Point-in-Time Recovery Works

The recovery system uses **Binary Search** to efficiently find the closest backup to any given timestamp:

1. All completed backups are fetched and sorted by `completedAt` (ascending)
2. Binary search runs on the sorted array
3. It finds the latest backup that is **≤ the target timestamp**
4. Returns the exact recovery point in **O(log n)** time

```
Backups: [Jan 1] [Jan 5] [Jan 10] [Jan 15] [Jan 20]
Target:   Jan 13
Result:  → Jan 10  ✅ (closest backup before target)
```

---

## 🔒 Security

- **`chmod 600`** applied to every backup file — only the file owner can read/write
- Encryption key stored in `.env` (never committed to Git)
- `.gitignore` excludes `node_modules/`, `.env`, and `backups/`

---

## 🐚 Shell Script

`backup.sh` handles compression and permission setting:

```bash
./backup.sh <backup-name> <source-path>
```

- Compresses the source using `tar -czf` (gzip)
- Names files with timestamps: `filename_YYYYMMDD_HHMMSS.tar.gz`
- Sets `chmod 600` for secure file access

---

## 📊 Dashboard Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Overview stats — total backups, success rate, failed jobs |
| **Backup Status** | Progress bars for each backup job |
| **Schedules** | Create new backups, view all backup records |
| **Logs** | Timestamped log of all backup activity |
| **Restore** | Point-in-time recovery with datetime picker |
| **Settings** | View backup configuration (directory, DB URI, key) |

---

## 📦 Dependencies

```json
{
  "express": "^5.2.1",
  "mongoose": "^9.3.3",
  "dotenv": "^17.3.1",
  "node-cron": "^4.2.1",
  "archiver": "^7.0.1",
  "multer": "^2.1.1",
  "bcryptjs": "^3.0.3"
}
```

---

## 🧪 Development

```bash
# Run in development mode with auto-restart
npm run dev
```

Make sure MongoDB is running before starting the server.

---

## 📄 License

MIT License — Free to use and modify.

---

> Built as a demonstration of enterprise-grade backup architecture using Node.js, Express, MongoDB, Shell scripting, and Unix system tools.
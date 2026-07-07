# Tic Tac Toe — 2-Player Local Web Game

A fully responsive, full-stack Tic Tac Toe game for two local players.  
The frontend is built with plain HTML, CSS, and JavaScript. The backend is a **Node.js + Express** REST API that supports both **MongoDB** and **MySQL** as the persistence layer.

---

## 📁 Project Structure

```
TicTacToe/
├── frontend/
│   ├── index.html          ← Main game page
│   ├── style.css           ← Responsive stylesheet
│   └── app.js              ← Game logic + API calls
│
└── backend/
    ├── server.js           ← Express app entry point
    ├── package.json
    ├── .env.example        ← Environment variable template
    ├── .gitignore
    ├── config/
    │   ├── db.js           ← DB connection manager (MongoDB or MySQL)
    │   └── schema.mysql.js ← MySQL table migration script
    ├── models/
    │   ├── Game.mongo.js         ← Mongoose Game schema
    │   └── PlayerStats.mongo.js  ← Mongoose PlayerStats schema
    └── routes/
        ├── games.js          ← Router: /api/games
        ├── games.mongo.js    ← MongoDB handlers for games
        ├── games.mysql.js    ← MySQL handlers for games
        ├── players.js        ← Router: /api/leaderboard
        ├── players.mongo.js  ← MongoDB leaderboard handler
        └── players.mysql.js  ← MySQL leaderboard handler
```

---

## 🚀 Quick Start

### 1. Prerequisites

| Tool | Min Version | Download |
|------|-------------|----------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Included with Node.js |
| MongoDB **or** MySQL | any recent | See sections below |

---

### 2. Install Backend Dependencies

```bash
cd TicTacToe/backend
npm install
```

---

### 3. Configure Environment Variables

```bash
# Copy the template
cp .env.example .env
```

Open `.env` in your editor and fill in the values for your chosen database (see sections below).

---

## 🍃 Option A — MongoDB Setup

### 3a. Local MongoDB

1. **Install MongoDB Community Server**  
   Download from https://www.mongodb.com/try/download/community  
   Follow the installer for your OS.

2. **Start the MongoDB service**

   ```bash
   # macOS / Linux (with Homebrew)
   brew services start mongodb-community

   # Windows — run as Administrator
   net start MongoDB

   # Or start manually
   mongod --dbpath /data/db
   ```

3. **Set the `.env` variables**

   ```env
   DB_TYPE=mongodb
   MONGO_URI=mongodb://localhost:27017/tictactoe
   ```

   The `tictactoe` database and all collections are **created automatically** on first run.

### 3b. MongoDB Atlas (Cloud — free tier available)

1. Create an account at https://cloud.mongodb.com  
2. Create a free **M0** cluster.
3. In **Database Access**, create a database user with read/write permissions.
4. In **Network Access**, add your IP address (or `0.0.0.0/0` for development).
5. Click **Connect → Connect your application**, copy the connection string.
6. Paste it into `.env`:

   ```env
   DB_TYPE=mongodb
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tictactoe?retryWrites=true&w=majority
   ```

---

## 🐬 Option B — MySQL Setup

### 3c. Install MySQL

- **Windows:** Download MySQL Installer from https://dev.mysql.com/downloads/installer/  
- **macOS:** `brew install mysql`  
- **Linux (Debian/Ubuntu):** `sudo apt install mysql-server`

### 3d. Create the Database

Connect to MySQL with the root user and run:

```sql
CREATE DATABASE IF NOT EXISTS tictactoe
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Optional: create a dedicated user
CREATE USER 'ttt_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON tictactoe.* TO 'ttt_user'@'localhost';
FLUSH PRIVILEGES;
```

> ⚠️ **Tables are created automatically** by the migration script in `config/schema.mysql.js`  
> when the server starts for the first time. You do **not** need to run any SQL manually beyond the `CREATE DATABASE` step.

### 3e. Set the `.env` variables

```env
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=ttt_user
MYSQL_PASSWORD=StrongPassword123!
MYSQL_DB=tictactoe
```

---

## 4. Start the Backend Server

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

You should see:

```
✅  Connected to MongoDB   ← (or MySQL)
✅  Server running on http://localhost:3000
```

Test the server is alive:

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"..."}
```

---

## 5. Open the Frontend

Open `TicTacToe/frontend/index.html` in your browser.  
No build step needed — it's plain HTML/CSS/JS.

> **Tip:** If your browser blocks `fetch()` requests to localhost due to CORS or file:// restrictions,  
> serve the frontend with any simple HTTP server:
>
> ```bash
> # Using Node.js (npx)
> npx serve TicTacToe/frontend
>
> # Using Python
> python -m http.server 8080 --directory TicTacToe/frontend
> ```
>
> Then navigate to `http://localhost:8080`.

---

## 🌐 API Reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Server health check |
| `POST` | `/api/games` | Save a completed game session |
| `GET`  | `/api/games?limit=10` | List recent games |
| `GET`  | `/api/games/:id` | Get a specific game |
| `DELETE` | `/api/games/:id` | Delete a game record |
| `GET`  | `/api/leaderboard` | Get player leaderboard (sorted by wins) |

### POST `/api/games` — Payload

```json
{
  "playerX":  "Alice",
  "playerO":  "Bob",
  "scoreX":   3,
  "scoreO":   1,
  "draws":    1,
  "rounds":   5,
  "history":  [ ... ]
}
```

---

## 🎮 How to Play

1. Open `index.html` in the browser.  
2. Enter names for **Player 1 (X)** and **Player 2 (O)** and click **Start Game**.  
3. Players take turns clicking cells on the 3×3 board.  
4. The first to get 3 in a row (horizontal, vertical, or diagonal) wins the round.  
5. Use **New Round** to play another round while keeping the score.  
6. Use **Reset Scores** to start a fresh series.  
7. Click **Save Game to Database** to persist the session — the Leaderboard and Recent Games tables update automatically.

---

## 🔧 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port the server listens on |
| `CORS_ORIGIN` | `*` | Allowed frontend origin for CORS |
| `DB_TYPE` | `mongodb` | Database engine: `mongodb` or `mysql` |
| `MONGO_URI` | `mongodb://localhost:27017/tictactoe` | MongoDB connection URI |
| `MYSQL_HOST` | `localhost` | MySQL host |
| `MYSQL_PORT` | `3306` | MySQL port |
| `MYSQL_USER` | `root` | MySQL user |
| `MYSQL_PASSWORD` | *(empty)* | MySQL password |
| `MYSQL_DB` | `tictactoe` | MySQL database name |

---

## 📦 Backend Dependencies

| Package | Purpose |
|---------|---------|
| `express` | HTTP server & routing |
| `cors` | Cross-Origin Resource Sharing middleware |
| `helmet` | Security HTTP headers |
| `morgan` | HTTP request logger |
| `dotenv` | Loads `.env` into `process.env` |
| `mongoose` | MongoDB ODM (used when `DB_TYPE=mongodb`) |
| `mysql2` | MySQL client with promise support (used when `DB_TYPE=mysql`) |
| `nodemon` *(dev)* | Auto-restart server on file changes |

---

## 🛡️ Security Notes

- Never commit your `.env` file. It is listed in `.gitignore`.  
- Use strong passwords for database users in production.  
- Set `CORS_ORIGIN` to your specific frontend URL in production instead of `*`.

---

## 📄 License

MIT

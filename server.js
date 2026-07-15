import express from "express";
import pg from "pg";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me";
const PROJECT_NAME = process.env.PROJECT_NAME || "our product";

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL. Add a Postgres database in Railway.");
  process.exit(1);
}

const noSslNeeded =
  process.env.PGSSL === "false" ||
  DATABASE_URL.includes("localhost") ||
  DATABASE_URL.includes("127.0.0.1") ||
  DATABASE_URL.includes("host=/");

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: noSslNeeded ? false : { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      message TEXT NOT NULL,
      approved BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  console.log("Database ready.");
}

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "public")));

app.get("/api/config", (req, res) => res.json({ projectName: PROJECT_NAME }));

// Submit feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const role = (req.body.role || "").trim() || null;
    const rating = parseInt(req.body.rating, 10);
    const message = (req.body.message || "").trim();
    if (!name || !message) return res.status(400).json({ error: "Name and message are required." });
    if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: "Pick a rating from 1 to 5 stars." });
    await pool.query(
      "INSERT INTO feedback (name, role, rating, message) VALUES ($1, $2, $3, $4)",
      [name, role, rating, message]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Public wall: only approved testimonials
app.get("/api/wall", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT name, role, rating, message, created_at FROM feedback WHERE approved = true ORDER BY created_at DESC"
  );
  res.json({ testimonials: rows });
});

function checkAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (token !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// Admin: list all
app.get("/api/admin/feedback", checkAdmin, async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM feedback ORDER BY created_at DESC");
  res.json({ total: rows.length, feedback: rows });
});

// Admin: approve / unapprove
app.post("/api/admin/approve", checkAdmin, async (req, res) => {
  const id = parseInt(req.body.id, 10);
  const approved = !!req.body.approved;
  await pool.query("UPDATE feedback SET approved = $1 WHERE id = $2", [approved, id]);
  res.json({ ok: true });
});

// Admin: delete
app.post("/api/admin/delete", checkAdmin, async (req, res) => {
  const id = parseInt(req.body.id, 10);
  await pool.query("DELETE FROM feedback WHERE id = $1", [id]);
  res.json({ ok: true });
});

initDb()
  .then(() => app.listen(PORT, () => console.log(`${PROJECT_NAME} running on port ${PORT}`)))
  .catch((err) => { console.error("Failed to start:", err); process.exit(1); });

import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(express.json());
app.use(express.static("backend")); // Serve static files (e.g., HTML, CSS)

let db;

// Open or create the SQLite database
async function openDb() {
  db = await open({
    filename: './backend/database.db',
    driver: sqlite3.Database
  });

  await db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT
    )
  `);
}

// Initialize DB connection
openDb().catch(err => console.log(err));

// POST request: Add new item
app.post("/items", async (req, res) => {
  const { name, description } = req.body;
  await db.run('INSERT INTO items (name, description) VALUES (?, ?)', [name, description]);
  res.status(201).send("Item added successfully!");
});

// GET request: Retrieve all items
app.get("/items", async (req, res) => {
  const items = await db.all('SELECT * FROM items');
  res.json(items);
});

// DELETE request: Delete item by ID
app.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  await db.run('DELETE FROM items WHERE id = ?', [id]);
  res.status(200).send("Item deleted successfully!");
});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});




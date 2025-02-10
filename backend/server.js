import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { DB } from "https://deno.land/x/sqlite@v3.7.2/mod.ts";

const db = new DB("database.db");

// Create table if it doesn't exist
db.execute(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  )
`);

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (req.method === "GET" && pathname === "/items") {
    // Fetch all items
    const rows = [...db.query("SELECT * FROM items")];
    return new Response(JSON.stringify(rows), {
      headers: { "Content-Type": "application/json" },
    });
  } else if (req.method === "POST" && pathname === "/items") {
    // Add a new item
    const body = await req.json();
    db.query("INSERT INTO items (name, description) VALUES (?, ?)", [
      body.name,
      body.description,
    ]);
    return new Response("Item added successfully");
  } else if (req.method === "DELETE" && pathname.startsWith("/items/")) {
    // Delete an item by ID
    const id = pathname.split("/")[2];
    db.query("DELETE FROM items WHERE id = ?", [id]);
    return new Response("Item deleted successfully");
  }

  return new Response("Not found", { status: 404 });
});

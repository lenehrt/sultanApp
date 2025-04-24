import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const DATA_FILE  = path.join(__dirname, "users.json");

const app  = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

/* Helpers */
const readUsers  = async () => JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
const writeUsers = async (data) => fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));

/* Routes */
app.get("/api/users", async (_, res) => {
  res.json(await readUsers());
});

app.post("/api/users", async (req, res) => {
  const users = await readUsers();
  const nextId = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newUser = { id: nextId, ...req.body };
  users.push(newUser);
  await writeUsers(users);
  res.status(201).json(newUser);
});

app.put("/api/users/:id", async (req, res) => {
  const users = await readUsers();
  const idx   = users.findIndex(u => u.id === Number(req.params.id));
  if (idx === -1) return res.status(404).end();
  users[idx] = { ...users[idx], ...req.body };
  await writeUsers(users);
  res.json(users[idx]);
});

app.delete("/api/users/:id", async (req, res) => {
  const users = await readUsers();
  const newUsers = users.filter(u => u.id !== Number(req.params.id));
  await writeUsers(newUsers);
  res.status(204).end();
});

app.listen(port, () => console.log(`API ready → http://localhost:${port}`));

import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

app.get("/", (_req, res) => {
  res.send("👋 Hello World! Bondex Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
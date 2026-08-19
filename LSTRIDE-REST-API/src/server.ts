import "dotenv/config";
import app from "./app";
import "dotenv/config";

import express from "express";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
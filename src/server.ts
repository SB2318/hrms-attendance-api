import { createServer } from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./config/database.js";

const server = createServer(app);

const startServer = async () => {
  try {
    // Check DB connection
    await prisma.$connect();
    console.log(" Successfully connected to database");

    server.listen(env.port, () => {
      console.log(` Server running in ${env.nodeEnv} mode on port ${env.port}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  server.close(async () => {
    console.log("Closed out remaining connections");
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

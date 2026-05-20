import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema";
import "dotenv/config";
import { env } from "../env";

if (env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const client = new Client({
  connectionString: env.DATABASE_URL,
});

client.connect()
  .then(() => console.log("Successfully connected to PostgreSQL database."))
  .catch((err) => console.error("Database connection error:", err));

export const db = drizzle(client, { schema });

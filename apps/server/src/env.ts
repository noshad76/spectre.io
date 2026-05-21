import { config } from "dotenv";
import { z } from "zod";

config();
console.log("Current Working Directory:", process.cwd());
console.log("DATABASE_URL from process.env:", process.env.DATABASE_URL);
const schema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

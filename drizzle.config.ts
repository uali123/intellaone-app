import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_MSda2c7pujhU@ep-hidden-king-a1ys9in3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  },
});

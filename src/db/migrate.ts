import { migrate } from "drizzle-orm/mysql2/migrator";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL environment variable is not defined");
    process.exit(1);
  }

  console.log("Connecting to the database for migrations...");

  // Create a temporary connection to run migrations
  const connection = await mysql.createConnection(url);
  const db = drizzle({ client: connection });

  console.log("Running pending migrations from './drizzle'...");
  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("Database migrations completed successfully!");
  await connection.end();
}

main().catch((err) => {
  console.error("Database migration failed:", err);
  process.exit(1);
});

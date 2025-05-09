import { pool } from "./db";

async function testConnection() {
  try {
    console.log("Testing database connection...");
    const result = await pool.query("SELECT NOW()");
    console.log("Database connection successful!");
    console.log("Current time from database:", result.rows[0].now);
  } catch (error) {
    console.error("Database connection failed!");
    console.error(error);
  } finally {
    await pool.end();
  }
}

testConnection(); 
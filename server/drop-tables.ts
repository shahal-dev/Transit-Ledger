import { pool } from "./db";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function dropTables() {
  try {
    // Read the SQL file
    const sql = readFileSync(join(__dirname, "migrations", "0001_drop_tables.sql"), "utf8");
    
    // Extract table names from the SQL
    const tableNames = sql.match(/DROP TABLE IF EXISTS (\w+)/g)?.map(line => line.split(' ')[4]) || [];
    
    // Truncate each table if it exists
    for (const tableName of tableNames) {
      try {
        await pool.query(`TRUNCATE TABLE ${tableName} CASCADE`);
        console.log(`Table ${tableName} truncated successfully`);
      } catch (error) {
        console.error(`Error truncating table ${tableName}:`, error);
      }
    }
    
    console.log("All tables truncated successfully");
  } catch (error) {
    console.error("Error truncating tables:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

dropTables(); 
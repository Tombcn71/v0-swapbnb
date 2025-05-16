import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the connection string
export const sql = neon(process.env.DATABASE_URL!)

// Helper function to execute raw SQL queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Log de query voor debugging
    console.log(`Executing query: ${query.substring(0, 100)}...`)
    console.log("Params:", params)

    // Gebruik sql.query in plaats van directe aanroep van sql
    const result = await sql.query(query, params)

    // Log het resultaat voor debugging
    console.log(`Query result: ${result.length} rows`)

    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Create Drizzle ORM instance
export const db = drizzle(sql)

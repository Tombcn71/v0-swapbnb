import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the connection string
export const sql = neon(process.env.DATABASE_URL!)

// Helper function to execute raw SQL queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Log the query for debugging
    console.log(`Executing query: ${query.substring(0, 100)}...`)
    console.log("Params:", params)

    // Use sql.query instead of direct call of sql
    const result = await sql.query(query, params)

    // Log the result for debugging
    console.log(`Query result: ${result.length} rows`)

    // For debugging, log the first row if available
    if (result.length > 0) {
      console.log("First row sample:", JSON.stringify(result[0]).substring(0, 200))
    }

    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Create Drizzle ORM instance
export const db = drizzle(sql)

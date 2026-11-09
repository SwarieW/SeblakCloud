import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool using our .env credentials
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
});

// A helper function to execute raw SQL queries
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Raw SQL script to create the users table if it doesn't exist
export const initializeDB = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await query(createUsersTable);
    console.log('✅ PostgreSQL Database initialized and "users" table is ready.');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTable() {
  try {
    console.log('📝 Creating pro_creator_codes table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pro_creator_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(12) UNIQUE NOT NULL,
        is_used BOOLEAN DEFAULT false,
        used_by_user_id VARCHAR(255),
        used_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ pro_creator_codes table created successfully');
    
    // Test insert
    const testCode = 'TEST' + Math.random().toString(36).substring(2, 8).toUpperCase();
    await pool.query(`
      INSERT INTO pro_creator_codes (code, expires_at)
      VALUES ($1, $2)
    `, [testCode, new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)]);
    
    console.log(`✅ Test code created: ${testCode}`);
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    await pool.end();
  }
}

createTable();
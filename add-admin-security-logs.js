import { Pool } from '@neondatabase/serverless';

async function addAdminSecurityLogs() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('🔐 Creating admin_security_logs table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_security_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ admin_security_logs table created successfully');
    
    // Test insert
    await pool.query(`
      INSERT INTO admin_security_logs (event_type, ip_address, user_agent, details, created_at)
      VALUES (
        'table_creation',
        '127.0.0.1',
        'migration-script',
        '{"event": "admin_security_logs table created"}',
        NOW()
      )
    `);
    
    console.log('✅ Test log entry created');
    
  } catch (error) {
    console.error('❌ Error creating admin_security_logs table:', error);
  } finally {
    await pool.end();
  }
}

addAdminSecurityLogs();
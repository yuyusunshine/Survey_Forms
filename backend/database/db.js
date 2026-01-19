import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // Azure PostgreSQL需要SSL
  },
  max: 20, // 连接池最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 增加超时时间到10秒
});

// 连接错误处理
pool.on('error', (err) => {
  console.error('数据库连接池错误:', err);
});

// 测试连接
async function testConnection() {
  let client;
  try {
    console.log('正在测试数据库连接...');
    console.log(`主机: ${process.env.DB_HOST}`);
    console.log(`端口: ${process.env.DB_PORT}`);
    console.log(`数据库: ${process.env.DB_NAME}`);
    console.log(`用户: ${process.env.DB_USER}`);
    
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✓ 数据库连接成功！当前时间:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('✗ 数据库连接失败:');
    console.error('错误消息:', error.message);
    
    throw error;
  } finally {
    if (client) client.release();
  }
}

export async function initDatabase() {
  // 先测试连接
  await testConnection();
  
  const client = await pool.connect();
  try {
    console.log('正在初始化数据库表...');
    
    // 创建提交表
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(255) PRIMARY KEY,
        company_name VARCHAR(500),
        contact_name VARCHAR(200),
        position VARCHAR(200),
        phone VARCHAR(50),
        email VARCHAR(200),
        company_size VARCHAR(100),
        industry VARCHAR(200),
        cooperation_intent TEXT,
        project_description TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建文件表
    await client.query(`
      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(255) PRIMARY KEY,
        submission_id VARCHAR(255) NOT NULL,
        question_id VARCHAR(255) NOT NULL,
        filename VARCHAR(500) NOT NULL,
        original_name VARCHAR(500) NOT NULL,
        filepath TEXT NOT NULL,
        mimetype VARCHAR(200),
        size INTEGER,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
      )
    `);

    console.log('✓ 数据库表初始化成功');
  } catch (error) {
    console.error('✗ 数据库初始化失败:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
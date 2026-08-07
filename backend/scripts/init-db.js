import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { config } from '../src/config/index.js';

const { Pool } = pg;

async function initDb() {
    console.log('Connecting to PostgreSQL database...');
    
    if (!config.db.url) {
        console.error('Error: DATABASE_URL environment variable is missing.');
        process.exit(1);
    }
    
    const pool = new Pool({
        connectionString: config.db.url,
        ssl: config.db.ssl
    });

    try {
        const sqlPath = path.join(__dirname, '../src/data/init.sql');
        console.log(`Reading SQL from ${sqlPath}...`);
        
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Executing schema initialization script...');
        await pool.query(sql);
        
        console.log('✅ Database initialized successfully.');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
}

initDb();

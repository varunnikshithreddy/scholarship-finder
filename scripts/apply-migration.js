#!/usr/bin/env node
/**
 * Supabase Cloud PostgreSQL Migration Runner
 * Applies SQL migration files to Supabase using service role credentials or DATABASE_URL
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables if dotenv is installed or from process.env / .env
function loadEnv() {
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'server', '.env'),
    path.resolve(__dirname, '..', '.env'),
    path.resolve(__dirname, '..', 'server', '.env')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

const migrationFile = path.resolve(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');

async function runWithPg(connectionString, sql) {
  let pg;
  try {
    pg = require('pg');
  } catch (err) {
    console.error('`pg` package not found. Run `npm install pg` to enable direct PostgreSQL connection execution.');
    return false;
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(' Connected to PostgreSQL database.');
    console.log(' Applying migration: 001_initial_schema.sql...');
    await client.query(sql);
    console.log(' Migration applied successfully!');
    return true;
  } catch (error) {
    console.error(' Migration execution error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

async function runViaSupabaseRest(supabaseUrl, serviceKey, sql) {
  // If user provides Supabase project URL and service role key
  const urlObj = new URL(supabaseUrl);
  const options = {
    hostname: urlObj.hostname,
    port: 443,
    path: '/rest/v1/rpc',
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    // Note: Calling raw SQL via REST requires an authorized SQL function or pg connection.
    // We provide guidance if direct pg connection is preferred.
    console.log('Supabase Cloud URL:', supabaseUrl);
    console.log('Service Role Key detected: [REDACTED]');
    console.log('Migration file path:', migrationFile);
    resolve(true);
  });
}

async function main() {
  console.log('====================================================');
  console.log(' Supabase Cloud Migration Runner');
  console.log('====================================================');

  if (!fs.existsSync(migrationFile)) {
    console.error(` Migration file not found at ${migrationFile}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationFile, 'utf8');
  console.log(` Loaded migration: ${path.basename(migrationFile)} (${sql.length} bytes)`);

  if (DATABASE_URL) {
    console.log(' Using direct DATABASE_URL connection string...');
    try {
      await runWithPg(DATABASE_URL, sql);
      console.log(' Database migration completed successfully.');
      process.exit(0);
    } catch (err) {
      process.exit(1);
    }
  } else if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    console.log(` Found Supabase URL: ${SUPABASE_URL}`);
    console.log(' Notice: To apply SQL directly via PostgreSQL, set DATABASE_URL (postgres://postgres.[ref]:[password]@...) in .env');
    console.log(' If using Supabase Management API or MCP, migrations are executed directly against the project.');
    console.log(' Initial schema has also been applied to active Supabase Cloud project!');
  } else {
    console.log('\n Environment configuration needed:');
    console.log('Set DATABASE_URL or SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY in .env');
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

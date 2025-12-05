const { Client } = require('pg');

const configs = [
  { host: '127.0.0.1', user: 'postgres', password: 'postgres', database: 'whiteboard', port: 5432, name: 'IPv4 (127.0.0.1)' },
  { host: 'localhost', user: 'postgres', password: 'postgres', database: 'whiteboard', port: 5432, name: 'Localhost' },
];

async function test() {
  console.log('🔍 Testing Database Connection...\n');

  for (const config of configs) {
    console.log(`Testing ${config.name} connection...`);
    const client = new Client({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    });

    try {
      await client.connect();
      console.log(`✅ Success: Connected to ${config.host}:${config.port}`);
      const res = await client.query('SELECT NOW()');
      console.log(`   Time from DB: ${res.rows[0].now}`);
      await client.end();
    } catch (err) {
      console.log(`❌ Failed: Could not connect to ${config.host}:${config.port}`);
      console.log(`   Reason: ${err.message}\n`);
    }
  }
}

test();

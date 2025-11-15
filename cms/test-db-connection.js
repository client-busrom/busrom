const { exec } = require('child_process');
const net = require('net');

console.log('Testing PostgreSQL connection...\n');

// Test 1: Check if port is open
console.log('1. Testing if port 5432 is reachable...');
const client = new net.Socket();
client.setTimeout(5000);

client.on('connect', () => {
  console.log('✓ Port 5432 is open and accepting connections\n');
  client.destroy();

  // Test 2: Try Prisma connection
  console.log('2. Testing Prisma database connection...');
  exec('npx prisma db execute --stdin --schema=schema.prisma <<< "SELECT 1;"', (error, stdout, stderr) => {
    if (error) {
      console.log('✗ Prisma connection failed:');
      console.log('Error:', error.message);
      console.log('Stderr:', stderr);
    } else {
      console.log('✓ Prisma connection successful');
      console.log('Output:', stdout);
    }
  });
});

client.on('timeout', () => {
  console.log('✗ Connection timeout - port may be blocked\n');
  client.destroy();
  process.exit(1);
});

client.on('error', (err) => {
  console.log('✗ Connection error:', err.message, '\n');
  process.exit(1);
});

client.connect(5432, 'localhost');

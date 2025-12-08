const express = require('express');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Hàm đọc secret từ Docker Secrets hoặc environment
function getSecret(secretName) {
  try {
    // Cách 1: Đọc từ Docker secret file
    const secretPath = `/run/secrets/${secretName}`;
    if (fs.existsSync(secretPath)) {
      console.log(`✅ Reading secret from Docker Secrets: ${secretName}`);
      return fs.readFileSync(secretPath, 'utf8').trim();
    }
    
    // Cách 2: Đọc từ environment variable  
    const envName = secretName.toUpperCase().replace(/-/g, '_');
    if (process.env[envName]) {
      console.log(`⚠️ Reading secret from ENV (less secure): ${envName}`);
      return process.env[envName];
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Failed to read secret: ${secretName}`, error.message);
    return null;
  }
}

// API endpoint hiển thị thông tin hệ thống
app.get('/', (req, res) => {
  res.json({
    message: '🔒 Security Demo Application',
    container: {
      hostname: os.hostname(),
      user: os.userInfo().username,
      uid: process.getuid ? process.getuid() : 'N/A (Windows)',
      platform: os.platform(),
      nodeVersion: process.version
    },
    security: {
      runningAsRoot: process.getuid ? process.getuid() === 0 : false,
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  });
});

// API endpoint kiểm tra secrets
app.get('/secrets-check', (req, res) => {
  const dbPassword = getSecret('db-password');
  const jwtSecret = getSecret('jwt-secret');
  const apiKey = getSecret('api-key');
  
  res.json({
    message: '🔐 Secrets Status',
    secrets: {
      'db-password': dbPassword ? '✅ Loaded (hidden)' : '❌ Not found',
      'jwt-secret': jwtSecret ? '✅ Loaded (hidden)' : '❌ Not found', 
      'api-key': apiKey ? '✅ Loaded (hidden)' : '❌ Not found'
    },
    source: fs.existsSync('/run/secrets') ? 'Docker Secrets' : 'Environment Variables'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API test ghi file (để demo read-only filesystem)
app.get('/test-write', (req, res) => {
  const testPaths = ['/app/test.txt', '/tmp/test.txt'];
  const results = {};
  
  testPaths.forEach(path => {
    try {
      fs.writeFileSync(path, 'test');
      fs.unlinkSync(path);
      results[path] = '✅ Writable';
    } catch (error) {
      results[path] = `❌ Read-only: ${error.code}`;
    }
  });
  
  res.json({
    message: '📁 Filesystem Write Test',
    results
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════╗
║     🔒 Security Demo Application           ║
║     Running on port ${PORT}                    ║
╚════════════════════════════════════════════╝
  `);
  console.log(`User: ${os.userInfo().username}`);
  console.log(`UID: ${process.getuid ? process.getuid() : 'N/A'}`);
  console.log(`Node ENV: ${process.env.NODE_ENV || 'development'}`);
});


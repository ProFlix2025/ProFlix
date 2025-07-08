#!/usr/bin/env node

// Render Deployment Diagnostic Script
// This script helps identify exactly what's causing the Bad Gateway error

console.log('=== RENDER DIAGNOSTIC SCRIPT ===');
console.log(`Node.js Version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Current Working Directory: ${process.cwd()}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`PORT: ${process.env.PORT || 'undefined'}`);

const fs = require('fs');
const path = require('path');
const http = require('http');

// Check if required files exist
const requiredFiles = [
  'index.js',
  'public/index.html',
  'public/assets'
];

console.log('\n=== FILE SYSTEM CHECK ===');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
});

// Test basic HTTP server
console.log('\n=== HTTP SERVER TEST ===');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      port: port,
      environment: process.env.NODE_ENV || 'undefined'
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Diagnostic server running successfully!');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Diagnostic server running on port ${port}`);
  console.log(`✅ Server bound to 0.0.0.0:${port}`);
  console.log(`✅ Health check available at: /health`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
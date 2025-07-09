#!/bin/bash
set -e

echo "🚀 Starting ProFlix server..."

# Set NODE_ENV to production
export NODE_ENV=production

# Start the server
node dist/server.js
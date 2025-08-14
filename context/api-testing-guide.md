# API Testing Guide - Preventing Hanging Commands

## Problem
Curl commands frequently hang when testing the Spoodle API, causing delays and frustration.

## Root Causes
1. **Multiple API Processes**: Conflicting background processes
2. **No Timeout Limits**: Curl commands without proper timeouts
3. **Process Management**: Background processes not properly cleaned up
4. **Port Conflicts**: Multiple services trying to use the same port

## Robust Testing Commands

### 1. Check API Server Status
```bash
# Check if API is running
lsof -i :3007

# Kill any existing processes
lsof -ti:3007 | xargs kill -9 2>/dev/null || true

# Start API server cleanly
cd packages/api && npm run dev &
sleep 5
```

### 2. Test API Endpoints (Safe Commands)
```bash
# Health check with timeout
curl -s --max-time 5 http://localhost:3007/health

# Reports endpoint with timeout and output limit
curl -s --max-time 5 http://localhost:3007/api/reports | head -10

# Pet registration endpoint test
curl -s --max-time 5 -X POST http://localhost:3007/api/pets/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Pet","type":"dog","breed":"Golden Retriever","age":3,"ownerName":"Test Owner","ownerEmail":"test@example.com","ownerPhone":"555-1234"}' | head -5
```

### 3. Process Management
```bash
# Kill all API-related processes
pkill -f "tsx.*api"
pkill -f "node.*api"

# Check for remaining processes
ps aux | grep -E "(tsx|node.*api)" | grep -v grep

# Clean port usage
lsof -ti:3007 | xargs kill -9 2>/dev/null || true
```

## Best Practices

### ✅ DO
- Always use `--max-time 5` with curl commands
- Use `head -10` to limit output
- Check process status before testing
- Clean up processes before starting new ones
- Use `sleep` to allow server startup time

### ❌ DON'T
- Run curl without timeouts
- Assume API server is running
- Leave multiple background processes
- Use commands that can hang indefinitely

## Quick Test Script
```bash
#!/bin/bash
# Quick API test script

echo "🧹 Cleaning up processes..."
lsof -ti:3007 | xargs kill -9 2>/dev/null || true
pkill -f "tsx.*api" 2>/dev/null || true

echo "🚀 Starting API server..."
cd packages/api && npm run dev &
sleep 5

echo "🔍 Testing API endpoints..."
curl -s --max-time 5 http://localhost:3007/health && echo "✅ Health check passed" || echo "❌ Health check failed"
curl -s --max-time 5 http://localhost:3007/api/reports | head -5 && echo "✅ Reports endpoint working" || echo "❌ Reports endpoint failed"

echo "✅ API testing complete"
```

## Troubleshooting

### If API won't start:
1. Check for port conflicts: `lsof -i :3007`
2. Kill conflicting processes: `lsof -ti:3007 | xargs kill -9`
3. Restart API server: `cd packages/api && npm run dev`

### If curl commands hang:
1. Use `--max-time 5` flag
2. Limit output with `head -10`
3. Check if API server is actually running
4. Use verbose mode: `curl -v --max-time 5`

### If multiple processes:
1. Kill all API processes: `pkill -f "tsx.*api"`
2. Clean up ports: `lsof -ti:3007 | xargs kill -9`
3. Start fresh: `npm run dev`

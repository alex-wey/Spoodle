#!/bin/bash

# Git Safe - Stop background processes before git operations
# This script prevents infinite loops when running git commands

echo "🔧 Stopping background development processes..."

# Kill common development processes that can interfere with git
pkill -f "turbo" 2>/dev/null || true
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "tsc --watch" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 1

# Check if any processes are still running
RUNNING_PROCESSES=$(ps aux | grep -E "(turbo|next|tsx|metro|watch)" | grep -v grep | grep -v watchdogd)

if [ -n "$RUNNING_PROCESSES" ]; then
    echo "⚠️  Some processes are still running. Force killing them..."
    echo "$RUNNING_PROCESSES" | awk '{print $2}' | xargs kill -9 2>/dev/null || true
    sleep 1
fi

echo "✅ Background processes stopped. Running git command: $@"

# Run the git command passed as arguments
git "$@"

echo "✅ Git command completed. You can restart development with 'npm run dev' or 'turbo dev'"

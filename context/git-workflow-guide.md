# Git Workflow Guide - Preventing Infinite Loops

## 🚨 **The Problem**

When running `git add .` or other git commands in this monorepo, you may experience infinite loops where the command never completes. This happens because:

### **Root Cause**
- **Background Development Processes**: Multiple processes are continuously watching and modifying files
- **File Generation**: TypeScript compilation, Next.js builds, and other tools generate files continuously
- **Git Confusion**: Git tries to add files while they're being modified, causing it to never finish

### **Processes That Cause Issues**
1. **Turbo daemon** - Monorepo build system
2. **TypeScript watch** - `tsc --watch` processes
3. **Next.js dev servers** - `next dev` processes
4. **API watch processes** - `tsx watch` for API development
5. **Metro bundler** - React Native bundler

## ✅ **Solutions**

### **Solution 1: Use the Git Safe Script (Recommended)**

We've created a script that automatically stops background processes before running git commands:

```bash
# Make the script executable (one-time setup)
chmod +x scripts/git-safe.sh

# Use it for any git command
./scripts/git-safe.sh add .
./scripts/git-safe.sh commit -m "your message"
./scripts/git-safe.sh push origin jjbranch
./scripts/git-safe.sh status
```

### **Solution 2: Manual Process Management**

If you prefer to manage processes manually:

```bash
# Stop all development processes
pkill -f "turbo"
pkill -f "tsx watch"
pkill -f "next-server"
pkill -f "tsc --watch"
pkill -f "next dev"
pkill -f "metro"

# Force kill if needed
pkill -9 -f "turbo"
pkill -9 -f "tsx watch"
# ... etc

# Then run git commands
git add .
git commit -m "your message"
git push origin jjbranch
```

### **Solution 3: Use Specific File Paths**

Instead of `git add .`, add specific files:

```bash
# Add specific files only
git add apps/3pi/src/app/page.tsx
git add context/next-steps.md
git add scripts/git-safe.sh

# Or add specific directories
git add apps/3pi/src/
git add context/
```

### **Solution 4: Use Git Staging Area**

Stage files incrementally:

```bash
# Stage files one by one
git add -p apps/3pi/src/app/page.tsx
git add -p context/next-steps.md

# Review what's staged
git status

# Commit staged changes
git commit -m "your message"
```

## 🔧 **Best Practices**

### **Before Git Operations**
1. **Stop Development Servers**: Always stop `turbo dev` or individual app servers
2. **Check Running Processes**: Use `ps aux | grep -E "(turbo|next|tsx|metro|watch)"` to see what's running
3. **Use the Safe Script**: Prefer `./scripts/git-safe.sh` over direct git commands

### **After Git Operations**
1. **Restart Development**: Run `npm run dev` or `turbo dev` to restart development
2. **Verify Everything Works**: Check that all apps are running correctly
3. **Test Changes**: Run tests to ensure nothing was broken

### **Regular Workflow**
```bash
# 1. Stop development (if using manual approach)
pkill -f "turbo" && pkill -f "next" && pkill -f "tsx"

# 2. Make your changes
# ... edit files ...

# 3. Use safe git operations
./scripts/git-safe.sh add .
./scripts/git-safe.sh commit -m "your changes"
./scripts/git-safe.sh push origin jjbranch

# 4. Restart development
npm run dev
```

## 🚨 **Troubleshooting**

### **If Git Still Hangs**
1. **Check for Zombie Processes**: `ps aux | grep -E "(turbo|next|tsx|metro|watch)"`
2. **Force Kill All**: `pkill -9 -f "turbo" && pkill -9 -f "next" && pkill -9 -f "tsx"`
3. **Restart Terminal**: Sometimes a fresh terminal helps
4. **Clear Git Index**: `rm -rf .git/index.lock` (if it exists)

### **If Processes Won't Stop**
1. **Use Activity Monitor**: On macOS, open Activity Monitor and search for "node"
2. **Kill by PID**: Find the process ID and use `kill -9 <PID>`
3. **Restart Computer**: As a last resort

### **If Files Keep Changing**
1. **Check .gitignore**: Ensure generated files are properly ignored
2. **Use .git/info/exclude**: Add temporary exclusions
3. **Commit Only Source Files**: Avoid committing build artifacts

## 📋 **Quick Reference Commands**

### **Safe Git Operations**
```bash
# Add all changes safely
./scripts/git-safe.sh add .

# Commit safely
./scripts/git-safe.sh commit -m "your message"

# Push safely
./scripts/git-safe.sh push origin jjbranch

# Check status safely
./scripts/git-safe.sh status
```

### **Process Management**
```bash
# Stop all development processes
pkill -f "turbo" && pkill -f "next" && pkill -f "tsx" && pkill -f "metro"

# Check what's running
ps aux | grep -E "(turbo|next|tsx|metro|watch)" | grep -v grep

# Force kill stubborn processes
pkill -9 -f "turbo" && pkill -9 -f "next" && pkill -9 -f "tsx"
```

### **Development Restart**
```bash
# Start all apps
npm run dev

# Or start individual apps
cd apps/3pi && npm run dev
cd apps/mobile && npm run dev
cd apps/web && npm run dev
```

## 🎯 **Recommended Workflow**

1. **Always use the safe script**: `./scripts/git-safe.sh`
2. **Commit frequently**: Small, focused commits
3. **Test before committing**: Run tests to ensure quality
4. **Restart development after git operations**: Ensure everything works

## ⚠️ **Important Notes**

- **Never commit while development servers are running**: This causes the infinite loop issue
- **Always test after restarting**: Make sure your changes work correctly
- **Use the safe script**: It's designed to prevent these issues
- **Keep commits small**: Easier to debug and review

---

*This guide ensures smooth git operations in the Spoodle monorepo while preventing infinite loops and maintaining development productivity.*

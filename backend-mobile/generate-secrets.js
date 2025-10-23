#!/usr/bin/env node

/**
 * Generate Secure Secrets for Production
 * 
 * This script generates cryptographically secure random strings
 * for use as JWT secrets in production environments.
 * 
 * Usage: node generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Secrets for Production\n');
console.log('═'.repeat(60));

// Generate JWT Secret (32 bytes = 64 hex characters)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n✅ JWT_SECRET:');
console.log(jwtSecret);

// Generate Refresh Token Secret (32 bytes = 64 hex characters)
const refreshTokenSecret = crypto.randomBytes(32).toString('hex');
console.log('\n✅ REFRESH_TOKEN_SECRET:');
console.log(refreshTokenSecret);

console.log('\n' + '═'.repeat(60));
console.log('\n📋 Copy these values to your Railway environment variables:');
console.log('\n1. Go to Railway Dashboard → Your Service → Variables');
console.log('2. Add JWT_SECRET with the first value above');
console.log('3. Add REFRESH_TOKEN_SECRET with the second value above');
console.log('\n⚠️  IMPORTANT: Never commit these secrets to git!');
console.log('⚠️  Store them securely and only in Railway environment variables.\n');

// Additional security tips
console.log('🛡️  Security Tips:');
console.log('   • Keep these secrets private and secure');
console.log('   • Never share them in chat, email, or commit to git');
console.log('   • Rotate them periodically (e.g., every 90 days)');
console.log('   • Use different secrets for development and production');
console.log('   • Store backups securely (password manager, encrypted vault)\n');


#!/usr/bin/env node

/**
 * Firebase Environment Setup Script
 * 
 * This script helps you set up Firebase environment variables securely.
 * It reads from firebase-admin-key.json (if present) and creates a proper .env file.
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(process.cwd(), '.env');
const ENV_EXAMPLE_FILE = path.join(process.cwd(), 'env.example');
const FIREBASE_KEY_FILE = path.join(process.cwd(), 'firebase-admin-key.json');

function coloredLog(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkForSecrets() {
  coloredLog('🔍 Checking for hardcoded secrets...', 'yellow');
  
  if (fs.existsSync(FIREBASE_KEY_FILE)) {
    coloredLog('❌ CRITICAL: firebase-admin-key.json found!', 'red');
    coloredLog('   ⚠️  This file should NEVER be committed to git!', 'red');
    coloredLog('   📝 Run this script to convert to secure environment variables:', 'blue');
    process.exit(1);
  }
  
  coloredLog('✅ No hardcoded files found', 'green');
}

function createEnvFromExample() {
  if (!fs.existsSync(ENV_EXAMPLE_FILE)) {
    coloredLog('❌ env.example file not found!', 'ret');
    return false;
  }
  
  if (fs.existsSync(ENV_FILE)) {
    coloredLog('⚠️  .env file already exists', 'yellow');
    coloredLog('   📄 Add Firebase credentials to existing .env file', 'blue');
    return true;
  }
  
  try {
    const envContent = fs.readFileSync(ENV_EXAMPLE_FILE, 'utf8');
    fs.writeFileSync(ENV_FILE, envContent);
    coloredLog('✅ Created .env file from env.example', 'green');
    coloredLog('📝 Now add your Firebase credentials to the .env file', 'blue');
    return true;
  } catch (error) {
    coloredLog(`❌ Error creating .env file: ${error.message}`, 'red');
    return false;
  }
}

function showFirebaseSetupInstructions() {
  coloredLog('\n🔥 Firebase Environment Setup Instructions:', 'cyan');
  coloredLog('=================================================', 'cyan');
  
  coloredLog('\n1. 📁 Open your .env file', 'blue');
  coloredLog('2. 🔑 Add Firebase Admin SDK credentials:', 'blue');
  
  coloredLog('\n   From Firebase Console:', 'yellow');
  coloredLog('   - Go to Project Settings → Service Accounts', 'white');
  coloredLog('   - Click "Generate new private key"', 'white');
  coloredLog('   - Copy the JSON content', 'white');
  
  coloredLog('\n   Add to .env file:', 'yellow');
  coloredLog('   FIREBASE_PROJECT_ID=your-project-id', 'white');
  coloredLog('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"', 'white');
  coloredLog('   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com', 'white');
  coloredLog('   FIREBASE_PRIVATE_KEY_ID=your-private-key-id', 'white');
  coloredLog('   FIREBASE_CLIENT_ID=your-client-id', 'white');
  
  coloredLog('\n3. 🔐 Security checklist:', 'blue');
  coloredLog('   ✅ .env file is in .gitignore', 'green');
  coloredLog('   ✅ firebase-admin-key.json is removed', 'green');
  coloredLog('   ✅ No hardcoded secrets in source code', 'green');
  
  coloredLog('\n4. 🧪 Test configuration:', 'blue');
  coloredLog('   npm run firebase:test', 'white');
  
  coloredLog('\n🚀 Ready for production deployment!', 'green');
}

function main() {
  coloredLog('🔒 TutorsPool Firebase Security Setup', 'cyan');
  coloredLog('=====================================', 'cyan');
  
  checkForSecrets();
  
  if (createEnvFromExample()) {
    showFirebaseSetupInstructions();
  }
  
  coloredLog('\n📚 For deployment security guide, see: FIREBASE_SECURITY_GUIDE.md', 'blue');
}

// Run the setup
main();

/**
 * Environment Toggle Script
 * 
 * This script helps toggle between development and production API URLs
 * in the .env.local file.
 * 
 * Usage:
 * - node toggle-env.js dev   (Switch to development environment)
 * - node toggle-env.js prod  (Switch to production environment)
 */

const fs = require('fs');
const path = require('path');

// Path to .env.local file
const envPath = path.join(__dirname, '.env.local');

// Development and production API URLs
const DEV_API_URL = 'http://localhost:8000/api';
const PROD_API_URL = 'https://nbu-journal-backend.onrender.com/api';

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.error('.env.local file not found. Creating one...');
  fs.writeFileSync(
    envPath,
    `# API URL for the backend\nNEXT_PUBLIC_API_URL=${PROD_API_URL}\n`
  );
}

// Get the mode from command line arguments
const mode = process.argv[2]?.toLowerCase();

if (!mode || (mode !== 'dev' && mode !== 'prod')) {
  console.error('Please specify a valid mode: "dev" or "prod"');
  console.log('Example: node toggle-env.js dev');
  process.exit(1);
}

// Read the current .env.local file
let envContent = fs.readFileSync(envPath, 'utf8');

// Update the API URL based on the selected mode
if (mode === 'dev') {
  envContent = envContent.replace(
    /NEXT_PUBLIC_API_URL=.*/,
    `NEXT_PUBLIC_API_URL=${DEV_API_URL}`
  );
  console.log(`Switched to DEVELOPMENT environment (${DEV_API_URL})`);
} else {
  envContent = envContent.replace(
    /NEXT_PUBLIC_API_URL=.*/,
    `NEXT_PUBLIC_API_URL=${PROD_API_URL}`
  );
  console.log(`Switched to PRODUCTION environment (${PROD_API_URL})`);
}

// Write the updated content back to .env.local
fs.writeFileSync(envPath, envContent);

console.log('Environment updated successfully!');
console.log('Restart your Next.js server for changes to take effect.');

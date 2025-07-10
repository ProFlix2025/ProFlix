// Script to fix package.json build command for Render deployment
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Fix the build script to use npx
packageJson.scripts.build = "npx vite build && npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist";

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✅ Fixed package.json build script to use npx');
console.log('New build command:', packageJson.scripts.build); 
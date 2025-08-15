#!/usr/bin/env node

/**
 * GoTryke Dependency Update Script
 * This script ensures all required dependencies are in package.json
 * and updates versions if needed
 */

const fs = require('fs');
const path = require('path');

// Required dependencies with versions
const requiredDependencies = {
  // Core Framework
  "next": "^15.3.3",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  
  // UI Components (Radix UI / Shadcn)
  "@radix-ui/react-avatar": "^1.1.3",
  "@radix-ui/react-checkbox": "^1.1.4",
  "@radix-ui/react-dialog": "^1.1.6",
  "@radix-ui/react-dropdown-menu": "^2.1.6",
  "@radix-ui/react-icons": "^1.3.0",
  "@radix-ui/react-label": "^2.1.2",
  "@radix-ui/react-popover": "^1.1.6",
  "@radix-ui/react-select": "^2.1.6",
  "@radix-ui/react-separator": "^1.1.2",
  "@radix-ui/react-slot": "^1.2.3",
  "@radix-ui/react-switch": "^1.1.3",
  "@radix-ui/react-tabs": "^1.1.3",
  "@radix-ui/react-toast": "^1.2.6",
  "@radix-ui/react-tooltip": "^1.1.8",
  
  // UI Libraries
  "lucide-react": "^0.475.0",
  "@tanstack/react-table": "^8.19.2",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.0.1",
  "tailwindcss-animate": "^1.0.7",
  
  // Forms & Validation
  "react-hook-form": "^7.54.2",
  "@hookform/resolvers": "^4.1.3",
  "zod": "^3.25.76",
  
  // Backend Services
  "firebase": "^10.12.2",
  "firebase-admin": "^12.0.0",
  "@supabase/ssr": "^0.6.1",
  "@supabase/supabase-js": "^2.43.5",
  
  // Authentication
  "jose": "^5.2.2",
  
  // Maps
  "mapbox-gl": "^3.0.0",
  
  // AI/ML
  "genkit": "^0.9.0",
  "@genkit-ai/googleai": "^0.9.0",
  
  // SMS Services
  "twilio": "^4.19.0",
  
  // Utilities
  "date-fns": "^3.6.0",
  "next-themes": "^0.4.4"
};

const requiredDevDependencies = {
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "@types/mapbox-gl": "^3.0.0",
  "typescript": "^5",
  "eslint": "^9.32.0",
  "eslint-config-next": "^15.3.3",
  "tailwindcss": "^3.4.1",
  "autoprefixer": "^10.4.20",
  "postcss": "^8",
  "supabase": "^2.33.9",
  "tsx": "^4.7.0"
};

const requiredScripts = {
  "dev": "next dev -p 9002",
  "build": "next build",
  "start": "next start -p 9002",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "genkit:dev": "node --loader tsx/esm src/ai/dev.ts"
};

function updatePackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  // Check if package.json exists
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json not found. Creating new one...');
    
    const newPackageJson = {
      name: "gotryke",
      version: "0.1.0",
      private: true,
      scripts: requiredScripts,
      dependencies: requiredDependencies,
      devDependencies: requiredDevDependencies
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2));
    console.log('✅ package.json created successfully');
    return;
  }
  
  // Read existing package.json
  let packageJson;
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    packageJson = JSON.parse(content);
  } catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    process.exit(1);
  }
  
  console.log('📦 Checking and updating dependencies...\n');
  
  // Initialize sections if they don't exist
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.devDependencies = packageJson.devDependencies || {};
  packageJson.scripts = packageJson.scripts || {};
  
  let updated = false;
  
  // Check and add missing dependencies
  console.log('Dependencies:');
  for (const [dep, version] of Object.entries(requiredDependencies)) {
    if (!packageJson.dependencies[dep]) {
      console.log(`  ➕ Adding ${dep}@${version}`);
      packageJson.dependencies[dep] = version;
      updated = true;
    } else {
      console.log(`  ✅ ${dep} already exists`);
    }
  }
  
  console.log('\nDev Dependencies:');
  for (const [dep, version] of Object.entries(requiredDevDependencies)) {
    if (!packageJson.devDependencies[dep]) {
      console.log(`  ➕ Adding ${dep}@${version}`);
      packageJson.devDependencies[dep] = version;
      updated = true;
    } else {
      console.log(`  ✅ ${dep} already exists`);
    }
  }
  
  console.log('\nScripts:');
  for (const [script, command] of Object.entries(requiredScripts)) {
    if (!packageJson.scripts[script] || packageJson.scripts[script] !== command) {
      console.log(`  ➕ Updating script: ${script}`);
      packageJson.scripts[script] = command;
      updated = true;
    } else {
      console.log(`  ✅ Script '${script}' already correct`);
    }
  }
  
  // Sort dependencies alphabetically
  packageJson.dependencies = Object.keys(packageJson.dependencies)
    .sort()
    .reduce((obj, key) => {
      obj[key] = packageJson.dependencies[key];
      return obj;
    }, {});
  
  packageJson.devDependencies = Object.keys(packageJson.devDependencies)
    .sort()
    .reduce((obj, key) => {
      obj[key] = packageJson.devDependencies[key];
      return obj;
    }, {});
  
  // Write updated package.json
  if (updated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('\n✅ package.json updated successfully');
    console.log('📝 Run "npm install" to install the new dependencies');
  } else {
    console.log('\n✅ All required dependencies are already present');
  }
}

// Run the update
console.log('🚀 GoTryke Dependency Checker\n');
console.log('================================\n');
updatePackageJson();
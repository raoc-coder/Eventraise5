#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 EventRaise Build Check');
console.log('========================\n');

// Check for required files
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.js',
  'postcss.config.js',
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
    allFilesExist = false;
  }
});

// Check for environment variables
console.log('\n🔧 Checking environment variables...');
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];

  let envConfigured = true;
  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=(.+)$`, 'm');
    const match = envContent.match(regex);
    
    if (match && match[1] && !match[1].includes('your_')) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`❌ ${varName} - Not configured`);
      envConfigured = false;
    }
  });

  if (!envConfigured) {
    console.log('\n⚠️  Environment variables not configured for build');
    console.log('   This may cause build failures on Vercel');
  }
} else {
  console.log('❌ .env.local not found');
  console.log('   Run: npm run setup');
}

// Check package.json for build script
console.log('\n📦 Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (packageJson.scripts && packageJson.scripts.build) {
  console.log('✅ Build script found');
} else {
  console.log('❌ Build script missing');
  allFilesExist = false;
}

// Check for TypeScript configuration
console.log('\n🔧 Checking TypeScript configuration...');
if (fs.existsSync('tsconfig.json')) {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  
  if (tsconfig.compilerOptions) {
    console.log('✅ TypeScript configuration found');
  } else {
    console.log('❌ TypeScript configuration incomplete');
    allFilesExist = false;
  }
} else {
  console.log('❌ tsconfig.json missing');
  allFilesExist = false;
}

console.log('\n📋 Build Summary:');
console.log('==================');

if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('🚀 Ready to build!');
  console.log('\nNext steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run build');
  console.log('3. If build fails, check the error messages above');
} else {
  console.log('❌ Some required files are missing');
  console.log('🔧 Please fix the issues above before building');
}

console.log('\n💡 For deployment help, see DEPLOYMENT.md');

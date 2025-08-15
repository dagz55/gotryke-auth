#!/usr/bin/env node

/**
 * Image Optimization Audit Script for GoTryke
 * 
 * This script validates that all images in the codebase follow
 * performance optimization best practices.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 GoTryke Image Optimization Audit\n');

// Define the source directory
const srcDir = path.join(__dirname, '../src');

// Find all TypeScript and JSX files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', { cwd: srcDir });

let issues = [];
let optimizations = [];

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for Image components
    if (line.includes('Image') && line.includes('src=')) {
      
      // Check for GoTryke logo without priority
      if (line.includes('gotryke-logo') && !content.includes('priority')) {
        issues.push(`❌ ${file}:${lineNum} - GoTryke logo missing priority prop`);
      }
      
      // Check for external images without proper optimization
      if ((line.includes('pravatar.cc') || line.includes('placehold.co')) && 
          !content.includes('loading="lazy"')) {
        issues.push(`⚠️  ${file}:${lineNum} - External image should use lazy loading`);
      }
      
      // Check for unoptimized prop (should be removed)
      if (line.includes('unoptimized')) {
        issues.push(`❌ ${file}:${lineNum} - Remove unoptimized prop for better performance`);
      }
      
      // Check for missing width/height
      if (!line.includes('width=') || !line.includes('height=')) {
        issues.push(`⚠️  ${file}:${lineNum} - Image missing width or height props`);
      }
      
      // Count optimizations
      if (line.includes('priority')) {
        optimizations.push(`✅ ${file}:${lineNum} - Priority loading enabled`);
      }
      
      if (line.includes('loading="lazy"')) {
        optimizations.push(`✅ ${file}:${lineNum} - Lazy loading enabled`);
      }
      
      if (line.includes('placeholder="blur"')) {
        optimizations.push(`✅ ${file}:${lineNum} - Blur placeholder implemented`);
      }
      
      if (line.includes('sizes=')) {
        optimizations.push(`✅ ${file}:${lineNum} - Responsive sizes configured`);
      }
    }
  });
});

// Report results
console.log('📊 Audit Results:\n');

if (issues.length === 0) {
  console.log('🎉 No image optimization issues found!\n');
} else {
  console.log(`🚨 Found ${issues.length} issues:\n`);
  issues.forEach(issue => console.log(issue));
  console.log('');
}

console.log(`✨ Found ${optimizations.length} optimizations:\n`);
optimizations.slice(0, 10).forEach(opt => console.log(opt)); // Show first 10
if (optimizations.length > 10) {
  console.log(`... and ${optimizations.length - 10} more optimizations`);
}

console.log('\n📈 Performance Recommendations:');
console.log('1. Above-the-fold images should use priority={true}');
console.log('2. Below-the-fold images should use loading="lazy"');
console.log('3. External images should include blur placeholders');
console.log('4. All images should have proper width/height props');
console.log('5. Remove unoptimized prop to enable Next.js optimization');

console.log('\n🎯 LCP Optimization Status:');
const lcpOptimized = optimizations.filter(opt => 
  opt.includes('Priority loading') && opt.includes('gotryke-logo')
).length > 0;

if (lcpOptimized) {
  console.log('✅ LCP optimization - GoTryke logo has priority loading');
} else {
  console.log('❌ LCP optimization - GoTryke logo needs priority loading');
}

console.log('\n🏁 Audit complete!');
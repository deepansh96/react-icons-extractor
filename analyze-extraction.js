const fs = require('fs');
const path = require('path');

const extractedIconsPath = './extracted-icons';

function analyzeExtraction() {
  console.log('🔍 Analyzing Extracted SVG Icons\n');
  console.log('=' .repeat(50));
  
  const families = fs.readdirSync(extractedIconsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();
  
  let totalIcons = 0;
  let totalSize = 0;
  const familyStats = [];
  
  console.log('📊 FAMILY STATISTICS:\n');
  console.log('Family'.padEnd(8) + 'Count'.padEnd(8) + 'Size'.padEnd(10) + 'Avg Size'.padEnd(12) + 'Sample Icons');
  console.log('-'.repeat(80));
  
  families.forEach(family => {
    const familyPath = path.join(extractedIconsPath, family);
    const icons = fs.readdirSync(familyPath)
      .filter(file => file.endsWith('.svg'));
    
    let familySize = 0;
    icons.forEach(icon => {
      const iconPath = path.join(familyPath, icon);
      const stats = fs.statSync(iconPath);
      familySize += stats.size;
    });
    
    const avgSize = icons.length > 0 ? (familySize / icons.length) : 0;
    const sampleIcons = icons.slice(0, 3).map(icon => icon.replace('.svg', '')).join(', ');
    
    familyStats.push({
      family,
      count: icons.length,
      size: familySize,
      avgSize,
      sampleIcons
    });
    
    totalIcons += icons.length;
    totalSize += familySize;
    
    console.log(
      family.padEnd(8) + 
      icons.length.toString().padEnd(8) + 
      formatBytes(familySize).padEnd(10) + 
      formatBytes(avgSize).padEnd(12) + 
      (sampleIcons.length > 50 ? sampleIcons.substring(0, 47) + '...' : sampleIcons)
    );
  });
  
  console.log('-'.repeat(80));
  console.log(
    'TOTAL'.padEnd(8) + 
    totalIcons.toString().padEnd(8) + 
    formatBytes(totalSize).padEnd(10) + 
    formatBytes(totalSize / totalIcons).padEnd(12)
  );
  
  console.log('\n' + '=' .repeat(50));
  console.log('📈 SUMMARY STATISTICS:\n');
  
  // Top 5 families by count
  const topByCount = [...familyStats].sort((a, b) => b.count - a.count).slice(0, 5);
  console.log('🏆 Top 5 Families by Icon Count:');
  topByCount.forEach((stat, i) => {
    console.log(`${i + 1}. ${stat.family}: ${stat.count} icons`);
  });
  
  // Top 5 families by size
  const topBySize = [...familyStats].sort((a, b) => b.size - a.size).slice(0, 5);
  console.log('\n💾 Top 5 Families by Total Size:');
  topBySize.forEach((stat, i) => {
    console.log(`${i + 1}. ${stat.family}: ${formatBytes(stat.size)}`);
  });
  
  // Average sizes
  const avgSizes = familyStats.map(s => s.avgSize).sort((a, b) => b - a);
  console.log('\n📏 Average Icon Sizes:');
  console.log(`Largest avg: ${formatBytes(avgSizes[0])}`);
  console.log(`Smallest avg: ${formatBytes(avgSizes[avgSizes.length - 1])}`);
  console.log(`Overall avg: ${formatBytes(totalSize / totalIcons)}`);
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ EXTRACTION VALIDATION:\n');
  
  // Check for potential issues
  let issueCount = 0;
  
  // Check for empty families
  const emptyFamilies = familyStats.filter(s => s.count === 0);
  if (emptyFamilies.length > 0) {
    console.log(`⚠️  Found ${emptyFamilies.length} empty families: ${emptyFamilies.map(f => f.family).join(', ')}`);
    issueCount++;
  }
  
  // Check for unusually small files (might indicate extraction issues)
  const smallFileThreshold = 100; // bytes
  let smallFileCount = 0;
  
  families.forEach(family => {
    const familyPath = path.join(extractedIconsPath, family);
    const icons = fs.readdirSync(familyPath).filter(file => file.endsWith('.svg'));
    
    icons.forEach(icon => {
      const iconPath = path.join(familyPath, icon);
      const stats = fs.statSync(iconPath);
      if (stats.size < smallFileThreshold) {
        smallFileCount++;
      }
    });
  });
  
  if (smallFileCount > 0) {
    console.log(`⚠️  Found ${smallFileCount} potentially corrupted files (< ${smallFileThreshold} bytes)`);
    issueCount++;
  }
  
  if (issueCount === 0) {
    console.log('✅ All validations passed! Extraction appears successful.');
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎯 QUICK ACCESS:\n');
  console.log('To use icons in your projects:');
  console.log('• HTML: <img src="extracted-icons/ai/AiFillHome.svg" alt="Home">');
  console.log('• CSS: background-image: url("extracted-icons/fa/FaHome.svg")');
  console.log('• Copy SVG content directly for inline use');
  console.log('\n📁 All icons organized in: ./extracted-icons/');
  console.log(`📊 Total extraction: ${totalIcons} icons, ${formatBytes(totalSize)}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Run the analysis
analyzeExtraction(); 
const fs = require('fs');
const path = require('path');

// Directory where react-icons is installed
const reactIconsPath = './node_modules/react-icons';
const outputPath = './extracted-icons';

// Function to convert icon data to SVG string
function iconDataToSVG(iconData, iconName) {
  const { attr = {}, child = [] } = iconData;
  
  // Extract viewBox from attributes or use default
  const viewBox = attr.viewBox || '0 0 1024 1024';
  const fill = attr.fill || 'currentColor';
  const fillRule = attr.fillRule || '';
  
  // Convert child elements to SVG string
  function childrenToSVG(children) {
    if (!children || !Array.isArray(children)) return '';
    
    return children.map(child => {
      const { tag, attr = {}, child: grandChildren = [] } = child;
      
      if (!tag) return '';
      
      // Build attributes string
      const attrs = Object.entries(attr)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      
      const childContent = childrenToSVG(grandChildren);
      
      if (childContent) {
        return `<${tag}${attrs ? ' ' + attrs : ''}>${childContent}</${tag}>`;
      } else {
        return `<${tag}${attrs ? ' ' + attrs : ''}/>`;
      }
    }).join('');
  }
  
  const svgContent = childrenToSVG(child);
  
  // Build complete SVG
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="${viewBox}" fill="${fill}"${fillRule ? ` fill-rule="${fillRule}"` : ''} xmlns="http://www.w3.org/2000/svg">
${svgContent}
</svg>`;
}

// Function to extract icons from a family
function extractIconsFromFamily(familyName) {
  const familyPath = path.join(reactIconsPath, familyName);
  const indexPath = path.join(familyPath, 'index.js');
  
  if (!fs.existsSync(indexPath)) {
    console.log(`Skipping ${familyName} - index.js not found`);
    return;
  }
  
  console.log(`Processing family: ${familyName}`);
  
  // Create output directory for this family
  const familyOutputPath = path.join(outputPath, familyName);
  if (!fs.existsSync(familyOutputPath)) {
    fs.mkdirSync(familyOutputPath, { recursive: true });
  }
  
  // Read the index.js file
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Extract icon definitions using regex
  // Look for module.exports.IconName = function IconName (props) { return GenIcon({...})(props); };
  const iconRegex = /module\.exports\.(\w+)\s*=\s*function\s+\w+\s*\(props\)\s*\{\s*return\s+GenIcon\((\{[^}]+(?:\{[^}]*\}[^}]*)*\})\)\(props\);\s*\};/g;
  
  let match;
  let iconCount = 0;
  
  while ((match = iconRegex.exec(indexContent)) !== null) {
    const iconName = match[1];
    const iconDataStr = match[2];
    
    try {
      // Parse the icon data
      const iconData = eval(`(${iconDataStr})`);
      
      // Convert to SVG
      const svgContent = iconDataToSVG(iconData, iconName);
      
      // Write SVG file
      const svgFilePath = path.join(familyOutputPath, `${iconName}.svg`);
      fs.writeFileSync(svgFilePath, svgContent);
      
      iconCount++;
    } catch (error) {
      console.error(`Error processing icon ${iconName}:`, error.message);
    }
  }
  
  console.log(`  Extracted ${iconCount} icons from ${familyName}`);
  return iconCount;
}

// Main function
function main() {
  console.log('Starting icon extraction from react-icons...');
  
  // Create output directory
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  // Get all family directories
  const families = fs.readdirSync(reactIconsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name !== 'lib'); // Exclude lib directory
  
  console.log(`Found ${families.length} icon families:`, families.join(', '));
  
  let totalIcons = 0;
  
  // Process each family
  families.forEach(family => {
    try {
      const count = extractIconsFromFamily(family);
      totalIcons += count || 0;
    } catch (error) {
      console.error(`Error processing family ${family}:`, error.message);
    }
  });
  
  console.log(`\nExtraction complete! Total icons extracted: ${totalIcons}`);
  console.log(`Icons saved to: ${path.resolve(outputPath)}`);
}

// Run the script
main(); 
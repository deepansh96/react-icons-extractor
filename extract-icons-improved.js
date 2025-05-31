const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Directory where react-icons is installed
const reactIconsPath = './node_modules/react-icons';
const outputPath = './extracted-icons';

// Mock GenIcon function to capture icon data
let capturedIconData = null;
function mockGenIcon(data) {
  capturedIconData = data;
  return () => null; // Return dummy function
}

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

// Function to extract icon data by executing the icon function
function extractIconData(iconFunction) {
  capturedIconData = null;
  
  // Create a context with our mock GenIcon
  const context = {
    GenIcon: mockGenIcon,
    module: { exports: {} },
    require: () => ({ GenIcon: mockGenIcon }),
    console: console
  };
  
  try {
    // Execute the icon function to capture the data
    iconFunction({});
    return capturedIconData;
  } catch (error) {
    console.error('Error executing icon function:', error.message);
    return null;
  }
}

// Function to extract icons from a family using direct module loading
function extractIconsFromFamily(familyName) {
  const familyPath = path.join(reactIconsPath, familyName);
  const indexPath = path.join(familyPath, 'index.js');
  
  if (!fs.existsSync(indexPath)) {
    console.log(`Skipping ${familyName} - index.js not found`);
    return 0;
  }
  
  console.log(`Processing family: ${familyName}`);
  
  // Create output directory for this family
  const familyOutputPath = path.join(outputPath, familyName);
  if (!fs.existsSync(familyOutputPath)) {
    fs.mkdirSync(familyOutputPath, { recursive: true });
  }
  
  // Read and parse the index.js file
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Create a context for executing the module
  const moduleContext = {
    module: { exports: {} },
    exports: {},
    require: (modulePath) => {
      if (modulePath === '../lib') {
        return { GenIcon: mockGenIcon };
      }
      return require(modulePath);
    },
    console: console,
    GenIcon: mockGenIcon
  };
  
  // Execute the module to get all exported functions
  try {
    vm.createContext(moduleContext);
    vm.runInContext(indexContent, moduleContext);
    
    const exportedIcons = moduleContext.module.exports;
    let iconCount = 0;
    
    // Process each exported icon
    for (const [iconName, iconFunction] of Object.entries(exportedIcons)) {
      if (typeof iconFunction === 'function') {
        try {
          // Execute the icon function to get icon data
          capturedIconData = null;
          iconFunction({});
          
          if (capturedIconData) {
            // Convert to SVG
            const svgContent = iconDataToSVG(capturedIconData, iconName);
            
            // Write SVG file
            const svgFilePath = path.join(familyOutputPath, `${iconName}.svg`);
            fs.writeFileSync(svgFilePath, svgContent);
            
            iconCount++;
          }
        } catch (error) {
          console.error(`Error processing icon ${iconName}:`, error.message);
        }
      }
    }
    
    console.log(`  Extracted ${iconCount} icons from ${familyName}`);
    return iconCount;
    
  } catch (error) {
    console.error(`Error processing family ${familyName}:`, error.message);
    return 0;
  }
}

// Alternative approach using text parsing for complex cases
function extractIconsFromFamilyTextParsing(familyName) {
  const familyPath = path.join(reactIconsPath, familyName);
  const indexPath = path.join(familyPath, 'index.js');
  
  if (!fs.existsSync(indexPath)) {
    console.log(`Skipping ${familyName} - index.js not found`);
    return 0;
  }
  
  console.log(`Processing family: ${familyName} (text parsing)`);
  
  // Create output directory for this family
  const familyOutputPath = path.join(outputPath, familyName);
  if (!fs.existsSync(familyOutputPath)) {
    fs.mkdirSync(familyOutputPath, { recursive: true });
  }
  
  // Read the index.js file
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Split into individual icon definitions
  const iconDefinitions = indexContent.split('module.exports.').slice(1);
  
  let iconCount = 0;
  
  for (const definition of iconDefinitions) {
    try {
      // Extract icon name
      const nameMatch = definition.match(/^(\w+)\s*=/);
      if (!nameMatch) continue;
      
      const iconName = nameMatch[1];
      
      // Extract the GenIcon data
      const genIconMatch = definition.match(/GenIcon\((\{[\s\S]*?\})\)/);
      if (!genIconMatch) continue;
      
      let iconDataStr = genIconMatch[1];
      
      // Handle nested objects - find the matching closing brace
      let braceCount = 0;
      let endIndex = 0;
      for (let i = 0; i < iconDataStr.length; i++) {
        if (iconDataStr[i] === '{') braceCount++;
        if (iconDataStr[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }
      
      iconDataStr = iconDataStr.substring(0, endIndex + 1);
      
      // Parse the icon data
      const iconData = eval(`(${iconDataStr})`);
      
      // Convert to SVG
      const svgContent = iconDataToSVG(iconData, iconName);
      
      // Write SVG file
      const svgFilePath = path.join(familyOutputPath, `${iconName}.svg`);
      fs.writeFileSync(svgFilePath, svgContent);
      
      iconCount++;
      
    } catch (error) {
      console.error(`Error processing icon definition:`, error.message);
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
  
  // Process each family using text parsing approach
  families.forEach(family => {
    try {
      const count = extractIconsFromFamilyTextParsing(family);
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
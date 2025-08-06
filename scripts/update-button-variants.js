const fs = require('fs');
const path = require('path');

// Mapping of old variants to new ones
const variantMapping = {
  'outline': 'secondary',
  'destructive': 'primary', 
  'link': 'ghost',
  'success': 'primary',
  'warning': 'primary'
};

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace Button variants
  Object.entries(variantMapping).forEach(([oldVariant, newVariant]) => {
    const regex = new RegExp(`variant="${oldVariant}"`, 'g');
    if (content.includes(`variant="${oldVariant}"`)) {
      content = content.replace(regex, `variant="${newVariant}"`);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      updateFile(filePath);
    }
  });
}

// Start from src directory
walkDir('./src');
console.log('Button variant migration complete!');
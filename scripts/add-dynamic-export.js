const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

function addDynamicExport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Zaten dynamic export varsa atla
  if (content.includes('export const dynamic')) {
    return false;
  }
  
  // İlk import satırından sonra ekle
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // İlk import satırını bul
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      insertIndex = i + 1;
      // Son import satırını bul
      while (insertIndex < lines.length && 
             (lines[insertIndex].trim().startsWith('import ') || 
              lines[insertIndex].trim() === '')) {
        insertIndex++;
      }
      break;
    }
  }
  
  // Boş satır varsa ondan sonra ekle
  if (insertIndex < lines.length && lines[insertIndex].trim() === '') {
    insertIndex++;
  }
  
  // Dynamic export ekle
  const dynamicExport = [
    '',
    '// Force dynamic rendering (Vercel serverless function)',
    "export const dynamic = 'force-dynamic';",
    ''
  ];
  
  lines.splice(insertIndex, 0, ...dynamicExport);
  
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return true;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file === 'route.ts') {
      if (addDynamicExport(filePath)) {
        console.log(`Added dynamic export to: ${filePath}`);
      }
    }
  }
}

processDirectory(apiDir);
console.log('Done!');

const fs = require('fs');
const path = require('path');

// Dynamic route'ları geri yükle
const dynamicRoutes = [
  'src/app/academy/courses/[id]',
  'src/app/academy/lessons/[id]',
  'src/app/code-snippets/[id]',
  'src/app/code-snippets/share/[token]',
  'src/app/conversations/[id]',
  'src/app/conversations/share/[token]',
  'src/app/teams/[id]',
  'src/app/teams/[id]/admin',
];

dynamicRoutes.forEach(route => {
  const routePath = path.join(__dirname, '..', route);
  const backupPath = path.join(__dirname, '..', route.replace('[', '_').replace(']', '_backup'));
  
  if (fs.existsSync(backupPath)) {
    console.log(`📁 ${route} geri yükleniyor...`);
    if (fs.existsSync(routePath)) {
      fs.rmSync(routePath, { recursive: true, force: true });
    }
    fs.renameSync(backupPath, routePath);
    console.log(`✅ ${route} geri yüklendi`);
  }
});

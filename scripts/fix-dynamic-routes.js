const fs = require('fs');
const path = require('path');

// Dynamic route'ları geçici olarak rename et
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
  
  if (fs.existsSync(routePath)) {
    console.log(`📁 ${route} geçici olarak yeniden adlandırılıyor...`);
    if (fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { recursive: true, force: true });
    }
    fs.renameSync(routePath, backupPath);
    console.log(`✅ ${route} backup olarak kaydedildi`);
  }
});

const fs = require('fs');
const path = require('path');

const apiFolder = path.join(__dirname, '..', 'src', 'app', 'api');
const apiFolderBackup = path.join(__dirname, '..', 'src', 'app', '_api_backup');

if (fs.existsSync(apiFolder)) {
  console.log('📁 API klasörü geçici olarak yeniden adlandırılıyor...');
  fs.renameSync(apiFolder, apiFolderBackup);
  console.log('✅ API klasörü backup olarak kaydedildi (_api_backup)');
}

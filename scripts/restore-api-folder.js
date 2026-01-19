const fs = require('fs');
const path = require('path');

const apiFolder = path.join(__dirname, '..', 'src', 'app', 'api');
const apiFolderBackup = path.join(__dirname, '..', 'src', 'app', '_api_backup');

if (fs.existsSync(apiFolderBackup)) {
  console.log('📁 API klasörü geri yükleniyor...');
  if (fs.existsSync(apiFolder)) {
    fs.rmSync(apiFolder, { recursive: true, force: true });
  }
  fs.renameSync(apiFolderBackup, apiFolder);
  console.log('✅ API klasörü geri yüklendi');
}

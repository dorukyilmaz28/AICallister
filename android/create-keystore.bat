@echo off
echo ========================================
echo Callister AI - Keystore Olusturma
echo ========================================
echo.
echo Bu script keystore dosyasi olusturacak.
echo Sizden sifre isteyecek - lutfen guvenli sifreler kullanin!
echo.
echo ONEMLI:
echo - Sifreleri guvenli bir yerde saklayin!
echo - Keystore dosyasini yedekleyin!
echo - Sifreleri kaybetmeyin!
echo.
pause

cd app
keytool -genkey -v -keystore callister-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias callister-key

echo.
echo ========================================
echo Keystore olusturuldu!
echo.
echo Simdi android/keystore.properties dosyasini olusturmaniz gerekiyor.
echo Ornek dosya: android/keystore.properties.example
echo ========================================
pause

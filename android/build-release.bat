@echo off
echo ========================================
echo Callister AI - Release AAB Build
echo ========================================
echo.

if not exist "keystore.properties" (
    echo HATA: keystore.properties dosyasi bulunamadi!
    echo Lutfen once keystore olusturun ve keystore.properties dosyasini hazirlayin.
    pause
    exit /b 1
)

if not exist "app\callister-release-key.jks" (
    echo HATA: callister-release-key.jks dosyasi bulunamadi!
    echo Lutfen once keystore olusturun.
    pause
    exit /b 1
)

echo Release AAB build baslatiliyor...
echo.

call gradlew bundleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD BASARILI!
    echo.
    echo AAB dosyasi: app\build\outputs\bundle\release\app-release.aab
    echo.
    echo Bu dosyayi Google Play Console'a yukleyebilirsiniz.
    echo ========================================
) else (
    echo.
    echo ========================================
    echo BUILD HATASI!
    echo Lutfen hata mesajlarini kontrol edin.
    echo ========================================
)

pause

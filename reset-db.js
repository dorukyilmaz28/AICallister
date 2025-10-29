const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🔄 Veritabanı tamamen sıfırlanıyor...');
    
    // Önce tüm verileri silmeyi dene
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        DECLARE 
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
            LOOP
                EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
            END LOOP;
        END $$;
      `);
      console.log('✅ Tüm tablo verileri temizlendi.');
    } catch (truncateError) {
      console.log('⚠️  TRUNCATE başarısız, tabloları drop ediliyor...');
    }

    // Tüm tabloları drop et (schema'yı tamamen sil)
    await prisma.$executeRawUnsafe(`
      DO $$ 
      DECLARE 
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
          LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `);
    
    console.log('✅ Tüm tablolar silindi.');
    
    // Tüm sequence'leri de temizle
    await prisma.$executeRawUnsafe(`
      DO $$ 
      DECLARE 
          r RECORD;
      BEGIN
          FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') 
          LOOP
              EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
          END LOOP;
      END $$;
    `);
    
    console.log('✅ Tüm sequence\'ler temizlendi.');
    console.log('\n✅✅✅ Veritabanı TAMAMEN SIFIRLANDI! ✅✅✅');
    console.log('\n💡 Şimdi migration\'ları tekrar çalıştırmak için:');
    console.log('   npx prisma migrate dev');
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
    
    // Son çare: Schema'yı tamamen drop et
    try {
      console.log('\n🔄 Son çare: Schema tamamen siliniyor...');
      await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE;');
      await prisma.$executeRawUnsafe('CREATE SCHEMA public;');
      await prisma.$executeRawUnsafe('GRANT ALL ON SCHEMA public TO public;');
      console.log('✅ Schema silindi ve yeniden oluşturuldu.');
    } catch (schemaError) {
      console.error('❌ Schema silme hatası:', schemaError.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();


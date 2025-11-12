const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log('🔍 Checking database...\n');
    await prisma.$connect();
    console.log('✅ Connected!\n');
    
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    
    console.log('📊 Tables:');
    tables.forEach(t => console.log(`   - ${t.tablename}`));
    
    if (tables.some(t => t.tablename === 'users')) {
      const userCount = await prisma.user.count();
      console.log(`\n👥 Users: ${userCount}`);
    }
    
    console.log('\n✨ Ready!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();

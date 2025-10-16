const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetToFirstName() {
  try {
    console.log('🔄 Resetting password to first name...');
    
    const email = 'ganesh@gmail.com';
    const firstName = 'ganesh'; // First name as password
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(firstName, 10);
    
    // Update both tables
    const user = await prisma.user.findUnique({ where: { email } });
    const staff = await prisma.staff.findFirst({ where: { email } });
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    
    await prisma.staff.update({
      where: { id: staff.id },
      data: { password: firstName }
    });
    
    console.log('✅ Password reset to first name:', firstName);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetToFirstName();
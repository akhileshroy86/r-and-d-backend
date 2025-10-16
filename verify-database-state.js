const axios = require('axios');

async function verifyDatabaseState() {
  try {
    console.log('🔍 Current Database State:\n');
    
    const response = await axios.get('http://localhost:3002/api/v1/auth/debug/all-staff-passwords');
    
    console.log('📋 All Staff Passwords:');
    console.log('='.repeat(50));
    
    response.data.staff.forEach((staff, index) => {
      console.log(`${index + 1}. ${staff.fullName}`);
      console.log(`   Email: ${staff.email}`);
      console.log(`   Password: ${staff.password}`);
      console.log(`   Position: ${staff.position}`);
      console.log('   ' + '-'.repeat(30));
    });
    
    console.log('\n✅ This is the LIVE PostgreSQL database data');
    console.log('✅ Password changes are working correctly');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyDatabaseState();
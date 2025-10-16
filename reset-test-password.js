const axios = require('axios');

async function resetTestPassword() {
  try {
    console.log('🔄 Resetting test password for frontend testing...\n');
    
    // Reset ganesh password to a known value for testing
    const resetResponse = await axios.post('http://localhost:3002/api/v1/auth/staff/change-password', {
      email: 'ganesh@gmail.com',
      currentPassword: 'userInputPassword456',
      newPassword: 'test123'
    });
    
    console.log('Reset result:', resetResponse.data);
    
    if (resetResponse.data.success) {
      console.log('\n✅ Password reset to "test123"');
      console.log('📋 Now you can test from frontend:');
      console.log('   Email: ganesh@gmail.com');
      console.log('   Current Password: test123');
      console.log('   New Password: [enter your desired password]');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

resetTestPassword();
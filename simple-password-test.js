const axios = require('axios');

async function testPasswordChange() {
  try {
    console.log('🔧 Simple Password Change Test\n');
    
    // Reset to known state first
    await axios.post('http://localhost:3002/api/v1/auth/staff/change-password', {
      email: 'ganesh@gmail.com',
      currentPassword: 'mynewpassword123',
      newPassword: 'RESET123'
    });
    
    console.log('✅ Reset password to: RESET123');
    
    // Now test with your input
    console.log('\n📋 Test these credentials in your frontend:');
    console.log('Email: ganesh@gmail.com');
    console.log('Current Password: RESET123');
    console.log('New Password: [Enter: USERINPUT999]');
    
    console.log('\n⏳ Waiting for your frontend test...');
    
    // Check every 3 seconds for changes
    let lastPassword = 'RESET123';
    const checkInterval = setInterval(async () => {
      try {
        const response = await axios.post('http://localhost:3002/api/v1/auth/debug/staff-info', {
          email: 'ganesh@gmail.com'
        });
        
        const currentPassword = response.data.staffData.password;
        
        if (currentPassword !== lastPassword) {
          console.log(`\n🔄 Password changed from "${lastPassword}" to "${currentPassword}"`);
          
          if (currentPassword === 'USERINPUT999') {
            console.log('✅ SUCCESS! Frontend input is working correctly!');
          } else {
            console.log('❌ Password changed but not to expected value');
          }
          
          lastPassword = currentPassword;
        }
      } catch (error) {
        // Ignore errors during monitoring
      }
    }, 3000);
    
    // Stop monitoring after 60 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log('\n⏹️ Monitoring stopped');
    }, 60000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPasswordChange();
const axios = require('axios');

async function monitorRequests() {
  try {
    console.log('🔍 Checking if backend is receiving requests...\n');
    
    // Test if backend is running
    const healthCheck = await axios.post('http://localhost:3002/api/v1/auth/simple-test', {
      test: 'monitoring'
    });
    
    console.log('✅ Backend is running:', healthCheck.data.message);
    
    // Check current password
    const currentState = await axios.post('http://localhost:3002/api/v1/auth/debug/staff-info', {
      email: 'ganesh@gmail.com'
    });
    
    console.log('📋 Current password in database:', currentState.data.staffData.password);
    console.log('📋 Staff ID:', currentState.data.staffData.id);
    
    console.log('\n🎯 Now try changing password from your frontend...');
    console.log('   The backend will log any requests it receives.');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Backend server is NOT running on localhost:3002');
      console.log('💡 Start backend with: npm run start:dev');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

monitorRequests();
// test-login.js
const API_URL = 'http://localhost:5000/api';

async function testLogin() {
  console.log('Testing login API...');
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);
    
    const text = await response.text();
    console.log('Response Text:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Response JSON:', data);
    } catch (e) {
      console.log('Response is not JSON');
    }
    
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testLogin();
const fs = require('fs');

// Add logging middleware to main.ts to catch ALL requests
const mainTsPath = 'src/main.ts';
const mainTsContent = fs.readFileSync(mainTsPath, 'utf8');

const newContent = mainTsContent.replace(
  'app.setGlobalPrefix(\'api/v1\');',
  `// Log all requests
  app.use((req, res, next) => {
    if (req.url.includes('change-password')) {
      console.log('\\n🔥 PASSWORD CHANGE REQUEST INTERCEPTED 🔥');
      console.log('URL:', req.url);
      console.log('Method:', req.method);
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('Headers:', req.headers);
    }
    next();
  });
  
  app.setGlobalPrefix('api/v1');`
);

fs.writeFileSync(mainTsPath, newContent);
console.log('✅ Added request logging to main.ts');
console.log('💡 Restart the backend server to see all password change requests');
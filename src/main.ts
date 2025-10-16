import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Global validation pipe - temporarily relaxed for debugging
  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,
    forbidNonWhitelisted: false,
    transform: true,
    skipMissingProperties: true,
  }));
  
  // CORS configuration
  app.enableCors({
    origin: '*',
    credentials: false,
  });
  
  // Global API prefix
  // Log all requests
  app.use((req, res, next) => {
    if (req.url.includes('change-password')) {
      console.log('\n🔥 PASSWORD CHANGE REQUEST INTERCEPTED 🔥');
      console.log('URL:', req.url);
      console.log('Method:', req.method);
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('Headers:', req.headers);
    }
    next();
  });
  
  app.setGlobalPrefix('api/v1');
  
  const port = configService.get<number>('PORT') || 3002;
  await app.listen(port);
  
  console.log(`Healthcare Management System API running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap();

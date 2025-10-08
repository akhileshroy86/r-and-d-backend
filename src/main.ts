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
  app.setGlobalPrefix('api');
  
  const port = configService.get<number>('PORT') || 3002;
  await app.listen(port);
  
  console.log(`Healthcare Management System API running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap();

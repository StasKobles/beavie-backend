import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const allowedOrigin = process.env.CORS_URL;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigin === '*' || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
  });

  app.setGlobalPrefix('api');

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Beavie API')
    .setDescription('The Beavie API description')
    .setVersion('1.0')
    .addTag('beavie')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app
    .listen(3001)
    .then(() => {
      logger.log('Server is running on http://localhost:3001');
    })
    .catch((err) => {
      logger.error('Error starting server', err);
    });
}
bootstrap();

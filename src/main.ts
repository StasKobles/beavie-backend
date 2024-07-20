import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

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
    .listen(3000)
    .then(() => {
      logger.log('Server is running on http://localhost:3000');
    })
    .catch((err) => {
      logger.error('Error starting server', err);
    });
}
bootstrap();

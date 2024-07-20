import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

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

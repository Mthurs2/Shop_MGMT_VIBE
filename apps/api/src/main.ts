import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { csrfMiddleware } from './common/csrf.middleware.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(helmet());
  const sessionSecret = app.get(ConfigService).get<string>('SESSION_SECRET');
  app.use(cookieParser(sessionSecret));
  app.use(csrfMiddleware);
  app.enableCors({
    origin: (origin, callback) => {
      const allowed = app.get(ConfigService).get<string>('CORS_ORIGINS')?.split(',') ?? [];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  });

  const config = new DocumentBuilder()
    .setTitle('Shop Management API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = app.get(ConfigService).get<number>('PORT') ?? 3001;
  await app.listen(port);
}

bootstrap();

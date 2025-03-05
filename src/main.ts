import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const whitelist = [
    configService.get<string>('app.server_url'),

    configService.get<string>('app.client_url'),
  ];
  app.useGlobalPipes(new ValidationPipe({}));
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('SmartBarber API')
    .setDescription('The SmartBarber API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = configService.get<string>('app.port') || 3000;
  await app.listen(port);
  console.log(
    `The server is running by ${configService.get<string>(
      'app.server_url',
    )}/swagger at port ${port}`,
  );
}
bootstrap();

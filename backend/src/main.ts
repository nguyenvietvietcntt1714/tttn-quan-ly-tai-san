import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();
  // Cấu hình tài liệu Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API quản lý tài sản')
    .setDescription('API tạo, xem và cập nhật hồ sơ tài sản')
    .setVersion('1.0')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);

  console.log(`Backend đang chạy tại http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);

}

bootstrap();
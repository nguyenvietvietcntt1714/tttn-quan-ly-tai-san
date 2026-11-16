import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Hệ Thống Quản Lý Tài Sản API')
    .setDescription('Tài liệu API quản lý tài sản, phiếu nghiệp vụ và lịch sử biến động')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();

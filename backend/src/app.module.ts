import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AssetsModule } from './assets/assets.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    AssetsModule, // Nhận module quản lý tài sản
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [], // Đã bỏ AppService
})
export class AppModule {}
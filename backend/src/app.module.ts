import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AssetsModule } from './assets/assets.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    PrismaModule,
    AssetsModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
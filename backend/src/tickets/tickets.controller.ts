import { Controller, Post, Body, Patch, Param, Get, Query, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    async create(
        @Body() body: { assetId: string; userId: string; type: string; note?: string },
        @CurrentUser() user: { sub: string },
    ) {
        return this.ticketsService.createTicket({
            ...body,
            creatorId: user.sub,
        });
    }

    @Patch(':id/cancel')
    async cancel(
        @Param('id') id: string,
        @CurrentUser() user: { sub: string },
    ) {
        return this.ticketsService.cancelTicket(id, user.sub);
    }

    @Patch(':id/complete')
    async complete(
        @Param('id') id: string,
        @CurrentUser() user: { sub: string },
    ) {
        return this.ticketsService.completeTicket(id, user.sub);
    }

    @Get()
    async findAll() {
        return this.ticketsService.findAll();
    }

    @Get('asset-history')
    async getAssetHistory(
        @Query('assetId') assetId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.ticketsService.getAssetHistory(assetId, startDate, endDate);
    }
}

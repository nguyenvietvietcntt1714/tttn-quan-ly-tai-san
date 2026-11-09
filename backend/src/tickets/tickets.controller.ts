import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Get()
    findAll() {
        return this.ticketsService.findAll();
    }

    @Post()
    create(@Body() body: { assetId: string; userId: string; type: string; note?: string }) {
        return this.ticketsService.createTicket(body);
    }

    @Patch(':id/cancel')
    cancel(@Param('id') id: string) {
        return this.ticketsService.cancelTicket(id);
    }

    // [B5] Endpoint xác nhận hoàn thành phiếu (Điều chuyển / Thu hồi)
    @Patch(':id/complete')
    complete(@Param('id') id: string) {
        return this.ticketsService.completeTicket(id);
    }

    // [B6] Endpoint lấy lịch sử theo tài sản và khoảng thời gian (Query params: startDate, endDate)
    @Get('history/:assetId')
    getHistory(
        @Param('assetId') assetId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.ticketsService.getAssetHistory(assetId, startDate, endDate);
    }

    // [B6] Endpoint tạo phiếu sửa sai có tham chiếu
    @Post('correction')
    createCorrection(@Body() body: { assetId: string; referenceTicketId: string; userId: string; note: string }) {
        return this.ticketsService.createCorrectionTicket(body);
    }
}
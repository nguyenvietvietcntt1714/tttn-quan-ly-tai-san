import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TicketStatus, TicketType } from '@prisma/client';

@Injectable()
export class TicketsService {
    constructor(private readonly prisma: PrismaService) { }

    // 1. Tạo phiếu bàn giao / mượn trả (Giải quyết B3 & B4)
    async createTicket(data: {
        assetId: string;
        userId: string;
        type: string;
        note?: string;
    }) {
        const asset = await this.prisma.asset.findUnique({
            where: { id: data.assetId },
        });
        if (!asset) {
            throw new NotFoundException(`Tài sản với ID ${data.assetId} không tồn tại.`);
        }

        const existingActiveTicket = await this.prisma.ticket.findFirst({
            where: {
                assetId: data.assetId,
                status: TicketStatus.DRAFT,
            },
        });

        if (existingActiveTicket) {
            throw new BadRequestException('Tài sản này đang trong quá trình xử lý phiếu khác, không thể tạo trùng lặp.');
        }

        return await this.prisma.$transaction(async (tx) => {
            const newTicket = await tx.ticket.create({
                data: {
                    assetId: data.assetId,
                    userId: data.userId,
                    type: data.type as TicketType,
                    status: TicketStatus.DRAFT,
                    note: data.note,
                } as any,
            });

            await tx.assetHistory.create({
                data: {
                    assetId: data.assetId,
                    action: `TẠO PHIẾU: ${data.type}`,
                } as any,
            });

            return newTicket;
        });
    }

    // 2. Hủy phiếu hoặc cập nhật trạng thái
    async cancelTicket(id: string) {
        const ticket = await this.prisma.ticket.findUnique({ where: { id } });
        if (!ticket) {
            throw new NotFoundException('Không tìm thấy phiếu yêu cầu.');
        }

        if (ticket.status === TicketStatus.CANCELLED) {
            throw new BadRequestException('Phiếu này đã bị hủy trước đó.');
        }

        return await this.prisma.$transaction(async (tx) => {
            const updatedTicket = await tx.ticket.update({
                where: { id },
                data: { status: TicketStatus.CANCELLED },
            });

            await tx.assetHistory.create({
                data: {
                    assetId: ticket.assetId,
                    action: 'HỦY PHIẾU',
                } as any,
            });

            return updatedTicket;
        });
    }

    // 3. Lấy danh sách phiếu
    async findAll() {
        return this.prisma.ticket.findMany({
            include: { asset: true } as any,
        });
    }

    // ==========================================
    // B5: ĐIỀU CHUYỂN VÀ THU HỒI (Hoàn thành phiếu)
    // ==========================================
    async completeTicket(id: string) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: { asset: true } as any,
        });

        if (!ticket) {
            throw new NotFoundException('Không tìm thấy phiếu yêu cầu.');
        }

        if (ticket.status === TicketStatus.CONFIRMED) {
            throw new BadRequestException('Phiếu này đã được xác nhận hoàn thành trước đó.');
        }

        return await this.prisma.$transaction(async (tx) => {
            const updatedTicket = await tx.ticket.update({
                where: { id },
                data: { status: TicketStatus.CONFIRMED },
            });

            // Kiểm tra loại phiếu: Hỗ trợ cả TRANSFER, HANDOVER và RECALL / DEACTIVATE theo schema
            if (ticket.type === 'TRANSFER' || ticket.type === 'HANDOVER') {
                await tx.asset.update({
                    where: { id: ticket.assetId },
                    data: { userId: ticket.userId } as any,
                });
            } else if (ticket.type === 'RECALL' || ticket.type === 'DEACTIVATE' || (ticket.type as string) === 'RECOVER') {
                await tx.asset.update({
                    where: { id: ticket.assetId },
                    data: { userId: null } as any,
                });
            }

            await tx.assetHistory.create({
                data: {
                    assetId: ticket.assetId,
                    action: `HOÀN THÀNH PHIẾU: ${ticket.type}`,
                    description: `Xác nhận hoàn thành xử lý phiếu ID: ${id}`,
                } as any,
            });

            return updatedTicket;
        });
    }

    // ==========================================
    // B6: LỊCH SỬ VÀ SỬA SAI
    // ==========================================
    async getAssetHistory(assetId: string, startDate?: string, endDate?: string) {
        const whereClause: any = { assetId };

        if (startDate && endDate) {
            whereClause.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }

        return this.prisma.assetHistory.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });
    }

    async createCorrectionTicket(data: {
        assetId: string;
        referenceTicketId: string;
        userId: string;
        note: string;
    }) {
        const refTicket = await this.prisma.ticket.findUnique({
            where: { id: data.referenceTicketId },
        });
        if (!refTicket) {
            throw new NotFoundException('Phiếu tham chiếu không tồn tại trong hệ thống.');
        }

        return await this.prisma.$transaction(async (tx) => {
            const correctionTicket = await tx.ticket.create({
                data: {
                    assetId: data.assetId,
                    userId: data.userId,
                    type: 'CORRECTION' as TicketType,
                    status: TicketStatus.CONFIRMED,
                    note: `Sửa sai cho phiếu [${data.referenceTicketId}]: ${data.note}`,
                } as any,
            });

            await tx.assetHistory.create({
                data: {
                    assetId: data.assetId,
                    action: 'SỬA SAI / ĐIỀU CHỈNH',
                    description: `Tham chiếu phiếu cũ ${data.referenceTicketId}: ${data.note}`,
                } as any,
            });

            return correctionTicket;
        });
    }
}
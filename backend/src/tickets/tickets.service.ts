import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TicketStatus, TicketType } from '@prisma/client';

@Injectable()
export class TicketsService {
    constructor(private readonly prisma: PrismaService) { }

    async createTicket(data: {
        assetId: string;
        userId: string; // toUser
        creatorId: string; // creator & actorId history
        type: string;
        note?: string;
    }) {
        const asset = await this.prisma.asset.findFirst({
            where: {
                OR: [{ assetCode: data.assetId }, { id: data.assetId }],
            },
        });

        if (!asset) {
            throw new NotFoundException(`Tài sản với mã ${data.assetId} không tồn tại trong hệ thống!`);
        }

        const existingActiveTicket = await this.prisma.ticket.findFirst({
            where: {
                assetId: asset.id,
                status: TicketStatus.DRAFT,
            },
        });

        if (existingActiveTicket) {
            throw new BadRequestException('Tài sản này đang trong quá trình xử lý phiếu khác, không thể tạo trùng lặp.');
        }

        return await this.prisma.$transaction(async (tx) => {
            const generatedTicketCode = `TCK-${Date.now()}`;
            const newTicket = await tx.ticket.create({
                data: {
                    ticketCode: generatedTicketCode,
                    asset: { connect: { id: asset.id } },
                    toUser: { connect: { id: data.userId } },
                    creator: { connect: { id: data.creatorId } },
                    type: data.type as TicketType,
                    status: TicketStatus.DRAFT,
                    reason: data.note || 'Cấp phát/Điều chuyển tài sản',
                },
            });

            await tx.assetHistory.create({
                data: {
                    assetId: asset.id,
                    actorId: data.creatorId,
                    action: `TẠO PHIẾU: ${data.type}`,
                },
            });

            return newTicket;
        });
    }

    async cancelTicket(id: string, actorId: string) {
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
                    actorId: actorId,
                    action: 'HỦY PHIẾU',
                },
            });

            return updatedTicket;
        });
    }

    async findAll() {
        return this.prisma.ticket.findMany({
            include: {
                asset: true,
                creator: true,
                toUser: true,
                fromUser: true,
            },
        });
    }

    async completeTicket(id: string, actorId: string) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id },
            include: { asset: true, toUser: true },
        });

        if (!ticket) {
            throw new NotFoundException('Không tìm thấy phiếu yêu cầu.');
        }

        if (ticket.status === TicketStatus.CONFIRMED) {
            throw new BadRequestException('Phiếu này đã được xác nhận hoàn thành trước đó.');
        }

        if ((ticket.type === TicketType.TRANSFER || ticket.type === TicketType.HANDOVER) && !ticket.toUserId) {
            throw new BadRequestException('Phiếu chưa xác định người nhận, không thể hoàn thành.');
        }

        return await this.prisma.$transaction(async (tx) => {
            const updatedTicket = await tx.ticket.update({
                where: { id },
                data: { status: TicketStatus.CONFIRMED },
            });

            // ✅ SỬA: assignedUser thay vì user
            if (ticket.type === TicketType.TRANSFER || ticket.type === TicketType.HANDOVER) {
                await tx.asset.update({
                    where: { id: ticket.assetId },
                    data: {
                        assignedUser: { connect: { id: ticket.toUserId! } },
                    },
                });
            } else if (ticket.type === TicketType.RECALL || ticket.type === TicketType.DEACTIVATE) {
                await tx.asset.update({
                    where: { id: ticket.assetId },
                    data: {
                        assignedUser: { disconnect: true },
                    },
                });
            }

            await tx.assetHistory.create({
                data: {
                    assetId: ticket.assetId,
                    actorId: actorId,
                    action: `HOÀN THÀNH PHIẾU: ${ticket.type}`,
                },
            });

            return updatedTicket;
        });
    }

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

    // ⚠️ Lưu ý quan trọng: Schema hiện tại enum TicketType KHÔNG có CORRECTION
    // Nếu bạn thật sự muốn dùng correction: Vào schema.prisma thêm CORRECTION vào enum TicketType rồi prisma generate
    /*
    async createCorrectionTicket(data: {
      assetId: string;
      referenceTicketId: string;
      userId: string;
      creatorId: string;
      note: string;
    }) {
      const refTicket = await this.prisma.ticket.findUnique({
        where: { id: data.referenceTicketId },
      });
      if (!refTicket) {
        throw new NotFoundException('Phiếu tham chiếu không tồn tại trong hệ thống.');
      }
  
      const asset = await this.prisma.asset.findFirst({
        where: { OR: [{ assetCode: data.assetId }, { id: data.assetId }] },
      });
      if (!asset) {
        throw new NotFoundException(`Tài sản ${data.assetId} không tồn tại`);
      }
  
      return await this.prisma.$transaction(async (tx) => {
        const generatedTicketCode = `COR-${Date.now()}`;
  
        const correctionTicket = await tx.ticket.create({
          data: {
            ticketCode: generatedTicketCode,
            asset: { connect: { id: asset.id } },
            toUser: { connect: { id: data.userId } },
            creator: { connect: { id: data.creatorId } },
            type: 'CORRECTION' as TicketType,
            status: TicketStatus.CONFIRMED,
            reason: 'Điều chỉnh / Sửa sai thông tin phiếu',
            referenceTicketId: data.referenceTicketId,
          },
        });
  
        await tx.assetHistory.create({
          data: {
            assetId: asset.id,
            actorId: data.creatorId,
            action: 'SỬA SAI / ĐIỀU CHỈNH',
          },
        });
  
        return correctionTicket;
      });
    }
    */
}

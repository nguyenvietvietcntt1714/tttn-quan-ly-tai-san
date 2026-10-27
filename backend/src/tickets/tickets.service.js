"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TicketsService = class TicketsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async confirmTicket(ticketId, managerId) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: { asset: true },
        });
        if (!ticket) {
            throw new common_1.BadRequestException('Phiếu không tồn tại.');
        }
        if (ticket.status !== 'DRAFT') {
            throw new common_1.BadRequestException('Phiếu này đã được xử lý hoặc hủy trước đó.');
        }
        const asset = ticket.asset;
        try {
            return await this.prisma.$transaction(async (tx) => {
                const beforeState = {
                    areaId: asset.areaId,
                    assignedUserId: asset.assignedUserId,
                    managementStatus: asset.managementStatus,
                    condition: asset.condition,
                };
                const updatedAsset = await tx.asset.update({
                    where: {
                        id: asset.id,
                        version: asset.version,
                    },
                    data: {
                        areaId: ticket.toAreaId ?? asset.areaId,
                        assignedUserId: ticket.toUserId ?? asset.assignedUserId,
                        managementStatus: ticket.toStatus ?? asset.managementStatus,
                        version: { increment: 1 },
                    },
                });
                const afterState = {
                    areaId: updatedAsset.areaId,
                    assignedUserId: updatedAsset.assignedUserId,
                    managementStatus: updatedAsset.managementStatus,
                    condition: updatedAsset.condition,
                };
                const confirmedTicket = await tx.ticket.update({
                    where: { id: ticketId },
                    data: {
                        status: 'CONFIRMED',
                        confirmerId: managerId,
                        confirmedAt: new Date(),
                    },
                });
                await tx.assetHistory.create({
                    data: {
                        assetId: asset.id,
                        action: `Xác nhận phiếu ${ticket.type}`,
                        reason: ticket.reason,
                        beforeState: beforeState,
                        afterState: afterState,
                        actorId: managerId,
                    },
                });
                return {
                    success: true,
                    message: 'Xác nhận phiếu thành công!',
                    confirmedTicket,
                };
            });
        }
        catch (error) {
            throw new common_1.ConflictException('Xung đột dữ liệu: Tài sản này đã bị thay đổi bởi một giao dịch khác trong hệ thống. Vui lòng thử lại!');
        }
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map
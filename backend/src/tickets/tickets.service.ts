import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ManagementStatus, TicketStatus, TicketType } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(data: {
    assetId: string;
    userId?: string;
    toAreaId?: string;
    creatorId: string;
    type: string;
    note?: string;
  }) {
    if (!data.assetId || !data.assetId.trim()) {
      throw new BadRequestException('Vui lòng chọn tài sản.');
    }

    const validTypes = Object.values(TicketType);
    if (!validTypes.includes(data.type as TicketType)) {
      throw new BadRequestException(`Loại phiếu "${data.type}" không hợp lệ.`);
    }
    const ticketType = data.type as TicketType;

    const asset = await this.prisma.asset.findFirst({
      where: {
        OR: [{ id: data.assetId.trim() }, { assetCode: data.assetId.trim() }],
      },
      include: {
        assignedUser: { select: { id: true, username: true, fullName: true } },
      },
    });

    if (!asset) {
      throw new NotFoundException(
        `Tài sản với mã "${data.assetId}" không tồn tại trong hệ thống!`,
      );
    }

    if (asset.managementStatus === ManagementStatus.INACTIVE) {
      throw new BadRequestException(
        'Tài sản đã ngừng theo dõi (INACTIVE), không thể lập phiếu nghiệp vụ.',
      );
    }

    if (
      ticketType === TicketType.HANDOVER &&
      asset.managementStatus !== ManagementStatus.AVAILABLE
    ) {
      throw new BadRequestException(
        'Chỉ có thể bàn giao (HANDOVER) tài sản đang ở trạng thái Sẵn sàng (AVAILABLE).',
      );
    }

    if (
      (ticketType === TicketType.RECALL || ticketType === TicketType.TRANSFER) &&
      asset.managementStatus !== ManagementStatus.IN_USE
    ) {
      throw new BadRequestException(
        `Chỉ có thể ${ticketType === TicketType.RECALL ? 'thu hồi (RECALL)' : 'điều chuyển (TRANSFER)'} tài sản đang ở trạng thái Đang sử dụng (IN_USE).`,
      );
    }

    let toUser: { id: string; username: string; fullName: string; departmentId: string | null } | null = null;
    if (ticketType === TicketType.HANDOVER || ticketType === TicketType.TRANSFER) {
      if (!data.userId || !data.userId.trim()) {
        throw new BadRequestException(
          'Vui lòng chọn người nhận tài sản cho phiếu bàn giao / điều chuyển.',
        );
      }
      toUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: data.userId.trim() }, { username: data.userId.trim() }],
        },
        select: { id: true, username: true, fullName: true, departmentId: true },
      });

      if (!toUser) {
        throw new NotFoundException(
          `Không tìm thấy người nhận với mã "${data.userId}" trong hệ thống!`,
        );
      }

      if (ticketType === TicketType.TRANSFER && asset.assignedUserId === toUser.id) {
        throw new BadRequestException(
          'Người nhận điều chuyển phải khác với người đang giữ tài sản hiện tại.',
        );
      }
    }

    const toStatus: ManagementStatus =
      ticketType === TicketType.HANDOVER || ticketType === TicketType.TRANSFER
        ? ManagementStatus.IN_USE
        : ticketType === TicketType.RECALL
          ? ManagementStatus.AVAILABLE
          : ManagementStatus.INACTIVE;

    const defaultReason =
      ticketType === TicketType.HANDOVER
        ? `Bàn giao tài sản cho ${toUser?.fullName ?? ''}`
        : ticketType === TicketType.TRANSFER
          ? `Điều chuyển tài sản từ ${asset.assignedUser?.fullName ?? 'kho'} sang ${toUser?.fullName ?? ''}`
          : ticketType === TicketType.RECALL
            ? `Thu hồi tài sản từ ${asset.assignedUser?.fullName ?? 'nhân sự'} về kho`
            : 'Ngừng theo dõi tài sản';

    const reasonText = data.note?.trim() || defaultReason;

    return await this.prisma.$transaction(async (tx) => {
      const existingActiveTicket = await tx.ticket.findFirst({
        where: {
          assetId: asset.id,
          status: TicketStatus.DRAFT,
        },
      });

      if (existingActiveTicket) {
        throw new ConflictException(
          `Tài sản này đang có phiếu chờ xử lý (${existingActiveTicket.ticketCode}), không thể tạo phiếu trùng lặp.`,
        );
      }

      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const generatedTicketCode = `TCK-${Date.now()}-${randomSuffix}`;

      const newTicket = await tx.ticket.create({
        data: {
          ticketCode: generatedTicketCode,
          type: ticketType,
          status: TicketStatus.DRAFT,
          assetId: asset.id,
          fromAreaId: asset.areaId,
          fromUserId: asset.assignedUserId,
          fromDeptId: asset.assignedDeptId,
          fromStatus: asset.managementStatus,
          toAreaId: data.toAreaId || asset.areaId,
          toUserId: toUser ? toUser.id : null,
          toDeptId: toUser?.departmentId ?? asset.assignedDeptId,
          toStatus,
          reason: reasonText,
          creatorId: data.creatorId,
        },
        include: {
          asset: true,
          creator: { select: { id: true, username: true, fullName: true } },
          toUser: { select: { id: true, username: true, fullName: true } },
          fromUser: { select: { id: true, username: true, fullName: true } },
        },
      });

      await tx.assetHistory.create({
        data: {
          assetId: asset.id,
          actorId: data.creatorId,
          action: `TẠO PHIẾU: ${ticketType}`,
          reason: reasonText,
          beforeState: {
            ticketCode: generatedTicketCode,
            ticketStatus: TicketStatus.DRAFT,
            managementStatus: asset.managementStatus,
            assignedUserId: asset.assignedUserId,
          },
          afterState: {
            ticketCode: generatedTicketCode,
            ticketStatus: TicketStatus.DRAFT,
            expectedStatus: toStatus,
            toUserId: toUser ? toUser.id : null,
          },
        },
      });

      return newTicket;
    });
  }

  async cancelTicket(id: string, actorId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findFirst({
        where: { OR: [{ id }, { ticketCode: id }] },
      });

      if (!ticket) {
        throw new NotFoundException('Không tìm thấy phiếu yêu cầu.');
      }

      if (ticket.status === TicketStatus.CANCELLED) {
        throw new BadRequestException('Phiếu này đã bị hủy trước đó.');
      }

      if (ticket.status === TicketStatus.CONFIRMED) {
        throw new BadRequestException(
          'Phiếu này đã được xác nhận hoàn thành, không thể hủy!',
        );
      }

      // Atomic compare-and-set: Chỉ hủy khi phiếu đang ở trạng thái DRAFT
      const updateResult = await tx.ticket.updateMany({
        where: {
          id: ticket.id,
          status: TicketStatus.DRAFT,
        },
        data: {
          status: TicketStatus.CANCELLED,
          confirmerId: actorId,
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictException(
          'Phiếu đã được xử lý bởi một thao tác đồng thời khác (Chống bấm trùng).',
        );
      }

      await tx.assetHistory.create({
        data: {
          assetId: ticket.assetId,
          actorId,
          action: `HỦY PHIẾU: ${ticket.type}`,
          reason: `Hủy phiếu ${ticket.ticketCode} (${ticket.reason})`,
          beforeState: {
            ticketCode: ticket.ticketCode,
            ticketStatus: TicketStatus.DRAFT,
          },
          afterState: {
            ticketCode: ticket.ticketCode,
            ticketStatus: TicketStatus.CANCELLED,
          },
        },
      });

      return tx.ticket.findUnique({
        where: { id: ticket.id },
        include: {
          asset: true,
          creator: { select: { id: true, username: true, fullName: true } },
          toUser: { select: { id: true, username: true, fullName: true } },
          fromUser: { select: { id: true, username: true, fullName: true } },
        },
      });
    });
  }

  async findAll() {
    return this.prisma.ticket.findMany({
      include: {
        asset: {
          include: {
            group: true,
            category: true,
            area: { include: { facility: true } },
          },
        },
        creator: { select: { id: true, username: true, fullName: true } },
        confirmer: { select: { id: true, username: true, fullName: true } },
        toUser: { select: { id: true, username: true, fullName: true } },
        fromUser: { select: { id: true, username: true, fullName: true } },
        fromArea: true,
        toArea: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async completeTicket(id: string, actorId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findFirst({
        where: { OR: [{ id }, { ticketCode: id }] },
        include: { asset: true, toUser: true, fromUser: true },
      });

      if (!ticket) {
        throw new NotFoundException('Không tìm thấy phiếu yêu cầu.');
      }

      if (ticket.status === TicketStatus.CONFIRMED) {
        throw new BadRequestException(
          'Phiếu này đã được xác nhận hoàn thành trước đó.',
        );
      }

      if (ticket.status === TicketStatus.CANCELLED) {
        throw new BadRequestException(
          'Phiếu này đã bị hủy, không thể xác nhận hoàn thành!',
        );
      }

      if (
        (ticket.type === TicketType.TRANSFER ||
          ticket.type === TicketType.HANDOVER) &&
        !ticket.toUserId
      ) {
        throw new BadRequestException(
          'Phiếu chưa xác định người nhận, không thể hoàn thành.',
        );
      }

      // Kiểm tra tính hợp lệ của trạng thái tài sản hiện tại trước khi áp dụng phiếu
      const currentAsset = ticket.asset;
      if (currentAsset.managementStatus === ManagementStatus.INACTIVE) {
        throw new BadRequestException(
          'Tài sản đã ngừng theo dõi (INACTIVE), không thể thực hiện phiếu.',
        );
      }

      if (
        ticket.type === TicketType.HANDOVER &&
        currentAsset.managementStatus !== ManagementStatus.AVAILABLE
      ) {
        throw new ConflictException(
          'Tài sản hiện không còn ở trạng thái Sẵn sàng (AVAILABLE) để bàn giao.',
        );
      }

      if (
        (ticket.type === TicketType.RECALL ||
          ticket.type === TicketType.TRANSFER) &&
        currentAsset.managementStatus !== ManagementStatus.IN_USE
      ) {
        throw new ConflictException(
          'Tài sản hiện không ở trạng thái Đang sử dụng (IN_USE) để thu hồi / điều chuyển.',
        );
      }

      // 1. Atomic compare-and-set trên bảng Ticket: Chống 2 người bấm xác nhận cùng lúc
      const now = new Date();
      const ticketUpdate = await tx.ticket.updateMany({
        where: {
          id: ticket.id,
          status: TicketStatus.DRAFT,
        },
        data: {
          status: TicketStatus.CONFIRMED,
          confirmerId: actorId,
          confirmedAt: now,
        },
      });

      if (ticketUpdate.count === 0) {
        throw new ConflictException(
          'Phiếu đã được xác nhận hoặc hủy bởi một thao tác đồng thời khác (Chống ghi trùng lặp).',
        );
      }

      // 2. Xác định trạng thái tài sản và người giữ mới theo đúng loại phiếu
      let nextStatus: ManagementStatus = currentAsset.managementStatus;
      let nextAssignedUserId: string | null = currentAsset.assignedUserId;

      if (
        ticket.type === TicketType.HANDOVER ||
        ticket.type === TicketType.TRANSFER
      ) {
        nextStatus = ManagementStatus.IN_USE;
        nextAssignedUserId = ticket.toUserId!;
      } else if (ticket.type === TicketType.RECALL) {
        nextStatus = ManagementStatus.AVAILABLE;
        nextAssignedUserId = null;
      } else if (ticket.type === TicketType.DEACTIVATE) {
        nextStatus = ManagementStatus.INACTIVE;
        nextAssignedUserId = null;
      }

      // 3. Optimistic Locking trên bảng Asset thông qua cột version
      const assetUpdate = await tx.asset.updateMany({
        where: {
          id: ticket.assetId,
          version: currentAsset.version,
        },
        data: {
          managementStatus: nextStatus,
          assignedUserId: nextAssignedUserId,
          ...(ticket.toAreaId ? { areaId: ticket.toAreaId } : {}),
          version: { increment: 1 },
        },
      });

      if (assetUpdate.count === 0) {
        throw new ConflictException(
          'Dữ liệu tài sản vừa bị thay đổi bởi một giao dịch khác (Optimistic Locking). Vui lòng thử lại.',
        );
      }

      // 4. Lưu lịch sử biến động (chỉ ghi đúng 1 lần trong transaction)
      await tx.assetHistory.create({
        data: {
          assetId: ticket.assetId,
          actorId,
          action: `HOÀN THÀNH PHIẾU: ${ticket.type}`,
          reason: ticket.reason,
          beforeState: {
            ticketCode: ticket.ticketCode,
            managementStatus: currentAsset.managementStatus,
            assignedUserId: currentAsset.assignedUserId,
            areaId: currentAsset.areaId,
            version: currentAsset.version,
          },
          afterState: {
            ticketCode: ticket.ticketCode,
            managementStatus: nextStatus,
            assignedUserId: nextAssignedUserId,
            areaId: ticket.toAreaId || currentAsset.areaId,
            version: currentAsset.version + 1,
          },
        },
      });

      return tx.ticket.findUnique({
        where: { id: ticket.id },
        include: {
          asset: true,
          creator: { select: { id: true, username: true, fullName: true } },
          confirmer: { select: { id: true, username: true, fullName: true } },
          toUser: { select: { id: true, username: true, fullName: true } },
          fromUser: { select: { id: true, username: true, fullName: true } },
        },
      });
    });
  }

  async getAssetHistory(assetId?: string, startDate?: string, endDate?: string) {
    const whereClause: any = {};

    if (assetId && assetId.trim()) {
      const q = assetId.trim();
      whereClause.OR = [
        { assetId: q },
        { asset: { assetCode: { contains: q, mode: 'insensitive' } } },
        { asset: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    return this.prisma.assetHistory.findMany({
      where: whereClause,
      include: {
        asset: {
          select: {
            id: true,
            assetCode: true,
            name: true,
            managementStatus: true,
            condition: true,
          },
        },
        actor: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}

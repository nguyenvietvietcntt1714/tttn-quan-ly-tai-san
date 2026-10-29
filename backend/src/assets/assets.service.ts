import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { FindAssetsQueryDto } from './dto/find-assets-query.dto';
import { ChangeAssetConditionDto } from './dto/change-asset-condition.dto';
import { DeactivateAssetDto } from './dto/deactivate-asset.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  // Danh sách tài sản
  async findAll() {
    return this.prisma.asset.findMany({
      include: {
        group: true,
        area: {
          include: {
            facility: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        assignedDept: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Xem chi tiết một tài sản
  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        group: true,
        area: {
          include: {
            facility: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        assignedDept: true,
        histories: {
          orderBy: { createdAt: 'desc' },
        },
        tickets: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Không tìm thấy tài sản.');
    }

    return asset;
  }

  // Tạo tài sản
  async create(dto: CreateAssetDto) {
    const {
      facilityId,
      receiptDate,
      warrantyDate,
      ...assetData
    } = dto;

    // Kiểm tra mã tài sản đã tồn tại chưa
    const existing = await this.prisma.asset.findUnique({
      where: { assetCode: dto.assetCode },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Mã tài sản đã tồn tại.');
    }

    // Kiểm tra nhóm tài sản
    const group = await this.prisma.assetGroup.findUnique({
  where: { id: dto.groupId },
  select: {
    id: true,
    isActive: true,
  },
});

if (!group) {
  throw new BadRequestException('Nhóm tài sản không tồn tại.');
}

if (!group.isActive) {
  throw new BadRequestException(
    'Nhóm tài sản đã ngừng sử dụng, không thể chọn mới.',
  );
}

    if (!group) {
      throw new BadRequestException('Nhóm tài sản không tồn tại.');
    }

    // Kiểm tra khu vực có tồn tại và thuộc đúng cơ sở
    const area = await this.prisma.area.findUnique({
  where: { id: dto.areaId },
  select: {
    id: true,
    facilityId: true,
    isActive: true,
    facility: {
      select: {
        isActive: true,
      },
    },
  },
});

if (!area) {
  throw new BadRequestException('Khu vực không tồn tại.');
}

if (area.facilityId !== facilityId) {
  throw new BadRequestException(
    'Khu vực không thuộc cơ sở đã chọn.',
  );
}

if (!area.isActive || !area.facility.isActive) {
  throw new BadRequestException(
    'Khu vực hoặc cơ sở đã ngừng sử dụng.',
  );
}

    try {
      return await this.prisma.asset.create({
        data: {
          ...assetData,
          receiptDate: receiptDate
            ? new Date(receiptDate)
            : undefined,
          warrantyDate: warrantyDate
            ? new Date(warrantyDate)
            : undefined,
        },
        include: {
          group: true,
          area: {
            include: { facility: true },
          },
        },
      });
    } catch (error) {
      // Bảo vệ trường hợp hai yêu cầu đồng thời tạo cùng mã
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Mã tài sản đã tồn tại.');
      }

      throw error;
    }
  }

  // Cập nhật thông tin hồ sơ được phép chỉnh sửa
  async update(id: string, dto: UpdateAssetDto) {
    const existing = await this.prisma.asset.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy tài sản.');
    }

    // Chỉ cập nhật các trường hồ sơ cho phép.
    // Không dùng ...dto để tránh vô tình ghi đè trường quản lý.
    const data: Prisma.AssetUpdateInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.model !== undefined && { model: dto.model }),
      ...(dto.serial !== undefined && { serial: dto.serial }),
      ...(dto.brand !== undefined && { brand: dto.brand }),
      ...(dto.image !== undefined && { image: dto.image }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      ...(dto.receiptDate !== undefined && {
        receiptDate: dto.receiptDate
          ? new Date(dto.receiptDate)
          : null,
      }),
      ...(dto.warrantyDate !== undefined && {
        warrantyDate: dto.warrantyDate
          ? new Date(dto.warrantyDate)
          : null,
      }),
      ...(dto.purchaseValue !== undefined && {
        purchaseValue: new Prisma.Decimal(dto.purchaseValue),
      }),
    };

    return this.prisma.asset.update({
      where: { id },
      data,
      include: {
        group: true,
        area: {
          include: { facility: true },
        },
      },
    });
  }
  async findFiltered(query: FindAssetsQueryDto) {
  const {
    search,
    facilityId,
    areaId,
    groupId,
    managementStatus,
    condition,
    page = 1,
    limit = 10,
  } = query;

  const where: Prisma.AssetWhereInput = {
    ...(search?.trim()
      ? {
          OR: [
            { assetCode: { contains: search.trim(), mode: 'insensitive' } },
            { name: { contains: search.trim(), mode: 'insensitive' } },
            { brand: { contains: search.trim(), mode: 'insensitive' } },
            { serial: { contains: search.trim(), mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(groupId ? { groupId } : {}),
    ...(areaId ? { areaId } : {}),
    ...(facilityId ? { area: { facilityId } } : {}),
    ...(managementStatus ? { managementStatus } : {}),
    ...(condition ? { condition } : {}),
  };

  const [items, total] = await this.prisma.$transaction([
    this.prisma.asset.findMany({
      where,
      include: {
        group: true,
        area: { include: { facility: true } },
        assignedUser: true,
        assignedDept: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    this.prisma.asset.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
async changeCondition(
  assetId: string,
  dto: ChangeAssetConditionDto,
) {
  const reason = dto.reason.trim();

  if (!reason) {
    throw new BadRequestException('Lý do thay đổi không được để trống');
  }

  return this.prisma.$transaction(async (tx) => {
    const asset = await tx.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Không tìm thấy tài sản');
    }

    if (asset.condition === dto.condition) {
      throw new BadRequestException(
        'Tình trạng mới giống tình trạng hiện tại',
      );
    }

    const updated = await tx.asset.update({
      where: { id: assetId },
      data: {
        condition: dto.condition,
        version: { increment: 1 },
      },
    });

    await tx.assetHistory.create({
      data: {
        assetId: asset.id,
        actorId: dto.actorId,
        action: 'CHANGE_CONDITION',
        reason,
        beforeState: {
          condition: asset.condition,
          version: asset.version,
        },
        afterState: {
          condition: updated.condition,
          version: updated.version,
        },
      },
    });

    return {
      message: 'Cập nhật tình trạng và lưu lịch sử thành công',
      asset: updated,
    };
  });
}

  // A5: Ngừng theo dõi tài sản, giữ nguyên dữ liệu và lịch sử
  async deactivate(id: string, dto: DeactivateAssetDto) {
    const reason = dto.reason?.trim();

    if (!reason) {
      throw new BadRequestException(
        'Vui lòng nhập lý do ngừng theo dõi.',
      );
    }

    // Kiểm tra tài sản và lấy trạng thái trước khi thay đổi.
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      select: {
        id: true,
        assetCode: true,
        name: true,
        areaId: true,
        assignedUserId: true,
        assignedDeptId: true,
        managementStatus: true,
        condition: true,
        version: true,
      },
    });

    if (!asset) {
      throw new NotFoundException('Không tìm thấy tài sản.');
    }

    if (asset.managementStatus === 'INACTIVE') {
      throw new BadRequestException(
        'Tài sản đã ngừng theo dõi.',
      );
    }

    // Chặn nếu còn phiếu bàn giao, điều chuyển hoặc thu hồi ở trạng thái nháp.
    const pendingTicket = await this.prisma.ticket.findFirst({
      where: {
        assetId: id,
        status: 'DRAFT',
        type: {
          in: ['HANDOVER', 'TRANSFER', 'RECALL'],
        },
      },
      select: {
        ticketCode: true,
        type: true,
      },
    });

    if (pendingTicket) {
      throw new BadRequestException(
        `Không thể ngừng theo dõi vì phiếu ${pendingTicket.ticketCode} chưa hoàn tất.`,
      );
    }

    // Kiểm tra người thực hiện tồn tại.
    const actor = await this.prisma.user.findUnique({
      where: { id: dto.actorId },
      select: { id: true },
    });

    if (!actor) {
      throw new BadRequestException(
        'Người thực hiện không tồn tại.',
      );
    }

    // Mọi thay đổi được thực hiện trong cùng transaction.
    return this.prisma.$transaction(async (tx) => {
      // Kiểm tra lại trong transaction để hạn chế thao tác lặp.
      const current = await tx.asset.findUnique({
        where: { id },
        select: {
          managementStatus: true,
          version: true,
        },
      });

      if (!current) {
        throw new NotFoundException('Không tìm thấy tài sản.');
      }

      if (current.managementStatus === 'INACTIVE') {
        throw new BadRequestException(
          'Tài sản đã ngừng theo dõi.',
        );
      }

      // Chỉ đổi trạng thái và tăng version.
      // Không xóa người/bộ phận được giao, phiếu hay lịch sử.
      const updated = await tx.asset.update({
        where: { id },
        data: {
          managementStatus: 'INACTIVE',
          version: { increment: 1 },
        },
      });

      // Tạo phiếu ngừng theo dõi đã xác nhận.
      const ticket = await tx.ticket.create({
        data: {
          ticketCode: `DEACT-${randomUUID()}`,
          type: 'DEACTIVATE',
          status: 'CONFIRMED',
          assetId: id,
          fromAreaId: asset.areaId,
          fromUserId: asset.assignedUserId,
          fromDeptId: asset.assignedDeptId,
          fromStatus: asset.managementStatus,
          toAreaId: asset.areaId,
          toUserId: asset.assignedUserId,
          toDeptId: asset.assignedDeptId,
          toStatus: 'INACTIVE',
          reason,
          creatorId: dto.actorId,
          confirmerId: dto.actorId,
          confirmedAt: new Date(),
        },
      });

      // Lưu trạng thái trước và sau vào lịch sử.
      await tx.assetHistory.create({
        data: {
          assetId: id,
          actorId: dto.actorId,
          action: 'DEACTIVATE',
          reason,
          beforeState: {
            managementStatus: asset.managementStatus,
            condition: asset.condition,
            areaId: asset.areaId,
            assignedUserId: asset.assignedUserId,
            assignedDeptId: asset.assignedDeptId,
            version: current.version,
          },
          afterState: {
            managementStatus: updated.managementStatus,
            condition: updated.condition,
            areaId: updated.areaId,
            assignedUserId: updated.assignedUserId,
            assignedDeptId: updated.assignedDeptId,
            version: updated.version,
          },
        },
      });

      return {
        message: 'Đã ngừng theo dõi tài sản và lưu lịch sử.',
        ticket,
        asset: updated,
      };
    });
  }

}

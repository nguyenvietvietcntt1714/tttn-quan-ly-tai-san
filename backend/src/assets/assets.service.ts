import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  Asset,
  ManagementStatus,
  AssetCondition,
} from '@prisma/client';
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
        category: true,
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
        category: true,
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

  // Tạo tài sản mới
  async create(dto: CreateAssetDto) {
    const {
      facilityId,
      categoryId,
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
          categoryId,
          receiptDate: receiptDate
            ? new Date(receiptDate)
            : undefined,
          warrantyDate: warrantyDate
            ? new Date(warrantyDate)
            : undefined,
        },
        include: {
          group: true,
          category: true,
          area: {
            include: { facility: true },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Mã tài sản đã tồn tại.');
      }
      throw error;
    }
  }

  // Cập nhật thông tin hồ sơ tài sản
  async update(id: string, dto: UpdateAssetDto) {
    const existing = await this.prisma.asset.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy tài sản.');
    }

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
        category: true,
        area: {
          include: { facility: true },
        },
      },
    });
  }

  // Xóa tài sản theo ID
  async remove(id: string): Promise<Asset> {
    const existing = await this.prisma.asset.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy tài sản.');
    }

    return this.prisma.asset.delete({
      where: { id },
    });
  }

  // Tìm kiếm, lọc và phân trang tài sản
  async findFiltered(query: FindAssetsQueryDto) {
    const { page = 1, limit = 10 } = query;

    const where = this.buildAssetWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where,
        include: {
          group: true,
          category: true,
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

  // Thay đổi tình trạng tài sản và ghi lịch sử
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

  // Ngừng theo dõi tài sản, giữ nguyên dữ liệu và lịch sử
  async deactivate(id: string, dto: DeactivateAssetDto) {
    const reason = dto.reason?.trim();

    if (!reason) {
      throw new BadRequestException(
        'Vui lòng nhập lý do ngừng theo dõi.',
      );
    }

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

    const actor = await this.prisma.user.findUnique({
      where: { id: dto.actorId },
      select: { id: true },
    });

    if (!actor) {
      throw new BadRequestException(
        'Người thực hiện không tồn tại.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
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

      const updated = await tx.asset.update({
        where: { id },
        data: {
          managementStatus: 'INACTIVE',
          version: { increment: 1 },
        },
      });

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

  // Bộ lọc dùng chung cho danh sách, phân trang và xuất CSV
  private buildAssetWhere(query: FindAssetsQueryDto): Prisma.AssetWhereInput {
    const {
      search,
      facilityId,
      areaId,
      groupId,
      managementStatus,
      condition,
    } = query;

    return {
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
  }

  // Xuất CSV toàn bộ kết quả đang lọc (không phân trang), kèm BOM UTF-8 cho Excel
  async exportCsv(query: FindAssetsQueryDto): Promise<string> {
    const where = this.buildAssetWhere(query);

    const assets = await this.prisma.asset.findMany({
      where,
      include: {
        group: true,
        category: true,
        area: { include: { facility: true } },
        assignedUser: {
          select: { username: true, fullName: true },
        },
        assignedDept: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const statusLabel: Record<ManagementStatus, string> = {
      AVAILABLE: 'Sẵn sàng',
      IN_USE: 'Đang sử dụng',
      INACTIVE: 'Ngừng theo dõi',
    };

    const conditionLabel: Record<AssetCondition, string> = {
      GOOD: 'Tốt',
      NEEDS_INSPECTION: 'Cần kiểm tra',
      BROKEN: 'Hỏng',
    };

    const header = [
      'Mã tài sản',
      'Tên tài sản',
      'Nhóm',
      'Danh mục',
      'Cơ sở',
      'Khu vực',
      'Bên chịu trách nhiệm',
      'Trạng thái quản lý',
      'Tình trạng',
      'Model',
      'Serial',
      'Hãng',
      'Ngày tiếp nhận',
      'Hạn bảo hành',
      'Giá trị mua',
      'Ghi chú',
    ];

    const rows = assets.map((a) => [
      a.assetCode,
      a.name,
      a.group?.name ?? '',
      a.category?.name ?? '',
      a.area?.facility?.name ?? '',
      a.area?.name ?? '',
      a.assignedUser?.fullName ?? a.assignedDept?.name ?? '',
      statusLabel[a.managementStatus],
      conditionLabel[a.condition],
      a.model ?? '',
      a.serial ?? '',
      a.brand ?? '',
      a.receiptDate ? a.receiptDate.toISOString().slice(0, 10) : '',
      a.warrantyDate ? a.warrantyDate.toISOString().slice(0, 10) : '',
      a.purchaseValue !== null && a.purchaseValue !== undefined
        ? String(a.purchaseValue)
        : '',
      a.notes ?? '',
    ]);

    const escape = (value: string) =>
      /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

    const lines = [header, ...rows]
      .map((row) => row.map((cell) => escape(String(cell))).join(','))
      .join('\r\n');

    return `\uFEFF${lines}`;
  }
}
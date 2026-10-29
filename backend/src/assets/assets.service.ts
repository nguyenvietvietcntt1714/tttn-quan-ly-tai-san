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
      select: { id: true },
    });

    if (!group) {
      throw new BadRequestException('Nhóm tài sản không tồn tại.');
    }

    // Kiểm tra khu vực có tồn tại và thuộc đúng cơ sở
    const area = await this.prisma.area.findUnique({
      where: { id: dto.areaId },
      select: {
        id: true,
        facilityId: true,
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
}
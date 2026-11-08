import { Injectable } from '@nestjs/common';
import { Prisma, Asset } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AssetsService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<Asset[]> {
        return this.prisma.asset.findMany({
            include: { category: true, group: true, area: true },
        });
    }

    async findOne(id: string): Promise<Asset | null> {
        return this.prisma.asset.findUnique({
            where: { id },
            include: { category: true, group: true, area: true },
        });
    }

    async create(data: Prisma.AssetCreateInput): Promise<Asset> {
        return this.prisma.asset.create({
            data,
        });
    }

    async update(id: string, data: Prisma.AssetUpdateInput): Promise<Asset> {
        return this.prisma.asset.update({
            where: { id },
            data,
        });
    }

    async remove(id: string): Promise<Asset> {
        return this.prisma.asset.delete({
            where: { id },
        });
    }
}
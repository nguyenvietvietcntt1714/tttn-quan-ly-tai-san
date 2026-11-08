import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Asset } from '@prisma/client';

@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Get()
    async findAll(): Promise<Asset[]> {
        return this.assetsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Asset | null> {
        return this.assetsService.findOne(id);
    }

    @Post()
    async create(
        @Body()
        body: {
            assetCode: string;
            name: string;
            groupId: string;
            areaId: string;
            categoryId: number;
            serial?: string;
            status?: string;
        },
    ): Promise<Asset> {
        return this.assetsService.create({
            assetCode: body.assetCode,
            name: body.name,
            serial: body.serial, // Khớp với trường 'serial' trong schema
            group: { connect: { id: body.groupId } },
            area: { connect: { id: body.areaId } },
            category: { connect: { id: body.categoryId } },
        });
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body()
        body: {
            name?: string;
            serial?: string;
            categoryId?: number;
        },
    ): Promise<Asset> {
        return this.assetsService.update(id, {
            name: body.name,
            serial: body.serial, // Khớp với trường 'serial' trong schema
            category: body.categoryId ? { connect: { id: body.categoryId } } : undefined,
        });
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<Asset> {
        return this.assetsService.remove(id);
    }
}
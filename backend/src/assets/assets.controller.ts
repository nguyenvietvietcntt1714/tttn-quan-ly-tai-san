import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Asset } from '@prisma/client';
import type { Response } from 'express';

import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { FindAssetsQueryDto } from './dto/find-assets-query.dto';
import { ChangeAssetConditionDto } from './dto/change-asset-condition.dto';
import { DeactivateAssetDto } from './dto/deactivate-asset.dto';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // GET /assets: Danh sách, tìm kiếm, lọc và phân trang
  @Get()
  @ApiOperation({ summary: 'Tìm kiếm và lọc tài sản' })
  findAll(@Query() query: FindAssetsQueryDto) {
    return this.assetsService.findFiltered(query);
  }

  // GET /assets/export: Xuất CSV toàn bộ kết quả đang lọc (phải trước route :id)
  @Get('export')
  @ApiOperation({ summary: 'Xuất CSV toàn bộ kết quả lọc hiện tại' })
  @Header(
    'Content-Type',
    'text/csv; charset=utf-8',
  )
  async exportCsv(
    @Query() query: FindAssetsQueryDto,
    @Res() res: Response,
  ) {
    const csv = await this.assetsService.exportCsv(query);
    const filename = `tai-san-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.send(csv);
  }

  // GET /assets/:id: Xem chi tiết tài sản
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết tài sản' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.findOne(id);
  }

  // POST /assets: Tạo tài sản
  @Post()
  @ApiOperation({ summary: 'Tạo tài sản' })
  create(@Body() dto: CreateAssetDto) {
    return this.assetsService.create(dto);
  }

  // PATCH /assets/:id: Cập nhật hồ sơ tài sản
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật hồ sơ tài sản' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetDto,
  ) {
    return this.assetsService.update(id, dto);
  }

  // PATCH /assets/:id/condition: Thay đổi tình trạng và lưu lịch sử
  @Patch(':id/condition')
  @ApiOperation({
    summary: 'Thay đổi tình trạng tài sản và lưu lịch sử',
  })
  changeCondition(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeAssetConditionDto,
  ) {
    return this.assetsService.changeCondition(id, dto);
  }
  
  // PATCH /assets/:id/deactivate: Ngừng theo dõi tài sản
  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Ngừng theo dõi tài sản và lưu lịch sử',
  })
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeactivateAssetDto,
  ) {
    return this.assetsService.deactivate(id, dto);
  }

  // DELETE /assets/:id: Xóa tài sản (nếu service hỗ trợ)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tài sản' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<Asset> {
    return this.assetsService.remove(id);
  }
}
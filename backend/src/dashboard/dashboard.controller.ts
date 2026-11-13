import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // GET /dashboard/stats: Số liệu tổng quan cho dashboard
  @Get('stats')
  @ApiOperation({ summary: 'Số liệu tổng quan dashboard (tài sản, phiếu, hoạt động gần đây)' })
  getStats() {
    return this.dashboardService.getStats();
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Thống kê tổng quan cho dashboard: tài sản, phiếu và hoạt động gần đây
  async getStats() {
    const [assetStatusRows, assetConditionRows, ticketStatusRows, ticketTypeRows, recentHistory] =
      await Promise.all([
        this.prisma.asset.groupBy({
          by: ['managementStatus'],
          _count: { _all: true },
        }),
        this.prisma.asset.groupBy({
          by: ['condition'],
          _count: { _all: true },
        }),
        this.prisma.ticket.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.ticket.groupBy({
          by: ['type'],
          _count: { _all: true },
        }),
        this.prisma.assetHistory.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            assetId: true,
            action: true,
            reason: true,
            createdAt: true,
            actorId: true,
          },
        }),
      ]);

    const assetStatusMap = Object.fromEntries(
      assetStatusRows.map((r) => [r.managementStatus, r._count._all]),
    );
    const conditionMap = Object.fromEntries(
      assetConditionRows.map((r) => [r.condition, r._count._all]),
    );
    const ticketStatusMap = Object.fromEntries(
      ticketStatusRows.map((r) => [r.status, r._count._all]),
    );
    const ticketTypeMap = Object.fromEntries(
      ticketTypeRows.map((r) => [r.type, r._count._all]),
    );

    // Ghép tên tài sản và tên người thực hiện cho danh sách hoạt động gần đây
    const assetIds = [...new Set(recentHistory.map((h) => h.assetId))];
    const actorIds = [
      ...new Set(recentHistory.map((h) => h.actorId).filter((id): id is string => Boolean(id))),
    ];

    const [assets, actors] = await Promise.all([
      this.prisma.asset.findMany({
        where: { id: { in: assetIds } },
        select: { id: true, assetCode: true, name: true },
      }),
      this.prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, username: true, fullName: true },
      }),
    ]);

    const assetMap = new Map(assets.map((a) => [a.id, a]));
    const actorMap = new Map(actors.map((u) => [u.id, u]));

    const recentActivity = recentHistory.map((h) => ({
      id: h.id,
      action: h.action,
      reason: h.reason,
      createdAt: h.createdAt,
      assetCode: assetMap.get(h.assetId)?.assetCode ?? null,
      assetName: assetMap.get(h.assetId)?.name ?? null,
      actorName:
        actorMap.get(h.actorId ?? '')?.fullName ??
        actorMap.get(h.actorId ?? '')?.username ??
        null,
    }));

    return {
      assets: {
        total: Object.values(assetStatusMap).reduce((a, b) => a + b, 0),
        byManagementStatus: assetStatusMap,
        byCondition: conditionMap,
      },
      tickets: {
        total: Object.values(ticketStatusMap).reduce((a, b) => a + b, 0),
        byStatus: ticketStatusMap,
        byType: ticketTypeMap,
      },
      recentActivity,
    };
  }
}

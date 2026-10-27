import { PrismaService } from '../prisma/prisma.service';
export declare class TicketsService {
    private prisma;
    constructor(prisma: PrismaService);
    confirmTicket(ticketId: string, managerId: string): Promise<{
        success: boolean;
        message: string;
        confirmedTicket: {
            id: string;
            ticketCode: string;
            type: import(".prisma/client").$Enums.TicketType;
            status: import(".prisma/client").$Enums.TicketStatus;
            assetId: string;
            fromAreaId: string | null;
            fromUserId: string | null;
            fromDeptId: string | null;
            fromStatus: import(".prisma/client").$Enums.ManagementStatus | null;
            toAreaId: string | null;
            toUserId: string | null;
            toDeptId: string | null;
            toStatus: import(".prisma/client").$Enums.ManagementStatus | null;
            reason: string;
            creatorId: string;
            confirmerId: string | null;
            confirmedAt: Date | null;
            referenceTicketId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}

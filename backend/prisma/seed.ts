import { PrismaClient, Area, Asset, AssetCondition, ManagementStatus, TicketStatus, TicketType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Đang khởi tạo dữ liệu mẫu cho hệ thống Quản Lý Tài Sản...');

    // 0. Tạo Phòng ban (Department)
    const deptNames = [
        'Phòng Kỹ Thuật - CNTT',
        'Phòng Hành Chính - Nhân Sự',
        'Phòng Tài Chính - Kế Toán',
        'Phòng Vận Hành & Bảo Trì',
    ];
    const departments = await Promise.all(
        deptNames.map((name) =>
            prisma.department.upsert({
                where: { name },
                update: {},
                create: { name, isActive: true },
            }),
        ),
    );

    // 1. Tạo người dùng mẫu
    const hashedPassword = await bcrypt.hash('123456', 10);

    const manager = await prisma.user.upsert({
        where: { username: 'manager' },
        update: {
            fullName: 'Nguyễn Văn Quản Lý',
            role: 'MANAGER',
            departmentId: departments[1].id,
        },
        create: {
            username: 'manager',
            fullName: 'Nguyễn Văn Quản Lý',
            role: 'MANAGER',
            password: hashedPassword,
            email: 'manager@example.com',
            departmentId: departments[1].id,
        },
    });

    const users = await Promise.all([
        prisma.user.upsert({
            where: { username: 'user1' },
            update: { departmentId: departments[0].id },
            create: {
                username: 'user1',
                fullName: 'Trần Văn Sử Dụng',
                role: 'USER',
                password: hashedPassword,
                email: 'user1@example.com',
                departmentId: departments[0].id,
            },
        }),
        prisma.user.upsert({
            where: { username: 'user2' },
            update: { departmentId: departments[2].id },
            create: {
                username: 'user2',
                fullName: 'Phạm Thị Hoa',
                role: 'USER',
                password: hashedPassword,
                email: 'user2@example.com',
                departmentId: departments[2].id,
            },
        }),
        prisma.user.upsert({
            where: { username: 'user3' },
            update: { departmentId: departments[3].id },
            create: {
                username: 'user3',
                fullName: 'Hoàng Văn Nam',
                role: 'USER',
                password: hashedPassword,
                email: 'user3@example.com',
                departmentId: departments[3].id,
            },
        }),
    ]);

    console.log(`✅ Đã tạo thành công ${users.length + 1} tài khoản người dùng và ${departments.length} phòng ban.`);

    // 2. Khởi tạo Categories (Danh mục)
    const categoryNames = ['Thiết bị IT', 'Nội thất văn phòng', 'Thiết bị phòng họp', 'Công cụ dụng cụ'];
    const categories = await Promise.all(
        categoryNames.map((name) =>
            prisma.category.upsert({
                where: { name },
                update: {},
                create: { name, description: `Danh mục chuyên dụng cho ${name}` },
            }),
        ),
    );

    // 3. Khởi tạo Facility (Cơ sở) và Area (Khu vực)
    const facility = await prisma.facility.upsert({
        where: { name: 'Cơ sở chính Hà Nội' },
        update: {},
        create: { name: 'Cơ sở chính Hà Nội', isActive: true },
    });

    const areaDefs = [
        { id: '11111111-1111-4111-8111-111111111101', name: 'Tầng 3 (Phòng Dev)' },
        { id: '11111111-1111-4111-8111-111111111102', name: 'Tầng 2 (Phòng Họp A)' },
        { id: '11111111-1111-4111-8111-111111111103', name: 'Tầng 4 (Khu làm việc)' },
        { id: '11111111-1111-4111-8111-111111111104', name: 'Kho thiết bị trung tâm' },
    ];

    const areas: Area[] = [];
    for (const def of areaDefs) {
        const existingArea = await prisma.area.findFirst({
            where: { name: def.name, facilityId: facility.id },
        });
        if (existingArea) {
            areas.push(existingArea);
        } else {
            const created = await prisma.area.create({
                data: {
                    id: def.id,
                    name: def.name,
                    facilityId: facility.id,
                    isActive: true,
                },
            });
            areas.push(created);
        }
    }

    // 4. Khởi tạo AssetGroup (Nhóm tài sản)
    const groupData = [
        { code: 'G-IT', name: 'Nhóm thiết bị CNTT' },
        { code: 'G-OFF', name: 'Nhóm nội thất văn phòng' },
        { code: 'G-MEET', name: 'Nhóm thiết bị hội họp' },
    ];

    const groups = await Promise.all(
        groupData.map((g) =>
            prisma.assetGroup.upsert({
                where: { code: g.code },
                update: {},
                create: g,
            }),
        ),
    );

    // 5. Danh sách 60 Tài sản mẫu chuẩn thực tế
    const assetTemplates = [
        { name: 'Laptop Dell Latitude 5420', brand: 'Dell', model: 'Latitude 5420' },
        { name: 'Laptop Lenovo ThinkPad T14', brand: 'Lenovo', model: 'ThinkPad T14 Gen 3' },
        { name: 'MacBook Pro 14 inch M2', brand: 'Apple', model: 'MacBook Pro M2 2023' },
        { name: 'Màn hình ViewSonic 27 inch', brand: 'ViewSonic', model: 'VA2732-H' },
        { name: 'Màn hình Dell UltraSharp 24"', brand: 'Dell', model: 'U2422H' },
        { name: 'Ghế công thái học Ergonomic', brand: 'Sihoo', model: 'M57 Pro' },
        { name: 'Bàn làm việc thông minh nâng hạ', brand: 'Epione', model: 'SmartDesk Pro' },
        { name: 'Máy chiếu Epson EB-FH06', brand: 'Epson', model: 'EB-FH06 Full HD' },
        { name: 'Loa hội nghị Jabra Speak 510', brand: 'Jabra', model: 'Speak 510 MS' },
        { name: 'Ổ cứng di động SSD Samsung T7 1TB', brand: 'Samsung', model: 'MU-PC1T0T' },
        { name: 'Bộ phát Wi-Fi Aruba AP-305', brand: 'HP Aruba', model: 'AP-305' },
        { name: 'Bàn phím cơ Keychron K2', brand: 'Keychron', model: 'K2 V2 Hot-swappable' },
        { name: 'Chuột không dây Logitech MX Master 3S', brand: 'Logitech', model: 'MX Master 3S' },
        { name: 'Tai nghe chống ồn Sony WH-1000XM4', brand: 'Sony', model: 'WH-1000XM4' },
        { name: 'Máy in laser đa chức năng Canon', brand: 'Canon', model: 'MF244dw' },
    ];

    const statuses: ManagementStatus[] = [
        ManagementStatus.AVAILABLE,
        ManagementStatus.IN_USE,
        ManagementStatus.AVAILABLE,
        ManagementStatus.IN_USE,
        ManagementStatus.INACTIVE,
    ];
    const conditions: AssetCondition[] = [
        AssetCondition.GOOD,
        AssetCondition.GOOD,
        AssetCondition.GOOD,
        AssetCondition.NEEDS_INSPECTION,
        AssetCondition.BROKEN,
    ];

    const createdAssets: Asset[] = [];
    for (let i = 1; i <= 60; i++) {
        const code = `AST-${i.toString().padStart(3, '0')}`;
        const tpl = assetTemplates[(i - 1) % assetTemplates.length];
        const catIndex = i % categories.length;
        const locIndex = i % areas.length;
        const groupIndex = i % groups.length;
        const status = statuses[i % statuses.length];
        const condition = conditions[i % conditions.length];
        const assignedUser = status === ManagementStatus.IN_USE ? users[i % users.length] : null;

        const asset = await prisma.asset.upsert({
            where: { assetCode: code },
            update: {
                brand: tpl.brand,
                model: tpl.model,
                serial: `SN-2026-${i.toString().padStart(4, '0')}`,
                managementStatus: status,
                condition: condition,
                assignedUserId: assignedUser ? assignedUser.id : null,
                assignedDeptId: assignedUser ? assignedUser.departmentId : null,
            },
            create: {
                assetCode: code,
                name: `${tpl.name} #${i}`,
                brand: tpl.brand,
                model: tpl.model,
                serial: `SN-2026-${i.toString().padStart(4, '0')}`,
                categoryId: categories[catIndex].id,
                groupId: groups[groupIndex].id,
                areaId: areas[locIndex].id,
                managementStatus: status,
                condition: condition,
                assignedUserId: assignedUser ? assignedUser.id : null,
                assignedDeptId: assignedUser ? assignedUser.departmentId : null,
                receiptDate: new Date(2026, (i % 6), (i % 25) + 1),
                warrantyDate: new Date(2028, (i % 6), (i % 25) + 1),
                purchaseValue: 5000000 + i * 250000,
                notes: 'Tài sản khởi tạo trong danh mục thiết bị công ty',
            },
        });
        createdAssets.push(asset);
    }

    console.log(`✅ Đã tạo thành công ${createdAssets.length} tài sản mẫu vào Database!`);

    // 6. Khởi tạo Phiếu nghiệp vụ (Tickets) và Lịch sử biến động (AssetHistory) mẫu
    const existingTicketsCount = await prisma.ticket.count();
    if (existingTicketsCount === 0 && createdAssets.length >= 10) {
        const inUseAssets = createdAssets.filter((a) => a.managementStatus === ManagementStatus.IN_USE);
        const availableAssets = createdAssets.filter((a) => a.managementStatus === ManagementStatus.AVAILABLE);

        // Phiếu 1: Đã hoàn thành bàn giao cho user1
        if (inUseAssets[0]) {
            const t1 = await prisma.ticket.create({
                data: {
                    ticketCode: 'TCK-20261101-101',
                    type: TicketType.HANDOVER,
                    status: TicketStatus.CONFIRMED,
                    assetId: inUseAssets[0].id,
                    fromAreaId: areas[3].id,
                    fromStatus: ManagementStatus.AVAILABLE,
                    toAreaId: inUseAssets[0].areaId,
                    toUserId: inUseAssets[0].assignedUserId,
                    toStatus: ManagementStatus.IN_USE,
                    reason: 'Bàn giao thiết bị làm việc cho nhân sự mới nhận việc',
                    creatorId: manager.id,
                    confirmerId: manager.id,
                    confirmedAt: new Date(),
                },
            });
            await prisma.assetHistory.create({
                data: {
                    assetId: inUseAssets[0].id,
                    actorId: manager.id,
                    action: 'HOÀN THÀNH PHIẾU: HANDOVER',
                    reason: t1.reason,
                    beforeState: { ticketCode: t1.ticketCode, managementStatus: 'AVAILABLE', assignedUserId: null },
                    afterState: { ticketCode: t1.ticketCode, managementStatus: 'IN_USE', assignedUserId: inUseAssets[0].assignedUserId },
                },
            });
        }

        // Phiếu 2: Đã hoàn thành điều chuyển
        if (inUseAssets[1]) {
            const t2 = await prisma.ticket.create({
                data: {
                    ticketCode: 'TCK-20261105-102',
                    type: TicketType.TRANSFER,
                    status: TicketStatus.CONFIRMED,
                    assetId: inUseAssets[1].id,
                    fromAreaId: areas[0].id,
                    fromUserId: users[0].id,
                    fromStatus: ManagementStatus.IN_USE,
                    toAreaId: inUseAssets[1].areaId,
                    toUserId: inUseAssets[1].assignedUserId,
                    toStatus: ManagementStatus.IN_USE,
                    reason: 'Điều chuyển thiết bị phục vụ dự án quý IV',
                    creatorId: manager.id,
                    confirmerId: manager.id,
                    confirmedAt: new Date(),
                },
            });
            await prisma.assetHistory.create({
                data: {
                    assetId: inUseAssets[1].id,
                    actorId: manager.id,
                    action: 'HOÀN THÀNH PHIẾU: TRANSFER',
                    reason: t2.reason,
                    beforeState: { ticketCode: t2.ticketCode, managementStatus: 'IN_USE', assignedUserId: users[0].id },
                    afterState: { ticketCode: t2.ticketCode, managementStatus: 'IN_USE', assignedUserId: inUseAssets[1].assignedUserId },
                },
            });
        }

        // Phiếu 3: Đã hoàn thành thu hồi về kho
        if (availableAssets[0]) {
            const t3 = await prisma.ticket.create({
                data: {
                    ticketCode: 'TCK-20261110-103',
                    type: TicketType.RECALL,
                    status: TicketStatus.CONFIRMED,
                    assetId: availableAssets[0].id,
                    fromAreaId: areas[0].id,
                    fromUserId: users[1].id,
                    fromStatus: ManagementStatus.IN_USE,
                    toAreaId: availableAssets[0].areaId,
                    toUserId: null,
                    toStatus: ManagementStatus.AVAILABLE,
                    reason: 'Thu hồi thiết bị về kho sau khi kết thúc đợt công tác',
                    creatorId: manager.id,
                    confirmerId: manager.id,
                    confirmedAt: new Date(),
                },
            });
            await prisma.assetHistory.create({
                data: {
                    assetId: availableAssets[0].id,
                    actorId: manager.id,
                    action: 'HOÀN THÀNH PHIẾU: RECALL',
                    reason: t3.reason,
                    beforeState: { ticketCode: t3.ticketCode, managementStatus: 'IN_USE', assignedUserId: users[1].id },
                    afterState: { ticketCode: t3.ticketCode, managementStatus: 'AVAILABLE', assignedUserId: null },
                },
            });
        }

        // Phiếu 4: Phiếu đang chờ duyệt (DRAFT - HANDOVER) để thầy bấm thử Xác nhận / Hủy
        if (availableAssets[1]) {
            const t4 = await prisma.ticket.create({
                data: {
                    ticketCode: 'TCK-20261115-104',
                    type: TicketType.HANDOVER,
                    status: TicketStatus.DRAFT,
                    assetId: availableAssets[1].id,
                    fromAreaId: availableAssets[1].areaId,
                    fromStatus: ManagementStatus.AVAILABLE,
                    toAreaId: areas[0].id,
                    toUserId: users[0].id,
                    toStatus: ManagementStatus.IN_USE,
                    reason: 'Cấp phát bổ sung màn hình làm việc cho Trần Văn Sử Dụng',
                    creatorId: manager.id,
                },
            });
            await prisma.assetHistory.create({
                data: {
                    assetId: availableAssets[1].id,
                    actorId: manager.id,
                    action: 'TẠO PHIẾU: HANDOVER',
                    reason: t4.reason,
                    beforeState: { ticketCode: t4.ticketCode, ticketStatus: 'DRAFT', managementStatus: 'AVAILABLE' },
                    afterState: { ticketCode: t4.ticketCode, ticketStatus: 'DRAFT', expectedStatus: 'IN_USE', toUserId: users[0].id },
                },
            });
        }

        // Phiếu 5: Phiếu đang chờ duyệt (DRAFT - RECALL) để thầy bấm thử Thu hồi
        if (inUseAssets[2]) {
            const t5 = await prisma.ticket.create({
                data: {
                    ticketCode: 'TCK-20261115-105',
                    type: TicketType.RECALL,
                    status: TicketStatus.DRAFT,
                    assetId: inUseAssets[2].id,
                    fromAreaId: inUseAssets[2].areaId,
                    fromUserId: inUseAssets[2].assignedUserId,
                    fromStatus: ManagementStatus.IN_USE,
                    toAreaId: areas[3].id,
                    toUserId: null,
                    toStatus: ManagementStatus.AVAILABLE,
                    reason: 'Thu hồi thiết bị để bảo dưỡng định kỳ tại kho trung tâm',
                    creatorId: manager.id,
                },
            });
            await prisma.assetHistory.create({
                data: {
                    assetId: inUseAssets[2].id,
                    actorId: manager.id,
                    action: 'TẠO PHIẾU: RECALL',
                    reason: t5.reason,
                    beforeState: { ticketCode: t5.ticketCode, ticketStatus: 'DRAFT', managementStatus: 'IN_USE' },
                    afterState: { ticketCode: t5.ticketCode, ticketStatus: 'DRAFT', expectedStatus: 'AVAILABLE' },
                },
            });
        }

        // Phiếu 6: Phiếu đã hủy (CANCELLED)
        if (availableAssets[2]) {
            const t6 = await prisma.ticket.create({
                data: {
                    ticketCode: 'TCK-20261112-106',
                    type: TicketType.HANDOVER,
                    status: TicketStatus.CANCELLED,
                    assetId: availableAssets[2].id,
                    fromAreaId: availableAssets[2].areaId,
                    fromStatus: ManagementStatus.AVAILABLE,
                    toAreaId: areas[2].id,
                    toUserId: users[2].id,
                    toStatus: ManagementStatus.IN_USE,
                    reason: 'Phiếu tạo nhầm thiết bị, đã hủy theo yêu cầu bộ phận',
                    creatorId: manager.id,
                    confirmerId: manager.id,
                },
            });
            await prisma.assetHistory.create({
                data: {
                    assetId: availableAssets[2].id,
                    actorId: manager.id,
                    action: 'HỦY PHIẾU: HANDOVER',
                    reason: `Hủy phiếu ${t6.ticketCode} (${t6.reason})`,
                    beforeState: { ticketCode: t6.ticketCode, ticketStatus: 'DRAFT' },
                    afterState: { ticketCode: t6.ticketCode, ticketStatus: 'CANCELLED' },
                },
            });
        }

        console.log('✅ Đã tạo thành công 6 phiếu nghiệp vụ và lịch sử biến động mẫu!');
    }
}

main()
    .catch((e) => {
        console.error('❌ Lỗi khi chạy Seeder:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

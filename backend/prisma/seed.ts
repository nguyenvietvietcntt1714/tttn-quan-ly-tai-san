import { PrismaClient, AssetCondition, ManagementStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Đang khởi tạo dữ liệu mẫu cho hệ thống Quản Lý Tài Sản...');

    // 1. Tạo người dùng mẫu
    const hashedPassword = await bcrypt.hash('123456', 10);

    const manager = await prisma.user.upsert({
        where: { username: 'manager' },
        update: {},
        create: {
            username: 'manager',
            fullName: 'Nguyễn Văn Quản Lý',
            role: 'MANAGER',
            password: hashedPassword,
            email: 'manager@example.com'
        },
    });

    const users = await Promise.all([
        prisma.user.upsert({
            where: { username: 'user1' },
            update: {},
            create: { username: 'user1', fullName: 'Trần Văn Sử Dụng', role: 'USER', password: hashedPassword, email: 'user1@example.com' },
        }),
        prisma.user.upsert({
            where: { username: 'user2' },
            update: {},
            create: { username: 'user2', fullName: 'Phạm Thị Hoa', role: 'USER', password: hashedPassword, email: 'user2@example.com' },
        }),
        prisma.user.upsert({
            where: { username: 'user3' },
            update: {},
            create: { username: 'user3', fullName: 'Hoàng Văn Nam', role: 'USER', password: hashedPassword, email: 'user3@example.com' },
        }),
    ]);

    console.log(`✅ Đã tạo thành công ${users.length + 1} tài khoản người dùng.`);

    // 2. Khởi tạo Categories (Danh mục)
    const categoryNames = ['Thiết bị IT', 'Nội thất văn phòng', 'Thiết bị phòng họp', 'Công cụ dụng cụ'];
    const categories = await Promise.all(
        categoryNames.map((name) =>
            prisma.category.upsert({
                where: { name },
                update: {},
                create: { name, description: `Danh mục chuyên dụng cho ${name}` },
            })
        )
    );

    // 3. Khởi tạo Facility (Cơ sở) và Area (Khu vực)
    const facility = await prisma.facility.upsert({
        where: { name: 'Cơ sở chính Hà Nội' },
        update: {},
        create: { name: 'Cơ sở chính Hà Nội' },
    });

    const areaNames = [
        'Tầng 3 (Phòng Dev)',
        'Tầng 2 (Phòng Họp A)',
        'Tầng 4 (Khu làm việc)',
        'Kho thiết bị trung tâm',
    ];

    const areas = await Promise.all(
        areaNames.map((name) =>
            prisma.area.upsert({
                where: { id: `area-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` }, // Tạo định danh ổn định hoặc dùng create nếu không cần strict id
                update: {},
                create: {
                    id: `area-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                    name,
                    facilityId: facility.id,
                },
            }).catch(async () => {
                // Fallback nếu trùng lặp id hoặc dùng findFirst
                return prisma.area.findFirst({ where: { name, facilityId: facility.id } }) as any;
            })
        )
    );

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
            })
        )
    );

    // 5. Danh sách 60 Tài sản mẫu chuẩn thực tế
    const assetNames = [
        'Laptop Dell Latitude 5420', 'Laptop Lenovo ThinkPad T14', 'MacBook Pro 14 inch M2',
        'Màn hình ViewSonic 27 inch', 'Màn hình Dell UltraSharp 24"', 'Ghế công thái học Ergonomic',
        'Bàn làm việc thông minh nâng hạ', 'Máy chiếu Epson EB-FH06', 'Loa hội nghị Jabra Speak 510',
        'Ổ cứng di động SSD Samsung T7 1TB', 'Bộ phát Wi-Fi Aruba AP-305', 'Bàn phím cơ Keychron K2',
        'Chuột không dây Logitech MX Master 3S', 'Tai nghe chống ồn Sony WH-1000XM4', 'Máy in laser đa chức năng Canon'
    ];

    // Khớp chính xác với enum ManagementStatus và AssetCondition trong schema.prisma
    const statuses: ManagementStatus[] = [ManagementStatus.AVAILABLE, ManagementStatus.IN_USE, ManagementStatus.INACTIVE];
    const conditions: AssetCondition[] = [AssetCondition.GOOD, AssetCondition.NEEDS_INSPECTION, AssetCondition.BROKEN];

let assetCount = 0;
    for (let i = 1; i <= 60; i++) {
        const code = `AST-${i.toString().padStart(3, '0')}`;
        const nameIndex = (i - 1) % assetNames.length;
        const catIndex = i % categories.length;
        const locIndex = i % areas.length;
        const groupIndex = i % groups.length;
        const statusIndex = i % statuses.length;
        const condIndex = i % conditions.length;

        await prisma.asset.upsert({
            where: { assetCode: code },
            update: {},
            create: {
                assetCode: code,
                name: `${assetNames[nameIndex]} #${i}`,
                categoryId: categories[catIndex].id, // Gán trực tiếp ID danh mục (số)
                groupId: groups[groupIndex].id,       // Gán trực tiếp ID nhóm tài sản
                areaId: areas[locIndex].id,           // Gán trực tiếp ID khu vực
                managementStatus: statuses[statusIndex],
                condition: conditions[condIndex],
                assignedUserId: statuses[statusIndex] === ManagementStatus.IN_USE ? users[i % users.length].id : null,
                purchaseValue: 5000000 + (i * 250000),
            },
        });
        assetCount++;
    }

    console.log(`✅ Đã tạo thành công ${assetCount} tài sản mẫu vào Database!`);
}

main()
    .catch((e) => {
        console.error('❌ Lỗi khi chạy Seeder:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
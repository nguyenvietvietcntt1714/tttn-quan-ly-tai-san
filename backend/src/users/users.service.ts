import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
                email: true,
                departmentId: true,
            },
        });
    }

    async create(data: { username: string; fullName: string; role: string; email?: string }) {
        if (!Object.values(Role).includes(data.role as Role)) {
            throw new BadRequestException(`Role "${data.role}" không hợp lệ`);
        }

        const usernameTaken = await this.prisma.user.findUnique({
            where: { username: data.username },
        });
        if (usernameTaken) {
            throw new BadRequestException('Tên đăng nhập đã tồn tại');
        }

        const email = data.email && data.email.trim() !== ''
            ? data.email.trim()
            : `${data.username}@company.local`;

        const emailTaken = await this.prisma.user.findUnique({ where: { email } });
        if (emailTaken) {
            throw new BadRequestException('Email đã tồn tại');
        }

        const password = await bcrypt.hash('123456', 10);

        return this.prisma.user.create({
            data: {
                username: data.username,
                fullName: data.fullName,
                email,
                password,
                role: data.role as Role,
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                role: true,
                email: true,
            },
        });
    }
}

import { Controller, Get, Post, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Post()
    async create(
        @Body() body: { username: string; fullName: string; role: string; email?: string },
        @CurrentUser() user: { sub: string; role: string },
    ) {
        if (user.role !== 'MANAGER') {
            throw new ForbiddenException('Chỉ MANAGER mới được thêm người dùng');
        }
        return this.usersService.create(body);
    }
}

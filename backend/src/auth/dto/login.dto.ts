import { IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    login!: string; // username hoặc email

    @IsString()
    password!: string;
}

import { IsEnum, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { AssetCondition } from '@prisma/client';

export class ChangeAssetConditionDto {
  @IsEnum(AssetCondition)
  condition!: AssetCondition;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;

  // Tạm dùng khi dự án chưa tích hợp xác thực.
  // Khi có đăng nhập, phải lấy actorId từ tài khoản đã xác thực.
  @IsUUID()
  actorId!: string;
}
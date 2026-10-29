import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class DeactivateAssetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;

  @IsString()
  @IsNotEmpty()
  actorId!: string;
}
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAssetDto } from './create-asset.dto';

export class UpdateAssetDto extends PartialType(
  OmitType(CreateAssetDto, [
    'assetCode',
    'groupId',
    'areaId',
    'facilityId',
  ] as const),
) {}
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum Permission {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  COMMENT = 'COMMENT',
}

export class SharePageDto {
  @ApiProperty({
    description: 'User ID to share the page with',
    example: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    enum: Permission,
    description: 'Permission level',
    example: Permission.VIEW,
  })
  @IsEnum(Permission)
  permission: Permission;
}

export class UpdateSharePermissionDto {
  @ApiProperty({
    enum: Permission,
    description: 'Updated permission level',
    example: Permission.EDIT,
  })
  @IsEnum(Permission)
  permission: Permission;
}




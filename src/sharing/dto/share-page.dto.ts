import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsEmail, ValidateIf } from 'class-validator';

export enum Permission {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  COMMENT = 'COMMENT',
}

export class SharePageDto {
  @ApiPropertyOptional({
    description: 'User ID to share the page with (either userId or email is required)',
    example: '4f4694b9-dd4c-435e-a931-2ea5b05add8e',
  })
  @IsString()
  @ValidateIf((o) => !o.email)
  userId?: string;

  @ApiPropertyOptional({
    description: 'Email of the user to share the page with (either userId or email is required)',
    example: 'user@example.com',
  })
  @IsEmail()
  @ValidateIf((o) => !o.userId)
  email?: string;

  @ApiProperty({
    enum: Permission,
    description: 'Permission level',
    example: Permission.EDIT,
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




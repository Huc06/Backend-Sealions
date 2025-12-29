import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { PageMode } from './create-page.dto';

export class ConvertPageModeDto {
  @ApiProperty({
    description: 'Target mode to convert to',
    enum: PageMode,
    example: PageMode.SECURE,
  })
  @IsEnum(PageMode)
  mode: PageMode;

  @ApiPropertyOptional({
    description: 'Number of epochs for storage (1 epoch = 14 days). Required when converting to SECURE mode.',
    example: 52,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  epochs?: number;
}


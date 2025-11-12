import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePageDto {
  @ApiPropertyOptional({
    description: 'Title of the new page',
    example: 'Meeting Notes',
  })
  @IsOptional()
  @IsString()
  title?: string;
}


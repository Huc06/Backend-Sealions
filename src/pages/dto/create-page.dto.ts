import { IsOptional, IsString } from 'class-validator';

export class CreatePageDto {
  @IsOptional()
  @IsString()
  title?: string;
}


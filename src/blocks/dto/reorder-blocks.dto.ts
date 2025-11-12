import { IsArray, ArrayMinSize } from 'class-validator';

export class ReorderBlocksDto {
  @IsArray()
  @ArrayMinSize(1)
  blockIds: string[];
}


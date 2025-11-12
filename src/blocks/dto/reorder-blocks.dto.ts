import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayMinSize } from 'class-validator';

export class ReorderBlocksDto {
  @ApiProperty({
    description: 'Ordered list of block IDs',
    example: [
      'cmhvpvb3j00072gmbnz1dl3jc',
      'cmhvpvb3j00082gmbnz1dl3jd',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  blockIds: string[];
}


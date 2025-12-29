import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { WalrusPricingService } from './walrus-pricing.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';

@ApiTags('Walrus Pricing')
@Controller('walrus')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('access-token')
export class WalrusPricingController {
  constructor(private pricingService: WalrusPricingService) {}

  @Get('pricing')
  @ApiOperation({
    summary: 'Calculate Walrus storage pricing',
    description: 'Calculate storage cost for given file size and duration. Returns pricing for both Standard and Quilt options (Quilt is recommended, much cheaper).',
  })
  @ApiQuery({
    name: 'sizeBytes',
    required: true,
    description: 'File size in bytes',
    example: 10240, // 10KB
  })
  @ApiQuery({
    name: 'epochs',
    required: false,
    description: 'Number of epochs (14 days each). Default: 52 (2 years)',
    example: 52,
  })
  @ApiOkResponse({
    description: 'Storage pricing information',
    schema: {
      example: {
        sizeBytes: 10240,
        sizeKB: 10,
        sizeMB: 0.01,
        epochs: 52,
        durationDays: 728,
        durationMonths: 24.27,
        durationYears: 1.99,
        priceStandard: 2.088,
        priceQuilt: 0.005,
        savings: 417.6,
        estimatedUSD: 0.0005,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async calculatePricing(
    @Request() req,
    @Query('sizeBytes') sizeBytes: string,
    @Query('epochs') epochs?: string,
  ) {
    const size = parseInt(sizeBytes, 10);
    const epochCount = epochs ? parseInt(epochs, 10) : 52;

    if (isNaN(size) || size <= 0) {
      throw new Error('Invalid sizeBytes parameter');
    }

    return this.pricingService.calculatePricing(size, epochCount);
  }

  @Get('pricing/options')
  @ApiOperation({
    summary: 'Get pricing options for different durations',
    description: 'Get pricing for multiple duration options (2 months, 6 months, 1 year, 2 years)',
  })
  @ApiQuery({
    name: 'sizeBytes',
    required: true,
    description: 'File size in bytes',
    example: 10240, // 10KB
  })
  @ApiOkResponse({
    description: 'Pricing options for different durations',
    schema: {
      example: [
        {
          epochs: 4,
          durationDays: 56,
          durationMonths: 1.87,
          durationYears: 0.15,
          priceQuilt: 0.005,
          estimatedUSD: 0.0005,
        },
        {
          epochs: 52,
          durationDays: 728,
          durationMonths: 24.27,
          durationYears: 1.99,
          priceQuilt: 0.005,
          estimatedUSD: 0.0005,
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getPricingOptions(
    @Request() req,
    @Query('sizeBytes') sizeBytes: string,
  ) {
    const size = parseInt(sizeBytes, 10);

    if (isNaN(size) || size <= 0) {
      throw new Error('Invalid sizeBytes parameter');
    }

    return this.pricingService.calculatePricingOptions(size);
  }
}


import { Injectable } from '@nestjs/common';

export interface StoragePricing {
  sizeBytes: number;
  sizeKB: number;
  sizeMB: number;
  epochs: number;
  durationDays: number;
  durationMonths: number;
  durationYears: number;
  priceStandard: number; // WAL tokens
  priceQuilt: number; // WAL tokens (recommended)
  savings: number; // Multiplier (how much cheaper Quilt is)
  estimatedUSD: number; // Estimated USD (if WAL price known)
}

@Injectable()
export class WalrusPricingService {
  // Pricing based on Walrus testnet (will need to update with mainnet pricing)
  private readonly PRICING_TABLE = {
    // Size ranges and their Quilt pricing (WAL tokens)
    ranges: [
      { maxKB: 10, quiltPrice: 0.005 },
      { maxKB: 100, quiltPrice: 0.020 },
      { maxKB: 1024, quiltPrice: 0.170 }, // 1MB
      { maxKB: 10240, quiltPrice: 1.7 }, // 10MB
      { maxKB: 102400, quiltPrice: 17 }, // 100MB
    ],
    // Standard pricing (for comparison)
    standardBase: 2.088, // Base price for small files
    // Epoch duration (14 days per epoch)
    epochDays: 14,
  };

  /**
   * Calculate storage pricing for given size and duration
   */
  calculatePricing(
    sizeBytes: number,
    epochs: number = 52, // Default: 2 years (52 epochs)
  ): StoragePricing {
    const sizeKB = sizeBytes / 1024;
    const sizeMB = sizeKB / 1024;
    const durationDays = epochs * this.PRICING_TABLE.epochDays;
    const durationMonths = durationDays / 30;
    const durationYears = durationDays / 365;

    // Find appropriate pricing tier
    let quiltPrice = this.PRICING_TABLE.ranges[
      this.PRICING_TABLE.ranges.length - 1
    ].quiltPrice;

    for (const range of this.PRICING_TABLE.ranges) {
      if (sizeKB <= range.maxKB) {
        quiltPrice = range.quiltPrice;
        break;
      }
    }

    // For larger files, scale linearly
    if (sizeKB > this.PRICING_TABLE.ranges[this.PRICING_TABLE.ranges.length - 1].maxKB) {
      const lastRange = this.PRICING_TABLE.ranges[this.PRICING_TABLE.ranges.length - 1];
      const multiplier = sizeKB / lastRange.maxKB;
      quiltPrice = lastRange.quiltPrice * multiplier;
    }

    // Standard pricing (for comparison)
    const priceStandard = this.PRICING_TABLE.standardBase;

    // Calculate savings multiplier
    const savings = priceStandard / quiltPrice;

    // Estimate USD (assuming WAL price, need to update with real price)
    // This is a placeholder - should fetch real WAL/USD price
    const walPriceUSD = 0.1; // Placeholder: $0.1 per WAL
    const estimatedUSD = quiltPrice * walPriceUSD;

    return {
      sizeBytes,
      sizeKB: Math.round(sizeKB * 100) / 100,
      sizeMB: Math.round(sizeMB * 100) / 100,
      epochs,
      durationDays,
      durationMonths: Math.round(durationMonths * 100) / 100,
      durationYears: Math.round(durationYears * 100) / 100,
      priceStandard: Math.round(priceStandard * 1000) / 1000,
      priceQuilt: Math.round(quiltPrice * 1000) / 1000,
      savings: Math.round(savings * 10) / 10,
      estimatedUSD: Math.round(estimatedUSD * 100) / 100,
    };
  }

  /**
   * Calculate pricing for multiple size/duration options
   */
  calculatePricingOptions(sizeBytes: number): StoragePricing[] {
    const options = [
      { epochs: 4, label: '2 months' }, // 4 epochs = 56 days
      { epochs: 13, label: '6 months' }, // 13 epochs = 182 days
      { epochs: 26, label: '1 year' }, // 26 epochs = 364 days
      { epochs: 52, label: '2 years' }, // 52 epochs = 728 days (recommended)
    ];

    return options.map((option) =>
      this.calculatePricing(sizeBytes, option.epochs),
    );
  }

  /**
   * Get recommended duration based on use case
   */
  getRecommendedDuration(useCase: 'temporary' | 'standard' | 'long-term'): number {
    switch (useCase) {
      case 'temporary':
        return 4; // 2 months
      case 'standard':
        return 26; // 1 year
      case 'long-term':
        return 52; // 2 years
      default:
        return 52; // Default: 2 years
    }
  }

  /**
   * Format pricing for display
   */
  formatPricing(pricing: StoragePricing): string {
    return `${pricing.priceQuilt} WAL (≈ $${pricing.estimatedUSD}) for ${pricing.durationYears} year(s)`;
  }
}


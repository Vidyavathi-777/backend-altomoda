const Product = require('../models/Product');
const PricingOverride = require('../models/PricingOverride');
const logger = require('../utils/logger');

class PricingService {
  constructor() {
    this.defaultFxRate = 90.5; // EUR to INR
    this.defaultMarginPct = 40;
    this.defaultGstPct = 18;
  }

  async computePrice(product, priceSource) {
    try {
      // Get applicable overrides
      const overrides = await this.getApplicableOverrides(product);
      
      const fxRate = this.defaultFxRate;
      let marginPct = this.defaultMarginPct;
      let fixedMarkup = 0;

      // Apply overrides in priority order
      for (const override of overrides) {
        if (override.rule.marginPct) {
          marginPct = override.rule.marginPct;
        }
        if (override.rule.fixedMarkup) {
          fixedMarkup = override.rule.fixedMarkup;
        }
      }

      // Calculate landed cost
      const landedCost = priceSource.amount * fxRate;
      
      // Apply margin
      const priceAfterMargin = landedCost * (1 + marginPct / 100);
      
      // Add fixed markup
      const priceAfterMarkup = priceAfterMargin + fixedMarkup;
      
      // Add GST
      const gstAmount = priceAfterMarkup * (this.defaultGstPct / 100);
      const finalMrpInr = priceAfterMarkup + gstAmount;

      // Round to nearest 99 or 49
      const roundedMrp = this.roundPrice(finalMrpInr, overrides[0]?.rule?.roundingStrategy);

      return {
        fxRate,
        landedCost,
        marginPct,
        gstPct: this.defaultGstPct,
        finalMrpInr: roundedMrp,
        breakdown: {
          basePrice: landedCost,
          margin: priceAfterMargin - landedCost,
          fixedMarkup,
          gst: gstAmount,
        },
        computedAt: new Date(),
      };
    } catch (error) {
      logger.error('Pricing computation error:', error);
      throw error;
    }
  }

  async getApplicableOverrides(product) {
    const overrides = await PricingOverride.find({
      active: true,
      $or: [
        { type: 'sku', target: product.sku },
        { type: 'brand', target: product.brand },
        { type: 'category', target: { $in: product.categories } },
      ],
    }).sort({ priority: -1 });

    return overrides;
  }

  roundPrice(price, strategy = 'nearest99') {
    if (strategy === 'nearest99') {
      return Math.round(price / 100) * 100 - 1;
    } else if (strategy === 'nearest49') {
      return Math.round(price / 50) * 50 - 1;
    }
    return Math.round(price);
  }

  async recomputeProductPrices(query = {}) {
    const products = await Product.find(query);
    const updates = [];

    for (const product of products) {
      if (product.priceSource && product.priceSource.amount) {
        const priceCalc = await this.computePrice(product, product.priceSource);
        updates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { priceCalc } },
          },
        });
      }
    }

    if (updates.length > 0) {
      await Product.bulkWrite(updates);
    }

    return updates.length;
  }
}

module.exports = new PricingService();
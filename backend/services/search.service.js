const Product = require('../models/Product');

class SearchService {
  async searchProducts(query) {
    const {
      q,
      category,
      brand,
      priceMin,
      priceMax,
      sort = '-createdAt',
      page = 1,
      size = 20,
    } = query;

    const filter = { isActive: true };

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Category filter
    if (category) {
      filter.categories = category;
    }

    // Brand filter
    if (brand) {
      filter.brand = brand;
    }

    // Price range
    if (priceMin || priceMax) {
      filter['priceCalc.finalMrpInr'] = {};
      if (priceMin) filter['priceCalc.finalMrpInr'].$gte = parseFloat(priceMin);
      if (priceMax) filter['priceCalc.finalMrpInr'].$lte = parseFloat(priceMax);
    }

    const skip = (page - 1) * size;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(size))
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Get facets
    const facets = await this.getFacets(filter);

    return {
      items,
      total,
      page: parseInt(page),
      size: parseInt(size),
      totalPages: Math.ceil(total / size),
      facets,
    };
  }

  async getFacets(baseFilter) {
    const facets = {};

    // Brand facets
    const brands = await Product.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    facets.brands = brands.map(b => ({ value: b._id, count: b.count }));

    // Category facets
    const categories = await Product.aggregate([
      { $match: baseFilter },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    facets.categories = categories.map(c => ({ value: c._id, count: c.count }));

    // Price ranges
    const priceRanges = [
      { label: 'Under ₹5,000', min: 0, max: 5000 },
      { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
      { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
      { label: 'Above ₹20,000', min: 20000, max: 999999 },
    ];

    facets.priceRanges = await Promise.all(
      priceRanges.map(async range => {
        const count = await Product.countDocuments({
          ...baseFilter,
          'priceCalc.finalMrpInr': { $gte: range.min, $lte: range.max },
        });
        return { ...range, count };
      })
    );

    return facets;
  }
}

module.exports = new SearchService();

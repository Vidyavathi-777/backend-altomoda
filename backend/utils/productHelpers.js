// utils/productHelpers.js
const getAllCategoryIds = (category) => {
  let ids = [category._id.toString()];
  if (category.children && category.children.length > 0) {
    category.children.forEach((child) => {
      ids = ids.concat(getAllCategoryIds(child));
    });
  }
  return ids;
};

const calculateDiscount = (stockPrice, buyPrice) => {
  if (!stockPrice || !buyPrice || stockPrice <= buyPrice) return 0;
  return Math.round(((stockPrice - buyPrice) / stockPrice) * 100);
};

const createStandardizedProduct = (product) => {
  const basePrice = product.stock_price;
  const buyPrice = product.props?.buy_price;
  const discount = calculateDiscount(basePrice, buyPrice);

  return {
    _id: product._id,
    sku_parent: product.props?.sku_parent,
    title: product.locs?.singles?.title || {},
    description: product.locs?.singles?.desc || {},
    color: product.locs?.singles?.color || {},
    brand: product.props?.brand,
    season: product.props?.season,
    category: product.cats?.[0]?.name?.locs || {},
    cats: product.cats ? product.cats.map(cat => ({
      _id: cat._id,
      name: cat.name?.locs || {}
    })) : [],
    categoryIds: product.cats ? product.cats.map(cat => cat._id) : [],
    composition: product.composition || [],
    care: product.locs?.singles?.care || {},
    made: product.locs?.singles?.made || {},
    fastening: product.locs?.singles?.fastening || {},
    sex: product.locs?.singles?.sex || {},
    images: product.imgs || [],
    price: basePrice,
    buy_price: buyPrice,
    discountPercentage: discount,
    discountRange: [discount],
    createdAt: product.createdAt,
    variants: []
  };
};

const createStandardizedVariant = (product) => {
  const basePrice = product.stock_price;
  const buyPrice = product.props?.buy_price;
  const discount = calculateDiscount(basePrice, buyPrice);

  return {
    _id: product._id,
    sku: product.sku,
    size: product.props?.size,
    size_conversion: product.locs?.singles?.size_conversion || {},
    stock: product.qty,
    price: basePrice,
    buy_price: buyPrice,
    discountPercentage: discount,
    barcode: product.props?.barcode,
    model_measurements: {
      waist: product.props?.model_size_waistline,
      hip: product.props?.model_size_hip,
      chest: product.props?.model_size_chest,
      height: product.props?.model_size_height,
    }
  };
};

module.exports = {
  getAllCategoryIds,
  calculateDiscount,
  createStandardizedProduct,
  createStandardizedVariant
};
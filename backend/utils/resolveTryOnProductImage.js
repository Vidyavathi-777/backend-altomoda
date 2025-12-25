const Product = require("../models/Product");

const resolveTryOnProductImage = async (parentSku) => {
  if (!parentSku) {
    throw new Error("parentSku is required");
  }

  console.log(`Fetching products from database for parentSku: ${parentSku}`);

  const products = await Product.find({
    "props.sku_parent": parentSku
  }).lean();

  if (!products.length) {
    throw new Error("Product not found");
  }

  console.log(`Database returned ${products.length} matching products`);

  const product = products[0];
  console.log(`Using product SKU: ${product.sku}`);

  // ✅ Resolve image properly
  const image =
    product.imgs?.find(i => i.isTryOn)?.url ||
    product.imgs?.find(i => i.type === "model")?.url ||
    product.imgs?.[0]?.url ||
    null;

  console.log(`Resolved product main image: ${image}`);

  if (!image) {
    throw new Error("No valid product image found");
  }

  return image;
};

module.exports = { resolveTryOnProductImage };


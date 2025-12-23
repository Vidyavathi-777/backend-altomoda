const Product = require("../models/Product");

// module.exports = async function resolveTryOnProductImage(parentSku) {



//     if (!parentSku) throw new Error( "parentSku is required");

//     console.log(`Fetching products from database for parentSku: ${parentSku}`);
//     const products = await Product.find({ "props.sku_parent": parentSku });
//     if (!products.length) throw new Error( "Product not found");

//     console.log(`Database returned ${products.length} matching products`);
//     const product = products[0];
//     console.log(`Using product SKU: ${product.sku} for try-on processing`);

//     const productImageUrl = product.imgs?.[0]?.url;
//     console.log(`Resolved product main image: ${productImageUrl}`);
// //   const product = await Product.findOne({
// //     "props.sku_parent": parentSku
// //   }).lean();

// //   if (!product) {
// //     throw new Error("Product not found for SKU");
// //   }

// //   // Priority-based image resolution
// //   const image =
// //     product.imgs?.find(i => i.isTryOn)?.url ||
// //     product.imgs?.find(i => i.type === "model")?.url ||
// //     product.imgs?.[0]?.url;

//   if (!image) {
//     throw new Error("No valid product image found");
//   }

//   return image;
// };

// const resolveTryOnProductImage = async (parentSku) => {
//         if (!parentSku) throw new Error( "parentSku is required");

//     console.log(`Fetching products from database for parentSku: ${parentSku}`);
//     const products = await Product.find({ "props.sku_parent": parentSku });
//     if (!products.length) throw new Error( "Product not found");

//     console.log(`Database returned ${products.length} matching products`);
//     const product = products[0];
//     console.log(`Using product SKU: ${product.sku} for try-on processing`);

//     const productImageUrl = product.imgs?.[0]?.url;
//     console.log(`Resolved product main image: ${productImageUrl}`);
//       if (!image) {
//     throw new Error("No valid product image found");
//   }

//   return image;

// }

// module.exports = {resolveTryOnProductImage}





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


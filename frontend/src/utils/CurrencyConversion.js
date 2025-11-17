// 1 EUR → INR rate (you can update anytime)
const EUR_TO_INR = 90; // Example rate

export const convertPriceToINR = (eurPrice) => {
  if (!eurPrice) return 0;

  // Convert EUR → INR
  const inrPrice = eurPrice * EUR_TO_INR;

  // Add 30%
  const finalPrice = inrPrice * 1.3;

  return Math.round(finalPrice); // remove decimals
};

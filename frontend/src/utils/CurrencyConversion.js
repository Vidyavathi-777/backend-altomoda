export const convertEuroToINR = async (amountInEuro) => {
  try {
    const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=INR');
    const data = await response.json();
    const rate = data?.rates?.INR || 90; // fallback if API fails
    const amountInINR = amountInEuro * rate;
    const withTax = amountInINR * 1.12; // add 12%
    return Math.round(withTax);
  } catch (error) {
    console.error('Currency conversion failed:', error);
    return Math.round(amountInEuro * 90 * 1.12); // fallback approx INR value
  }
};

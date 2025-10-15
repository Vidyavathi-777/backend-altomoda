const TOKEN = "55f707f6b49dbbe14ec6354d-68e7881e65cc94067098b7ab:4b02bdd96ac3b665239151aea7b0faf8";

export const fetchProducts = async () => {
  try {
    const res = await fetch("/apishop/v1/items", {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Failed to fetch products");

    const data = await res.json();
    return data.content || [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
};

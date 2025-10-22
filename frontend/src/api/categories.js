const TOKEN = "55f707f6b49dbbe14ec6354d-68e7881e65cc94067098b7ab:4b02bdd96ac3b665239151aea7b0faf8";

export const fetchCategoryByRoot = async (categoryId, pageIndex = 0, pageSize = 20) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/products/categoryChildren/${categoryId}`,
      // {
      //   headers: {
      //     Authorization: `Bearer ${TOKEN}`,
      //     Accept: "application/json",
      //   },
      // }
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return data.data || []; // return an empty array if no items
  } catch (error) {
    console.error("Failed to fetch category children:", error);
    return [];
  }
};


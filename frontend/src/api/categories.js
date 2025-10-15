const TOKEN = "55f707f6b49dbbe14ec6354d-68e7881e65cc94067098b7ab:4b02bdd96ac3b665239151aea7b0faf8";

export const fetchCategoryByRoot = async (categoryId, pageIndex = 0, pageSize = 20) => {
  try {
    const res = await fetch(
      `/api/shop/v1/categories/${categoryId}/children`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return data || []; // return an empty array if no items
  } catch (error) {
    console.error("Failed to fetch category children:", error);
    return [];
  }
};

export const fetchAllBrands = async () => {
  const allBrands = new Set();
  let pageIndex = 0;
  let hasMore = true;

  try {
    while (hasMore) {
      const res = await fetch(`api/shop/v1/items?_pageIndex=${pageIndex}&_pageSize=250`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error('API error');
      
      const data = await res.json();
      
      // Extract brands from current page
      data.content?.forEach(item => {
        if (item.props?.brand) allBrands.add(item.props.brand);
      });

      // Check if there are more pages
      const totalPages = data._metadata?.total_pages || 1;
      hasMore = pageIndex < totalPages - 1;
      pageIndex++;

    if (pageIndex >= 10) {
        console.log('Reached safety limit of 100 pages');
        break;
      }

      // Small delay to avoid rate limiting
      if (hasMore) await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return Array.from(allBrands).sort();
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    return [];
  }
};
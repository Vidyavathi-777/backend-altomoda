import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const API_TOKEN = "Bearer 55f707f6b49dbbe14ec6354d-68e7881e65cc94067098b7ab:4b02bdd96ac3b665239151aea7b0faf8";
const API_BASE = "https://sandbox.csplatform.io:9950";

// Proxy route for products
app.post("/api/products", async (req, res) => {
  try {
    const { pageIndex = 0, pageSize = 20, sort = "_id[ASC]" } = req.query;
    const response = await fetch(`${API_BASE}/shop/v2/items/listParentsByFilter?_pageIndex=${pageIndex}&_pageSize=${pageSize}&_sort=${encodeURIComponent(sort)}`, {
      method: "POST",
      headers: {
        "Authorization": API_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy route for category children
app.get("/api/categories/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  try {
    const response = await fetch(`${API_BASE}/shop/v1/categories/${categoryId}/children`, {
      method: "GET",
      headers: {
        Authorization: API_TOKEN,
        Accept: "application/json",
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/categories/tree", async (req, res) => {
  try {
    const response = await fetch("https://sandbox.csplatform.io:9950/shop/v1/categories/tree", {
      method: "GET",
      headers: {
        Authorization: API_TOKEN,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: error.message });
  }
});


app.get("/api/products/search", async (req, res) => {
  const { term } = req.query;

  if (!term || term.length < 2) {
    return res.json({ suggestions: [], products: [] });
  }

  try {
   

    if (!term || term.length < 1) {
      return res.json({ products: [], searchTerm: "" });
    }

    // Capitalize first letter for display
    const displayTerm = term.charAt(0).toUpperCase() + term.slice(1);

    // Fetch products from real API
    const response = await fetch(
      `https://sandbox.csplatform.io:9950/shop/v1/items/listBySearchTerm?searchTerm=${encodeURIComponent(term)}`,
      {
        method: "GET",
        headers: {
          Authorization: API_TOKEN,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const products = await response.json();
    res.json({ searchTerm:displayTerm, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(`https://sandbox.csplatform.io:9950/shop/v1/items/${id}`, {
      headers: { Authorization: API_TOKEN }
    });

    if (!response.ok) throw new Error(`Failed to fetch product ${id}`);

    const data = await response.json();
    res.json(data.content); // send the product data directly
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/related/:sku
app.get("/api/products/related/:sku", async (req, res) => {
  const { sku } = req.params;

  try {
    const response = await fetch(
      `https://sandbox.csplatform.io:9950/shop/v1/items/listByCode?code=${encodeURIComponent(sku)}&type=SKU&_searchType=PARTIAL_CASE_INSENSITIVE&_pageSize=20`,
      {
        headers: { Authorization: API_TOKEN }
      }
    );

    if (!response.ok) throw new Error(`Failed to fetch related products for SKU ${sku}`);

    const data = await response.json();

    // Transform products
    const relatedProducts = (data.content || []).map(item => {
      const mainImage = item.imgs?.find(img =>
        img.placement?.includes("DETAIL") || img.placement?.includes("LIST")
      ) || item.imgs?.[0];

      return {
        _id: { $oid: item.item_id?.$oid },
        sku: item.sku,
        brand: item.props?.brand || "Unknown Brand",
        title: item.locs?.singles?.title?.en || item.props?.model_name || "Product",
        price: item.stock_price || 0,
        imgs: mainImage ? [{ url: mainImage.url }] : [],
        color: item.locs?.singles?.color?.en || "",
        size: item.props?.size || "",
        inStock: (item.qty || 0) > 0
      };
    });

    res.json({ related: relatedProducts });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));

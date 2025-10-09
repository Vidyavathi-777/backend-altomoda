import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import productsData from "../json/productsData.json";
import { useParams, Link, useLocation } from "react-router-dom";

const ProductsPage = () => {
    const { gender = 'woman', newArrival, category, subCategory, brandName } = useParams()
    const [openFilters, setOpenFilters] = useState({});
    const [showMore, setShowMore] = useState(false);
    const [sortBy, setSortBy] = useState("Ranking");
    const [selectedFilters, setSelectedFilters] = useState({
        brand: [],
        category: [],
        subcategory: [],
        discount: [],
    });
    // console.log(newArrival)
    //console.log(category)
    // console.log(brandName)

    const isDiscountedRoute = location.pathname.includes("/discount/products")
    // console.log(isDiscountedRoute)
    let products = productsData.productSlider.products.filter(item => item.gender === gender );

    if(isDiscountedRoute){
        products = products.filter((p) =>  p.discount )
        // console.log(products)
    }

    if (newArrival === 'newarrival') {
        products = products.filter((p) => p.title === 'newarrival' && !p.discount  );
        // console.log(newArrival)
    }

    if (category) {
        products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase() && !p.discount )
    }

    if (subCategory) {
        products = products.filter((p) => p.subcategory.toLowerCase() === subCategory.toLowerCase() && !p.discount );
    }
    if (brandName) {
        products = products.filter((p) => p.brand.toLowerCase() === brandName.toLowerCase()&& !p.discount );
    }

    // --- Unique Filter Lists ---
    const brands = [...new Set(products.map((p) => p.brand))];
    const categories = [...new Set(products.map((p) => p.category))];
    const subcategories = [...new Set(products.map((p) => p.subcategory))];
    const discounts = [...new Set(products.map((p) => p.discount))].sort(
        (a, b) => a - b
    );

    // --- Toggle Filter Visibility ---
    const toggleFilter = (filterName) => {
        setOpenFilters((prev) => ({
            ...prev,
            [filterName]: !prev[filterName],
        }));
    };

    // --- Handle Checkbox Changes ---
    const handleFilterChange = (filterName, value) => {
        setSelectedFilters((prev) => {
            const currentValues = prev[filterName];
            if (currentValues.includes(value)) {
                return {
                    ...prev,
                    [filterName]: currentValues.filter((v) => v !== value),
                };
            } else {
                return {
                    ...prev,
                    [filterName]: [...currentValues, value],
                };
            }
        });
    };

    // --- Apply Filters ---
    const filteredProducts = products.filter((product) => {
        const brandMatch =
            selectedFilters.brand.length === 0 ||
            selectedFilters.brand.includes(product.brand);

        const categoryMatch =
            selectedFilters.category.length === 0 ||
            selectedFilters.category.includes(product.category);

        const subcategoryMatch =
            selectedFilters.subcategory.length === 0 ||
            selectedFilters.subcategory.includes(product.subcategory);

        const discountMatch =
            selectedFilters.discount.length === 0 ||
            selectedFilters.discount.includes(product.discount);

        return brandMatch && categoryMatch && subcategoryMatch && discountMatch;
    });

    // --- Sort Products ---
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "Price: Low to High") return a.price - b.price;
        if (sortBy === "Price: High to Low") return b.price - a.price;
        return 0; // Ranking or Newest (no custom sorting here)
    });

    const description = [
        {
            gender: "man",
            description: "Explore our selection of men’s fashion and lifestyle products, where luxury and style converge with a curated offer from the world’s top brands. Whether you're dressing for a casual day out or a formal event, we have everything you need to complete your look. From tailored Alexander McQueen blazers, iconic leather Gucci belts and crisp Burberry shirts, to graphic t-shirts from Dsquared2 and Lanvin, casual polos by Dolce & Gabbana or even a stylish crossbody bag from Valencia for a trendy yet functional ensemble.Our collection also includes cozy knitwear and smart swimwear, ensuring you're prepared for any season or occasion. Elevate your daily routine with premium skincare products, elegant home décor, and stylish stationery, bringing a touch of luxury to every aspect of your life. Experience unmatched quality and craftsmanship with our range of clothing, accessories, and lifestyle products, designed to make every day a stylish one."
        },
        {
            gender: "woman",
            description: "Our offer of women's designer clothing, shoes and accessories is a true expression of style and elegance, featuring a mesmerizing array of colors, textures, and designs. Each piece is crafted with the utmost care and attention to detail, using the finest materials to create truly one-of-a-kind designs. Explore fashion-forward pieces from legendary fashion houses Balenciaga, Gucci opt for something edgier from contemporary labels born in the 21st century.Our collection of womenswear is a fusion of modern designs and timeless sophistication that flatters the female form and celebrates individuality. Whether you opt for a sleek, body-con dress or a pair of bootcut jeans, women's designer clothing is a testament to the transformative power of fashion and an invitation to embrace your personal style. The ultimate indulgence, designer accessories and shoes are the perfect finishing touch for a special event or to simply elevate your everyday look. A beautiful way to make a statement and feel confident and stylish, our selection of women’s designer apparel and accessories has something for every mood."
        }
    ]

    const filterDescription = description.find(item => item.gender === gender)?.description || ""


    return (
        <div className="min-h-screen bg-white pt-[120px] sm:pt-[140px] md:pt-[160px] lg:pt-[180px]">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-light mb-4 uppercase">{gender}</h1>
                    <div className="text-sm text-gray-700 leading-relaxed">
                        <p className={`${!showMore ? "line-clamp-3" : ""}`}>
                            {filterDescription}
                        </p>
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="text-black underline mt-2 text-sm"
                        >
                            {showMore ? "show less" : "show more"}
                        </button>
                    </div>
                </div>

                {/* Sort By */}
                <div className="flex justify-end mb-6 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Sort By:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border-0 bg-transparent focus:outline-none cursor-pointer font-medium"
                        >
                            <option>Ranking</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                            <option>Newest</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Filters Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="space-y-0">
                            {/* Designers Filter */}
                            <div className="border-b border-gray-200">
                                <button
                                    onClick={() => toggleFilter("designers")}
                                    className="w-full flex items-center justify-between py-4 text-left"
                                >
                                    <span className="text-sm uppercase tracking-wider font-medium">
                                        Designers
                                    </span>
                                    {openFilters.designers ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                                {openFilters.designers && (
                                    <div className="pb-4 space-y-2">
                                        {brands.map((brand) => (
                                            <label key={brand} className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFilters.brand.includes(brand)}
                                                    onChange={() => handleFilterChange("brand", brand)}
                                                />
                                                {brand}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Category Filter */}
                            <div className="border-b border-gray-200">
                                <button
                                    onClick={() => toggleFilter("category")}
                                    className="w-full flex items-center justify-between py-4 text-left"
                                >
                                    <span className="text-sm uppercase tracking-wider font-medium">
                                        Category
                                    </span>
                                    {openFilters.category ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                                {openFilters.category && (
                                    <div className="pb-4 space-y-2">
                                        {categories.map((cat) => (
                                            <label key={cat} className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFilters.category.includes(cat)}
                                                    onChange={() => handleFilterChange("category", cat)}
                                                />
                                                {cat}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Subcategory Filter */}
                            <div className="border-b border-gray-200">
                                <button
                                    onClick={() => toggleFilter("subcategory")}
                                    className="w-full flex items-center justify-between py-4 text-left"
                                >
                                    <span className="text-sm uppercase tracking-wider font-medium">
                                        Subcategory
                                    </span>
                                    {openFilters.subcategory ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                                {openFilters.subcategory && (
                                    <div className="pb-4 space-y-2">
                                        {subcategories.map((sub) => (
                                            <label key={sub} className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFilters.subcategory.includes(sub)}
                                                    onChange={() => handleFilterChange("subcategory", sub)}
                                                />
                                                {sub}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Discount Filter */}
                            <div className="border-b border-gray-200">
                                <button
                                    onClick={() => toggleFilter("discount")}
                                    className="w-full flex items-center justify-between py-4 text-left"
                                >
                                    <span className="text-sm uppercase tracking-wider font-medium">
                                        Discount
                                    </span>
                                    {openFilters.discount ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                                {openFilters.discount && (
                                    <div className="pb-4 space-y-2">
                                        {discounts.map((dis) => (
                                            <label key={dis} className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFilters.discount.includes(dis)}
                                                    onChange={() => handleFilterChange("discount", dis)}
                                                />
                                                {dis}% Off
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {sortedProducts.length === 0 ? (
                            <p className="text-gray-500">No products found.</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-8">
                                {sortedProducts.map((product) => (
                                    <Link
                                        to={`/${gender}/product/${product.id}`}
                                        key={product.id} className="group cursor-pointer">
                                        <div className="relative aspect-[2/3] bg-gray-50 mb-3 overflow-hidden">
                                            <img
                                                src={product.images[0]}
                                                alt={product.productName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {product.discount > 0 && (
                                                <div className="absolute top-2 left-2 bg-white px-2 py-1 text-xs uppercase tracking-wider">
                                                    -{product.discount}%
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg uppercase tracking-wider hover:underline">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm line-clamp-2">{product.productName}</p>
                                            <div className="flex items-center gap-2">
                                                {product.discount ? (
                                                    <>
                                                        {/* Original price with strikethrough */}
                                                        <p className="text-sm text-red-400 line-through">
                                                            ${product.originalPrice}
                                                        </p>
                                                        {/* Discounted price */}
                                                        <p className="text-md font-medium text-black">
                                                            ${product.price} ({product.discount} OFF)
                                                        </p>
                                                    </>
                                                ) : (
                                                    // No discount, just show price
                                                    <p className="text-sm font-medium">
                                                        ${product.price}
                                                    </p>
                                                )}
                                            </div>


                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Load More Button */}
                        {/* <div className="mt-12 text-center">
              <button className="border border-black px-8 py-3 text-sm uppercase tracking-wider hover:bg-black hover:text-white transition">
                Load More
              </button>
            </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;

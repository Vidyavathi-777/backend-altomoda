import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../Context/CartContext';

const ProductDetailPage = () => {

    const {addToCart} = useCart()
    const [selectedSize, setSelectedSize] = useState('');
    const [activeTab, setActiveTab] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [product, setProduct] = useState(null);
    const [relatedLoading, setRelatedLoading] = useState(false);

    const { id, gender = 'woman' } = useParams();
    const sliderRef = useRef(null);
    const mobileImageSliderRef = useRef(null);
    const TOKEN = "Bearer 55f707f6b49dbbe14ec6354d-68e7881e65cc94067098b7ab:4b02bdd96ac3b665239151aea7b0faf8";

    // Fetch product by ID
    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`, {
                    
                });
                
                if (!res.ok) throw new Error("Failed to fetch product");
                
                const data = await res.json();
                console.log('Product data:', data.data);
                setProduct(data);
                
                // Set default size from props if available
                if (data.props?.size) {
                    setSelectedSize(data.props.size);
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const extractSKU = (sku) => {
        if (!sku) return '';
        return sku.split('-').slice(0, -1).join('-');
    };

    const fetchRelatedProducts = async () => {
        if (!product?.sku) {
            setRelatedLoading(false);
            return;
        }
        
        setRelatedLoading(true);
        try {
            const baseSku = extractSKU(product.sku);
            console.log('Fetching related products with base SKU:', baseSku);
            
            const res = await fetch(
                `https://backend-altomoda.vercel.app/api/products/related/${baseSku}`,
                {
                    method: "GET",
                    headers: {
                        'Authorization': TOKEN,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            
            const data = await res.json(); // FIXED: Added await
            
            // if (data && Array.isArray(data)) {
            //     // Transform API response to match our product structure
            //     const transformedProducts = data.related.map(item => {
            //         const mainImage = item.imgs?.find(img => 
            //             img.placement?.includes("DETAIL") || img.placement?.includes("LIST")
            //         ) || item.imgs?.[0];

            //         return {
            //             _id: { $oid: item.item_id?.$oid },
            //             sku: item.sku,
            //             brand: item.props?.brand || 'Unknown Brand',
            //             title: item.locs?.singles?.title?.en || item.props?.model_name || 'Product',
            //             price: {
            //                 amount: item.stock_price || 0
            //             },
            //             imgs: mainImage ? [{ url: mainImage.url }] : [],
            //             color: item.locs?.singles?.color?.en || '',
            //             size: item.props?.size || '',
            //             inStock: (item.qty || 0) > 0
            //         };
            //     });

            //     // FIXED: Use 'product' instead of 'currentProduct'
            //     const uniqueProducts = transformedProducts
            //         .filter(relatedProduct => relatedProduct._id.$oid !== product._id?.$oid) // FIXED: Changed variable name
            //         .filter((relatedProduct, index, self) => 
            //             index === self.findIndex(p => p._id.$oid === relatedProduct._id.$oid)
            //         )
            //         .slice(0, 12); // Limit to 12 products for slider

            //     setRelatedProducts(uniqueProducts);
            //     console.log('Related products found:', uniqueProducts.length);
            // } else {
            //     setRelatedProducts([]);
            // }

                    const transformedProducts = (data.related || []).map(item => {
            const mainImage = item.imgs?.[0] || null;
            return {
                _id: { $oid: item._id?.$oid || item.item_id?.$oid },
                sku: item.sku,
                brand: item.brand || 'Unknown Brand',
                title: item.title || 'Product',
                price: item.price?.amount || item.stock_price || 0,
                imgs: mainImage ? [{ url: mainImage.url }] : [],
                color: item.color || '',
                size: item.size || '',
                inStock: item.inStock ?? ((item.qty || 0) > 0)
            };
        });

        // Remove current product and duplicates, limit to 12
        const uniqueProducts = transformedProducts
            .filter(p => p._id.$oid !== product._id?.$oid)
            .filter((p, index, self) => index === self.findIndex(x => x._id.$oid === p._id.$oid))
            .slice(0, 12);

        setRelatedProducts(uniqueProducts);
        console.log('Related products found:', uniqueProducts.length);
        } catch (error) {
            console.error("Error fetching related products:", error);
            setRelatedProducts([]);
        } finally {
            setRelatedLoading(false);
        }
    };

    useEffect(() => {
        if (product) {
            fetchRelatedProducts();
        }
    }, [product]);

    // Scroll to top on product change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Mobile image slider scroll
    const scrollImageToSlide = (slideIndex) => {
        if (mobileImageSliderRef.current) {
            const slideWidth = mobileImageSliderRef.current.offsetWidth;
            mobileImageSliderRef.current.scrollTo({
                left: slideIndex * slideWidth,
                behavior: 'smooth'
            });
            setCurrentImageIndex(slideIndex);
        }
    };

    const handleImagePrev = () => scrollImageToSlide(Math.max(currentImageIndex - 1, 0));
    const handleImageNext = () => scrollImageToSlide(Math.min(currentImageIndex + 1, (product?.imgs?.length || 1) - 1));

    // Desktop slider scroll for related products
    const scrollToSlide = (slideIndex) => {
        if (sliderRef.current) {
            const slideWidth = 280; // w-64 (256px) + space-x-6 (24px) = 280px
            sliderRef.current.scrollTo({
                left: slideIndex * (slideWidth * 4), // Scroll 4 products at a time
                behavior: 'smooth'
            });
            setCurrentSlide(slideIndex);
        }
    };

    // Mobile slider scroll
    useEffect(() => {
        const mobileSlider = mobileImageSliderRef.current;
        if (!mobileSlider) return;
        const handleMobileScroll = () => setCurrentImageIndex(Math.round(mobileSlider.scrollLeft / mobileSlider.offsetWidth));
        mobileSlider.addEventListener('scroll', handleMobileScroll);
        return () => mobileSlider.removeEventListener('scroll', handleMobileScroll);
    }, []);

    const toggleTab = (tab) => setActiveTab(activeTab === tab ? null : tab);

    const getVisibleItems = () => {
        if (typeof window === 'undefined') return 4;
        if (window.innerWidth >= 1024) return 4;
        if (window.innerWidth >= 768) return 3;
        return 2;
    };

    const visibleItems = getVisibleItems();

    // Helper function to get localized text
    const getLocalizedText = (field, fallback = '') => {
        if (!product?.locs?.singles?.[field]) return fallback;

        const localizedField = product.locs.singles[field];
        return localizedField.en || localizedField.it || localizedField.zh || Object.values(localizedField)[0] || fallback;
    };

    // Helper function to get localized list
    const getLocalizedList = (field) => {
        if (!product?.locs?.lists?.[field]) return [];

        const localizedList = product.locs.lists[field];
        return localizedList.map(item => item.en || item.it || item.zh || Object.values(item)[0]);
    };

    // Extract product details from API response
    const getProductDetails = () => {
        if (!product) return null;

        const title = getLocalizedText('title', 'Product');
        const description = getLocalizedText('desc', 'No description available');
        const color = getLocalizedText('color', '');
        const madeIn = getLocalizedText('made', '');
        const sex = getLocalizedText('sex', '');

        const materials = getLocalizedList('material');
        const logoPositions = getLocalizedList('logo_position');

        const brand = product.props?.brand
        const sku = product.sku || '';
        const stockPrice = product.stock_price || 0;
        const salePrice = product.sale_price || stockPrice;
        const quantity = product.qty || 0;

        // Calculate discount if sale price is different from stock price
        const discount = salePrice < stockPrice ?
            Math.round(((stockPrice - salePrice) / stockPrice) * 100) : 0;

        // Extract sizes - using the size from props or create default options
        const sizes = product.props?.size ? [product.props.size] : ['One Size'];

        // Get composition
        const composition = product.composition?.map(comp => ({
            material: comp.material?.en || comp.material?.it || comp.material?.zh || Object.values(comp.material || {})[0] || 'Unknown',
            percentage: comp.perc || 100
        })) || [];

        return {
            title,
            description,
            color,
            madeIn,
            sex,
            materials,
            logoPositions,
            brand,
            sku,
            stockPrice,
            salePrice,
            quantity,
            discount,
            sizes,
            composition,
            images: product.imgs || []
        };
    };

    const productDetails = getProductDetails();

    const maxSlide = Math.max(0, Math.ceil(relatedProducts.length / visibleItems) - 1);

    const cssVariables = {
        primary: '#30486B',
        secondary: '#FFAA6B',
        neutral: '#30486B',
        fontHeading: "'Cormorant Garamond', serif",
        fontBody: "'Inter', sans-serif",
        fontAccent: "'Inter', sans-serif"
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center pt-[180px]">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center pt-[180px] text-red-500">{error}</div>;
    if (!product || !productDetails) return <div className="min-h-screen flex items-center justify-center pt-[180px]">Product not found</div>;

    return (
        <div className="min-h-screen bg-white pt-[120px] sm:pt-[140px] md:pt-[160px] lg:pt-[200px]">
            {/* Main Product Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Images - Desktop */}
                    <div className="hidden lg:block space-y-4">
                        {productDetails.images.map((img, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg overflow-hidden group">
                                <img
                                    src={img.url}
                                    alt={`${productDetails.title} - ${idx + 1}`}
                                    className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                                    style={{ maxHeight: '600px' }}
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDI1NiAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMzg0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjggMTkyTDE2MCAyMjRIMTI4VjE5MloiIGZpbGw9IiM5Q0EzQTYiLz4KPC9zdmc+';
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Product Images - Mobile */}
                    <div className="lg:hidden relative">
                        {productDetails.images.length > 1 && (
                            <>
                                <button
                                    onClick={handleImagePrev}
                                    disabled={currentImageIndex === 0}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 border border-gray-300 rounded-full p-2 shadow-lg hover:bg-white disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                                </button>
                                <button
                                    onClick={handleImageNext}
                                    disabled={currentImageIndex === productDetails.images.length - 1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 border border-gray-300 rounded-full p-2 shadow-lg hover:bg-white disabled:opacity-50"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-700" />
                                </button>
                            </>
                        )}
                        <div ref={mobileImageSliderRef} className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                            <div className="flex">
                                {productDetails.images.map((img, idx) => (
                                    <div key={idx} className="flex-shrink-0 w-full snap-start">
                                        <div className="bg-gray-50 overflow-hidden aspect-[3/4]">
                                            <img
                                                src={img.url}
                                                alt={`${productDetails.title} - ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDI1NiAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMzg0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjggMTkyTDE2MCAyMjRIMTI4VjE5MloiIGZpbGw9IiM5Q0EzQTYiLz4KPC9zdmc+';
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {productDetails.images.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {productDetails.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => scrollImageToSlide(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 ${currentImageIndex === idx ? 'bg-black w-6' : 'bg-gray-300 w-2 hover:bg-gray-400'}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="lg:sticky lg:top-8 lg:self-start pt-8">
                        {/* Brand */}
                        <h2 className="text-sm uppercase tracking-widest font-bold mb-2 cursor-pointer" style={{ fontFamily: cssVariables.fontAccent }}>
                            {productDetails.brand}
                        </h2>

                        {/* Title */}
                        <h1 className="text-3xl mb-6 font-medium " style={{ fontFamily: cssVariables.fontBody}}>
                            {productDetails.title}
                        </h1>

                        {/* Price */}
                        <div className="mb-2">
                            <span className="text-2xl font-light" style={{ fontFamily: cssVariables.fontBody }}>
                                Eur {productDetails.salePrice.toFixed(2)}
                            </span>
                            {productDetails.discount > 0 && (
                                <span className="text-sm line-through text-gray-400 ml-2" style={{ fontFamily: cssVariables.fontBody }}>
                                    ${productDetails.stockPrice.toFixed(2)}
                                </span>
                            )}
                            {productDetails.discount > 0 && (
                                <span className="text-sm text-red-500 ml-2" style={{ fontFamily: cssVariables.fontBody }}>
                                    -{productDetails.discount}%
                                </span>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="mb-2">
                            <span className={`text-sm font-medium ${productDetails.quantity > 10 ? 'text-green-600' : productDetails.quantity > 0 ? 'text-[#FFAA6B]' : 'text-red-600'}`} style={{ fontFamily: cssVariables.fontBody }}>
                                {productDetails.quantity > 10 ? 'In Stock' : productDetails.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        {/* Color */}
                        {productDetails.color && (
                            <div className="mb-2">
                                <span className="text-sm text-gray-600" style={{ fontFamily: cssVariables.fontBody }}>
                                    Color: {productDetails.color}
                                </span>
                            </div>
                        )}

                        <p className="text-xs text-gray-500 mb-8" style={{ fontFamily: cssVariables.fontBody }}>Import Duties not included</p>

                        {/* Size selection & Add to Cart */}
                        <div className="mb-4 relative flex justify-between gap-4">
                            <div className="relative w-full">
                                <ChevronDown className="w-4 h-4 absolute right-3 top-5 pointer-events-none" style={{ color: cssVariables.neutral }} />
                                <select
                                    value={selectedSize}
                                    onChange={e => setSelectedSize(e.target.value)}
                                    className="w-full border border-gray-300 px-4 py-5 text-sm appearance-none rounded-md bg-white cursor-pointer"
                                    style={{ fontFamily: cssVariables.fontBody }}
                                >
                                    <option value="">Select size</option>
                                    {productDetails.sizes.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full">
                                <button
                                    className="w-full rounded-2xl text-white py-5 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: cssVariables.primary, fontFamily: cssVariables.fontAccent }}
                                    onMouseEnter={e => e.target.style.backgroundColor = cssVariables.secondary}
                                    onMouseLeave={e => e.target.style.backgroundColor = cssVariables.primary}
                                       onClick={() => addToCart(product)}
                                    // disabled={productDetails.quantity === 0}
                                >
                                    {/* {productDetails.quantity === 0 ? 'Out of Stock' : 'Add to cart'} */}
                                    Add to Cart
                                </button>
                            </div>
                        </div>

                        {/* Accordion */}
                        <div className="space-y-0 border-t border-gray-200">
                            {['details', 'composition', 'shipping'].map(tab => {
                                const isActive = activeTab === tab;
                                return (
                                    <div key={tab} className="border-b border-gray-200 transition-colors duration-300 hover:bg-gray-50">
                                        <button onClick={() => toggleTab(tab)} className="w-full flex items-center justify-between py-4 text-left transition-colors duration-300">
                                            <span className="text-sm uppercase tracking-widest font-medium" style={{ fontFamily: cssVariables.fontAccent }}>
                                                {tab === 'details' ? 'Product Details' : tab === 'composition' ? 'Composition' : 'Shipping & Returns'}
                                            </span>
                                            {isActive ? <ChevronUp className="w-4 h-4" style={{ color: cssVariables.primary }} /> : <ChevronDown className="w-4 h-4" style={{ color: cssVariables.neutral }} />}
                                        </button>
                                        {isActive && (
                                            <div className="pb-4 text-sm space-y-2 animate-slideDown" style={{ fontFamily: cssVariables.fontBody, color: cssVariables.neutral }}>
                                                {tab === 'details' && (
                                                    <div className="space-y-3">
                                                        <div dangerouslySetInnerHTML={{ __html: productDetails.description }} />
                                                        <div className="pt-2 border-t border-gray-100">
                                                            <p><strong>SKU:</strong> {productDetails.sku}</p>
                                                            {productDetails.madeIn && <p><strong>Made In:</strong> {productDetails.madeIn}</p>}
                                                            {productDetails.sex && <p><strong>Gender:</strong> {productDetails.sex}</p>}
                                                            {productDetails.logoPositions.length > 0 && (
                                                                <div>
                                                                    <strong>Logo Positions:</strong>
                                                                    <ul className="list-disc list-inside ml-2">
                                                                        {productDetails.logoPositions.map((position, idx) => (
                                                                            <li key={idx}>{position}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {tab === 'composition' && (
                                                    <div>
                                                        {productDetails.composition.length > 0 ? (
                                                            <ul className="space-y-1">
                                                                {productDetails.composition.map((comp, idx) => (
                                                                    <li key={idx}>
                                                                        {comp.material} {comp.percentage && `- ${comp.percentage}%`}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p>No composition information available.</p>
                                                        )}
                                                    </div>
                                                )}
                                                {tab === 'shipping' && (
                                                    <div className="space-y-2">
                                                        <p><strong>Complimentary Standard delivery:</strong> 2 to 5 business days</p>
                                                        <p><strong>Taxes & Duties:</strong> Not included in price</p>
                                                        <p><strong>Returns:</strong> Free returns within 30 days</p>
                                                        <p><strong>Note:</strong> Dust bag included with purchase</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* You May Also Like */}
            {relatedLoading ? (
                <div className="border-t border-gray-200 py-12 bg-gradient-to-b from-white to-gray-50">
                    <div className="max-w-8xl mx-auto px-4">
                        <h3 className="text-xl mb-8" style={{ fontFamily: cssVariables.fontHeading, color: cssVariables.neutral }}>You May Also Like</h3>
                        <div className="flex space-x-6 overflow-hidden">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="flex-shrink-0 w-64 animate-pulse">
                                    <div className="aspect-[2/3] bg-gray-200 rounded-lg mb-3"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : relatedProducts.length > 0 && (
                <div className="border-t border-gray-200 py-12 bg-gradient-to-b from-white to-gray-50">
                    <div className="max-w-8xl mx-auto px-4 relative">
                        <h3 className="text-xl mb-8" style={{ fontFamily: cssVariables.fontHeading, color: cssVariables.neutral }}>You May Also Like</h3>
                        <div className="relative">
                            <button 
                                onClick={() => scrollToSlide(Math.max(currentSlide - 1, 0))} 
                                disabled={currentSlide === 0} 
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <button 
                                onClick={() => scrollToSlide(Math.min(currentSlide + 1, maxSlide))} 
                                disabled={currentSlide === maxSlide} 
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-700" />
                            </button>
                            <div ref={sliderRef} className="overflow-x-auto scrollbar-hide scroll-smooth">
                                <div className="flex space-x-6 min-w-max pb-4">
                                    {relatedProducts.map((item, idx) => (
                                        <Link to={`/${gender}/product/${item._id?.$oid}`} key={item._id?.$oid || idx} className="flex-shrink-0 w-64">
                                            <div className="group cursor-pointer">
                                                <div className="aspect-[2/3] bg-gray-100 mb-3 overflow-hidden rounded-lg relative">
                                                    <img 
                                                        src={item.imgs?.[0]?.url} 
                                                        alt={item.title} 
                                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDI1NiAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMzg0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjggMTkyTDE2MCAyMjRIMTI4VjE5MloiIGZpbGw9IiM5Q0EzQTYiLz4KPC9zdmc+';
                                                        }}
                                                    />
                                                    {item.size && (
                                                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                                                            Size: {item.size}
                                                        </div>
                                                    )}
                                                </div>
                                                <h4 className="text-xs uppercase tracking-widest mb-1 text-gray-500">{item.brand}</h4>
                                                <p className="text-sm mb-2 line-clamp-2 text-gray-900">{item.title}</p>
                                                <p className="text-sm font-medium text-gray-900">${item.price?.amount?.toFixed(2) || '0.00'}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slideDown { animation: slideDown 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default ProductDetailPage;
import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
//import productsData from "../json/productsData.json"; // Fallback local data
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetailPage = () => {
    const [selectedSize, setSelectedSize] = useState('');
    const [activeTab, setActiveTab] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [product, setProduct] = useState(null);

    const { id, gender = 'woman' } = useParams();
    const sliderRef = useRef(null);
    const mobileImageSliderRef = useRef(null);
    const TOKEN = "Bearer 55f707f6b49dbbe14ec6354d-68e7881e65cc94067098b7ab:4b02bdd96ac3b665239151aea7b0faf8";

    // Fetch product by ID
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        fetch(`/api/shop/v1/items/${id}`, {
            headers: { Authorization: TOKEN }
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch product");
            return res.json();
        })
        .then(data => {
            //console.log('Product data:', data.content);
            setProduct(data.content);
            // Set default size from props if available
            if (data.content.props?.size) {
                setSelectedSize(data.content.props.size);
            }
            setIsLoading(false);
        })
        .catch(err => {
            console.error(err);
            setError(err.message);
            setIsLoading(false);
        });
    }, [id]);

useEffect(() => {
    if (!product) return
    
    const fetchRelatedProducts = async () => {
        try {
            const categoryId = product.cats?.[0]?.$oid
            const brand = product.props?.brand
            
            console.log('🔍 Searching related products with:', { 
                categoryId, 
                brand,
                currentProductId: product.item_id?.$oid 
            })

            if (!categoryId && !brand) {
                console.log('❌ No category or brand found')
                setRelatedProducts([])
                return
            }

            // Build query parameters
            const params = new URLSearchParams({
                _pageIndex: '0',
                _pageSize: '12',
                withQuantities: 'true'
            })

            // Try different combinations to get results
            if (categoryId) params.append('categoryId', categoryId)
            if (brand) params.append('brand', brand)

            const apiUrl = `/api/shop/v1/items/listByCategoryAndBrandAndSeason?${params.toString()}`
            console.log('🔗 API URL:', apiUrl)

            const res = await fetch(apiUrl, {
                headers: { Authorization: TOKEN }
            })
            
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
            
            const data = await res.json() // FIXED: Added await
            console.log('📊 API Response:', data)

            // Check if we got any products
            if (data.content && data.content.length > 0) {
                console.log(`✅ Found ${data.content.length} products`)
                
                const filteredProducts = data.content.filter(
                    item => item.item_id?.$oid !== product.item_id?.$oid // FIXED: Use item_id instead of _id
                )
                
                console.log(`🎯 After filtering: ${filteredProducts.length} products`)
                setRelatedProducts(filteredProducts)
            } else {
                console.log('❌ No products found in response')
                setRelatedProducts([])
                
                // Try alternative approach if no results
                tryAlternativeApproach(categoryId, brand)
            }
            
        } catch (err) {
            console.error("Related products error:", err)
            setRelatedProducts([])
        }
    }

    fetchRelatedProducts()
}, [product])


const tryAlternativeApproach = async (categoryId, brand) => {
    console.log('🔄 Trying alternative approach...')
    
    try {
        // Try getting all items and filtering manually
        const res = await fetch(`/api/shop/v1/items?_pageIndex=0&_pageSize=50&withQuantities=true`, {
            headers: { Authorization: TOKEN }
        })
        
        if (res.ok) {
            const data = await res.json()
            console.log('📊 Alternative API response:', data)
            
            if (data.content && data.content.length > 0) {
                let filtered = data.content.filter(item => 
                    item.item_id?.$oid !== product.item_id?.$oid
                )
                
                // Filter by category if available
                if (categoryId) {
                    filtered = filtered.filter(item => 
                        item.cats?.some(cat => cat.$oid === categoryId)
                    )
                }
                
                // Filter by brand if available
                if (brand) {
                    filtered = filtered.filter(item => 
                        item.props?.brand === brand
                    )
                }
                
                console.log(`🎯 Alternative found: ${filtered.length} products`)
                setRelatedProducts(filtered.slice(0, 8)) // Limit to 8
            }
        }
    } catch (error) {
        console.error('❌ Alternative approach failed:', error)
    }
}
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

    // Desktop slider scroll
    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;
        const handleScroll = () => setCurrentSlide(Math.round(slider.scrollLeft / slider.offsetWidth));
        slider.addEventListener('scroll', handleScroll);
        return () => slider.removeEventListener('scroll', handleScroll);
    }, []);

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
        
        const brand = product.props?.brand || 'Unknown Brand';
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

    // Related products fallback to local JSON if API doesn't provide related
    // const relatedProducts = product ? productsData?.productSlider?.products?.filter(
    //     p => p._id?.$oid !== id && p.gender === gender
    // ) || [] : [];

    //const maxSlide = Math.max(0, Math.ceil(relatedProducts.length / visibleItems) - 1);

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
        <div className="min-h-screen bg-white pt-[120px] sm:pt-[140px] md:pt-[160px] lg:pt-[180px]">
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
                                        e.target.src = '/placeholder-image.jpg';
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
                                                    e.target.src = '/placeholder-image.jpg';
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
                        <h2 className="text-sm uppercase tracking-widest mb-2 cursor-pointer" style={{ fontFamily: cssVariables.fontAccent, color: cssVariables.neutral }}>
                            {productDetails.brand}
                        </h2>
                        
                        {/* Title */}
                        <h1 className="text-2xl mb-6" style={{ fontFamily: cssVariables.fontHeading, color: cssVariables.neutral }}>
                            {productDetails.title}
                        </h1>
                        
                        {/* Price */}
                        <div className="mb-2">
                            <span className="text-2xl font-light" style={{ fontFamily: cssVariables.fontBody, color: cssVariables.primary }}>
                                ${productDetails.salePrice.toFixed(2)}
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
                                    disabled={productDetails.quantity === 0}
                                >
                                    {productDetails.quantity === 0 ? 'Out of Stock' : 'Add to cart'}
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
                                            <span className="text-sm uppercase tracking-widest font-medium" style={{ fontFamily: cssVariables.fontAccent, color: cssVariables.neutral }}>
                                                {tab === 'details' ? 'Product Details' : tab === 'composition' ? 'Composition' : 'Shipping & Returns'}
                                            </span>
                                            {isActive ? <ChevronUp className="w-4 h-4" style={{ color: cssVariables.primary }}/> : <ChevronDown className="w-4 h-4" style={{ color: cssVariables.neutral }}/>}
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
            {/* {relatedProducts.length > 0 && (
                <div className="border-t border-gray-200 py-12 bg-gradient-to-b from-white to-gray-50">
                    <div className="max-w-8xl mx-auto px-4 relative">
                        <h3 className="text-xl mb-8" style={{ fontFamily: cssVariables.fontHeading, color: cssVariables.neutral }}>You May Also Like</h3>
                        <div className="relative">
                            <button 
                                onClick={() => setCurrentSlide(Math.max(currentSlide - 1, 0))} 
                                disabled={currentSlide === 0} 
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <button 
                                onClick={() => setCurrentSlide(Math.min(currentSlide + 1, maxSlide))} 
                                disabled={currentSlide === maxSlide} 
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-700" />
                            </button>
                            <div ref={sliderRef} className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                                <div className="flex space-x-6 min-w-max pb-4">
                                    {relatedProducts.map((item, idx) => (
                                        <Link to={`/${gender}/product/${item._id?.$oid}`} key={idx} className="flex-shrink-0 w-64 snap-start">
                                            <div className="group cursor-pointer">
                                                <div className="aspect-[2/3] bg-gray-100 mb-3 overflow-hidden rounded-lg relative">
                                                    <img 
                                                        src={item.imgs?.[0]?.url} 
                                                        alt={item.title} 
                                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                </div>
                                                <h4 className="text-xs uppercase tracking-widest mb-1">{item.brand}</h4>
                                                <p className="text-sm mb-2 line-clamp-2">{item.title}</p>
                                                <p className="text-sm font-medium">${item.price?.amount || '0.00'}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}

            <style>{`
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .snap-x { scroll-snap-type: x mandatory; }
                .snap-start { scroll-snap-align: start; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slideDown { animation: slideDown 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default ProductDetailPage;
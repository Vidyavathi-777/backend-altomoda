import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../Context/CartContext';
import { useUser } from '../Context/UserContext';

const ProductDetailPage = () => {
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeTab, setActiveTab] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [product, setProduct] = useState(null);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    const { sku_parent, gender = 'woman' } = useParams();
    const sliderRef = useRef(null);
    const mobileImageSliderRef = useRef(null);
    const sizeDropdownRef = useRef(null);
    const { addToCart } = useCart();
    const { user } = useUser();

    console.log('User in ProductDetailPage:', user);
    console.log(user.id)
    // Fetch product by parent SKU
    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/products/productBySku/${sku_parent}`,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                console.log('API Response:', data); // Debug log
                
                if (data.status === 'success' && data.data) {
                    console.log('Product data:', data.data);
                    setProduct(data.data);
                    
                    // Set default selected size and variant
                    if (data.data?.variants?.length > 0) {
                        const firstVariant = data.data.variants[0];
                        setSelectedSize(firstVariant.size);
                        setSelectedVariant(firstVariant);
                    }
                } else {
                    throw new Error(data.message || 'Failed to fetch product');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (sku_parent) {
            fetchProduct();
        }
    }, [sku_parent]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target)) {
                setSizeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle size selection
    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        // Find the corresponding variant
        const variant = product?.variants?.find(v => v.size === size);
        setSelectedVariant(variant || null);
        setSizeDropdownOpen(false);
    };

    // Handle quantity change
    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;
        setQuantity(newQuantity);
    };

    // Fetch related products based on parent SKU
    const fetchRelatedProducts = async () => {
        if (!product?.sku_parent) {
            setRelatedLoading(false);
            return;
        }
        
        setRelatedLoading(true);
        try {
            // Extract base SKU pattern for related products
            const baseSku = product.sku_parent.split('_')[0]; // Get the base part before color code
            
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/products/related/${baseSku}`,
                {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            
            const data = await res.json();
            
            // Handle both response formats
            const relatedData = data.related || data.data || [];
            const transformedProducts = relatedData.map(item => {
                const mainImage = item.imgs?.[0] || item.images?.[0] || null;
                return {
                    _id: item._id || item.item_id,
                    sku: item.sku,
                    brand: item.brand || 'Unknown Brand',
                    title: item.title || 'Product',
                    price: item.price?.amount || item.stock_price || item.price || 0,
                    imgs: mainImage ? [{ url: mainImage.url }] : [],
                    color: item.color || '',
                    size: item.size || '',
                    inStock: item.inStock ?? ((item.qty || item.stock || 0) > 0)
                };
            });

            // Remove current product and duplicates, limit to 12
            const uniqueProducts = transformedProducts
                .filter(p => p._id !== product._id)
                .filter((p, index, self) => index === self.findIndex(x => x._id === p._id))
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
    }, [sku_parent]);

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
    const handleImageNext = () => scrollImageToSlide(Math.min(currentImageIndex + 1, (product?.images?.length || 1) - 1));

    // Desktop slider scroll for related products
    const scrollToSlide = (slideIndex) => {
        if (sliderRef.current) {
            const slideWidth = 280;
            sliderRef.current.scrollTo({
                left: slideIndex * (slideWidth * 4),
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
    const getLocalizedText = (field, language = 'en') => {
        if (!product || !product[field]) return '';
        
        if (typeof product[field] === 'object' && product[field] !== null) {
            return product[field][language] || product[field]['en'] || Object.values(product[field])[0] || '';
        }
        
        return product[field] || '';
    };

    // Get localized text for variant size conversion
    const getSizeConversion = (variant, language = 'en') => {
        if (!variant?.size_conversion) return '';
        
        if (typeof variant.size_conversion === 'object') {
            return variant.size_conversion[language] || variant.size_conversion['en'] || Object.values(variant.size_conversion)[0] || '';
        }
        
        return variant.size_conversion || '';
    };

    // Get current price and stock based on selected variant
    const getCurrentPrice = () => {
        return selectedVariant?.price || product?.base_price || 0;
    };

    const getCurrentStock = () => {
        return selectedVariant?.stock || 0;
    };

    const getCurrentBarcode = () => {
        return selectedVariant?.barcode || '';
    };

  const handleAddToCart = async () => {
        if (!user.id) {
            alert('Please login to add items to cart');
            return;
        }

        if (!selectedVariant) {
            alert('Please select a size.');
            return;
        }

        setAddingToCart(true);

        try {
            // Get the variant SKU and current price
            const sku = selectedVariant.sku || product.sku_parent;
            const priceSnapshot = getCurrentPrice();

            // Call addToCart from CartContext with correct parameters
            await addToCart(sku, quantity, priceSnapshot);
            
            // Show success message
            alert(`Added ${quantity} item(s) to cart!`);
            
            // Reset quantity after adding to cart
            setQuantity(1);
        } catch (err) {
            console.error('Failed to add to cart:', err);
            alert(err.message || 'Failed to add item to cart');
        } finally {
            setAddingToCart(false);
        }
    };

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
    if (error) return <div className="min-h-screen flex items-center justify-center pt-[180px] text-red-500">Error: {error}</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center pt-[180px]">Product not found</div>;

    return (
        <div className="min-h-screen bg-white pt-[120px] sm:pt-[140px] md:pt-[160px] lg:pt-[200px]">
            {/* Main Product Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Images - Desktop */}
                    <div className="hidden lg:block space-y-4">
                        {product.images?.map((img, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg overflow-hidden group">
                                <img
                                    src={img.url}
                                    alt={`${getLocalizedText('title')} - ${idx + 1}`}
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
                        {product.images?.length > 1 && (
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
                                    disabled={currentImageIndex === product.images.length - 1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 border border-gray-300 rounded-full p-2 shadow-lg hover:bg-white disabled:opacity-50"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-700" />
                                </button>
                            </>
                        )}
                        <div ref={mobileImageSliderRef} className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                            <div className="flex">
                                {product.images?.map((img, idx) => (
                                    <div key={idx} className="flex-shrink-0 w-full snap-start">
                                        <div className="bg-gray-50 overflow-hidden aspect-[3/4]">
                                            <img
                                                src={img.url}
                                                alt={`${getLocalizedText('title')} - ${idx + 1}`}
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
                        {product.images?.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {product.images.map((_, idx) => (
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
                            {product.brand}
                        </h2>

                        {/* Title */}
                        <h1 className="text-3xl mb-6 font-medium" style={{ fontFamily: cssVariables.fontBody}}>
                            {getLocalizedText('title')}
                        </h1>

                        {/* Price */}
                        <div className="mb-2">
                            <span className="text-2xl font-light" style={{ fontFamily: cssVariables.fontBody }}>
                                Eur {getCurrentPrice().toFixed(2)}
                            </span>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-2">
                            <span className={`text-sm font-medium ${getCurrentStock() > 10 ? 'text-green-600' : getCurrentStock() > 0 ? 'text-[#FFAA6B]' : 'text-gray-600'}`} style={{ fontFamily: cssVariables.fontBody }}>
                                {getCurrentStock() > 10 ? 'In Stock' : getCurrentStock() > 0 ? 'Low Stock' : 'Available for Order'}
                                {getCurrentStock() > 0 && ` (${getCurrentStock()} available)`}
                            </span>
                        </div>

                        {/* Color */}
                        {getLocalizedText('color') && (
                            <div className="mb-2">
                                <span className="text-sm text-gray-600" style={{ fontFamily: cssVariables.fontBody }}>
                                    Color: {getLocalizedText('color')}
                                </span>
                            </div>
                        )}

                        <p className="text-xs text-gray-500 mb-8" style={{ fontFamily: cssVariables.fontBody }}>Import Duties not included</p>

                        {/* Size selection & Add to Cart */}
                        <div className="mb-4 space-y-4">
                            {/* Size Selection Dropdown */}
                            <div className="relative" ref={sizeDropdownRef}>
                                <label className="block text-sm font-medium mb-2" style={{ fontFamily: cssVariables.fontBody }}>
                                    Select Size:
                                </label>
                                <button
                                    onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-left flex justify-between items-center hover:border-gray-500 transition-colors"
                                    style={{ fontFamily: cssVariables.fontBody }}
                                >
                                    <span>
                                        {selectedSize ? (
                                            <>
                                                {selectedSize}
                                                {selectedVariant?.size_conversion && ` (${getSizeConversion(selectedVariant)})`}
                                            </>
                                        ) : (
                                            'Choose a size'
                                        )}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${sizeDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {sizeDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {product.variants?.map((variant) => (
                                            <button
                                                key={variant._id}
                                                onClick={() => handleSizeSelect(variant.size)}
                                                className={`w-full px-4 py-3 text-left border-b border-gray-100 last:border-b-0 transition-colors ${
                                                    selectedSize === variant.size
                                                        ? 'bg-gray-100 text-black'
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                                style={{ fontFamily: cssVariables.fontBody }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span>
                                                        {variant.size}
                                                        {variant.size_conversion && ` (${getSizeConversion(variant)})`}
                                                    </span>
                                                    <span className={`text-xs ${
                                                        variant.stock > 10 ? 'text-green-600' : 
                                                        variant.stock > 0 ? 'text-[#FFAA6B]' : 
                                                        'text-gray-400'
                                                    }`}>
                                                        {variant.stock > 0 ? `${variant.stock} available` : 'Available for order'}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            {selectedSize && (
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ fontFamily: cssVariables.fontBody }}>
                                        Quantity:
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            disabled={quantity <= 1}
                                            className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-500 transition-colors"
                                        >
                                            <span className="text-lg">-</span>
                                        </button>
                                        <span className="w-12 text-center text-lg" style={{ fontFamily: cssVariables.fontBody }}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            disabled={getCurrentStock() > 0 && quantity >= getCurrentStock()}
                                            className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-500 transition-colors"
                                        >
                                            <span className="text-lg">+</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Add to Cart Button */}

<button
    className="w-full rounded-2xl text-white py-5 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
    style={{ backgroundColor: cssVariables.primary, fontFamily: cssVariables.fontAccent }}
    onMouseEnter={e => !addingToCart && (e.target.style.backgroundColor = cssVariables.secondary)}
    onMouseLeave={e => e.target.style.backgroundColor = cssVariables.primary}
    onClick={handleAddToCart}
    disabled={!selectedSize || addingToCart}
>
    {addingToCart ? (
        <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding to Cart...
        </>
    ) : (
        !selectedSize ? 'Select a Size' : 'Add to Cart'
    )}
</button>

                        </div>

                        {/* Model Measurements */}
                        {selectedVariant?.model_measurements && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-sm font-medium mb-2" style={{ fontFamily: cssVariables.fontBody }}>
                                    Model Measurements (Size {selectedSize}):
                                </h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(selectedVariant.model_measurements).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="capitalize" style={{ fontFamily: cssVariables.fontBody }}>
                                                {key}:
                                            </span>
                                            <span style={{ fontFamily: cssVariables.fontBody }}>{value} cm</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Accordion */}
                        <div className="space-y-0 border-t border-gray-200">
                            {['details', 'composition', 'care', 'shipping'].map((tab) => {
                                const isActive = activeTab === tab;
                                return (
                                    <div key={tab} className="border-b border-gray-200 transition-colors duration-300 hover:bg-gray-50">
                                        <button onClick={() => toggleTab(tab)} className="w-full flex items-center justify-between py-4 text-left transition-colors duration-300">
                                            <span className="text-sm uppercase tracking-widest font-medium" style={{ fontFamily: cssVariables.fontAccent }}>
                                                {tab === 'details' ? 'Product Details' : 
                                                 tab === 'composition' ? 'Composition' : 
                                                 tab === 'care' ? 'Care Instructions' : 
                                                 'Shipping & Returns'}
                                            </span>
                                            {isActive ? <ChevronUp className="w-4 h-4" style={{ color: cssVariables.primary }} /> : <ChevronDown className="w-4 h-4" style={{ color: cssVariables.neutral }} />}
                                        </button>
                                        {isActive && (
                                            <div className="pb-4 text-sm space-y-2 animate-slideDown" style={{ fontFamily: cssVariables.fontBody, color: cssVariables.neutral }}>
                                                {tab === 'details' && (
                                                    <div className="space-y-3">
                                                        <div dangerouslySetInnerHTML={{ __html: getLocalizedText('description') }} />
                                                        <div className="pt-2 border-t border-gray-100 space-y-2">
                                                            <p><strong>SKU Parent:</strong> {product.sku_parent}</p>
                                                            <p><strong>Variant SKU:</strong> {selectedVariant?.sku}</p>
                                                            <p><strong>Barcode:</strong> {getCurrentBarcode()}</p>
                                                            {getLocalizedText('made') && <p><strong>Made In:</strong> {getLocalizedText('made')}</p>}
                                                            {getLocalizedText('sex') && <p><strong>Gender:</strong> {getLocalizedText('sex')}</p>}
                                                            {getLocalizedText('fastening') && <p><strong>Fastening:</strong> {getLocalizedText('fastening')}</p>}
                                                            {product.season && <p><strong>Season:</strong> {product.season}</p>}
                                                        </div>
                                                    </div>
                                                )}
                                                {tab === 'composition' && (
                                                    <div>
                                                        {product.composition?.length > 0 ? (
                                                            <ul className="space-y-1">
                                                                {product.composition.map((comp, idx) => (
                                                                    <li key={idx}>
                                                                        {getLocalizedText('material', comp.material)} - {comp.perc}%
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p>No composition information available.</p>
                                                        )}
                                                    </div>
                                                )}
                                                {tab === 'care' && (
                                                    <div>
                                                        {getLocalizedText('care') ? (
                                                            <p>{getLocalizedText('care')}</p>
                                                        ) : (
                                                            <p>No care instructions available.</p>
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
                                        <Link to={`/${gender}/product/${item.sku_parent || item._id}`} key={item._id || idx} className="flex-shrink-0 w-64">
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
                                                <p className="text-sm font-medium text-gray-900">${item.price?.toFixed(2) || '0.00'}</p>
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
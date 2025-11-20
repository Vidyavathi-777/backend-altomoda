import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react';
import { useCart } from '../Context/CartContext';
import { transformProduct } from '../api/productsApi';
import TryOnModal from '../components/Tryon';
import { Sparkle } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from '../components/BreadCrumb';
import { Navigate, useNavigate } from 'react-router-dom';
import tryLook from '../assets/tryTheLook.png'
import { convertPriceToINR } from '../utils/CurrencyConversion';


const ProductDetailPage = () => {
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeTab, setActiveTab] = useState('details');
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
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [showTryOn, setShowTryOn] = useState(false);



    const { sku_parent, gender = 'woman' } = useParams();
    const sliderRef = useRef(null);
    const mobileImageSliderRef = useRef(null);
    const sizeDropdownRef = useRef(null);
    const { addToCart } = useCart();
    const navigate = useNavigate();

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

                if (data.success && data.data) {
                    setProduct(data.data);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target)) {
                setSizeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setLightboxOpen(false);
            }
        };

        if (lightboxOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [lightboxOpen]);

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        const variant = product?.variants?.find(v => v.size === size);
        setSelectedVariant(variant || null);
        setSizeDropdownOpen(false);
    };

    // const handleQuantityChange = (newQuantity) => {
    //     if (newQuantity < 1) return;
    //     setQuantity(newQuantity);
    // };

    const fetchRelatedProducts = async () => {
        if (!product?.sku_parent) {
            setRelatedLoading(false);
            return;
        }

        setRelatedLoading(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/products/related/${product.sku_parent}`,
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
            const relatedData = data.data?.products || [];

            if (!Array.isArray(relatedData) || relatedData.length === 0) {
                setRelatedProducts([]);
                return;
            }

            const relatedTransformedProducts = relatedData.map(transformProduct);
            setRelatedProducts(relatedTransformedProducts);
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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [sku_parent]);

    const openLightbox = (index) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const navigateLightbox = (direction) => {
        const totalImages = product?.images?.length || 0;
        if (direction === 'next') {
            setLightboxIndex((prev) => (prev + 1) % totalImages);
        } else {
            setLightboxIndex((prev) => (prev - 1 + totalImages) % totalImages);
        }
    };

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

    useEffect(() => {
        const mobileSlider = mobileImageSliderRef.current;
        if (!mobileSlider) return;
        const handleMobileScroll = () => setCurrentImageIndex(Math.round(mobileSlider.scrollLeft / mobileSlider.offsetWidth));
        mobileSlider.addEventListener('scroll', handleMobileScroll);
        return () => mobileSlider.removeEventListener('scroll', handleMobileScroll);
    }, []);

    const getVisibleItems = () => {
        if (typeof window === 'undefined') return 4;
        if (window.innerWidth >= 1024) return 4;
        if (window.innerWidth >= 768) return 3;
        return 2;
    };

    const visibleItems = getVisibleItems();

    const getLocalizedText = (field, language = 'en') => {
        if (!product || !product[field]) return '';

        const fieldValue = product[field];

        if (typeof fieldValue === 'string') {
            return fieldValue;
        }

        if (typeof fieldValue === 'object' && fieldValue !== null) {
            return fieldValue[language] || fieldValue['en'] || Object.values(fieldValue)[0] || '';
        }

        return String(fieldValue || '');
    };

    const getSizeConversion = (variant, language = 'en') => {
        if (!variant?.size_conversion) return '';

        const conversion = variant.size_conversion;

        if (typeof conversion === 'string') return conversion;

        if (typeof conversion === 'object' && conversion !== null) {
            return conversion[language] || conversion['en'] || Object.values(conversion)[0] || '';
        }

        return String(conversion || '');
    };
const getCurrentPrice = () => {
    let price = selectedVariant.minPrice || product?.base_price || 0;
    const convertedPrice = convertPriceToINR(price);
    return convertedPrice.toLocaleString('en-IN');
};

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            alert('Please select a size.');
            return;
        }

        setAddingToCart(true);

        try {
            const sku = selectedVariant.sku || product.sku_parent;
            const priceSnapshot = getCurrentPrice();

            await addToCart(sku, quantity, priceSnapshot);
            toast.success("Added to cart!");
            setQuantity(1);
        } catch (err) {
            toast.error("Something went wrong!");
            console.error('Failed to add to cart:', err);
            // alert(err.message || 'Failed to add item to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const maxSlide = Math.max(0, Math.ceil(relatedProducts.length / visibleItems) - 1);


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white pt-16 md:pt-20">
                <div className="text-center px-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase text-gray-600"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Loading
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white lg:pt-[200px] md:pt-24 px-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl md:text-3xl mb-4 font-light" style={{ fontFamily: 'Didot, serif' }}>Product Not Found</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{error}</p>
                    <Link
                        to="/"
                        className="inline-block border border-black px-6 md:px-8 py-2 md:py-3 hover:bg-black hover:text-white transition-all duration-300 tracking-wider text-xs md:text-sm"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white pt-16 md:pt-20">
                <p className="text-base md:text-lg tracking-wider text-gray-600" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Product not found
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-20 md:pt-28 lg:pt-32">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
                
                @font-face {
                    font-family: 'Didot';
                    src: local('Didot'), local('Didot LT STD');
                    font-weight: normal;
                    font-style: normal;
                }

                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }

                .gold-gradient {
                    background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                /* Gold Gradient */
                .lux-gold {
                    background: linear-gradient(145deg, #f7e9b5, #d4af37);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                /* Glow Animation */
                @keyframes goldGlow {
                    0% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.4); }
                    50% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.9); }
                    100% { box-shadow: 0 0 5px rgba(212, 175, 55, 0.4); }
                }

                /* Floating Animation */
                @keyframes floatSparkle {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-4px); }
                    100% { transform: translateY(0px); }
                }


}


            `}</style>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 md:top-6 right-4 md:right-6 text-white hover:text-gold transition-colors z-10"
                    >
                        <X className="w-6 h-6 md:w-8 md:h-8" />
                    </button>

                    <button
                        onClick={() => navigateLightbox('prev')}
                        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-white hover:text-gold transition-colors z-10"
                    >
                        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>

                    <button
                        onClick={() => navigateLightbox('next')}
                        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-white hover:text-gold transition-colors z-10"
                    >
                        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                    </button>

                    <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center p-4 md:p-8">
                        <img
                            src={product.images[lightboxIndex]?.url || product.images[lightboxIndex]}
                            alt={`${getLocalizedText('title')} - ${lightboxIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>

                    <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 md:gap-2">
                        {product.images?.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setLightboxIndex(idx)}
                                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${lightboxIndex === idx ? 'bg-gold scale-125' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Main Product Section */}
            <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-12 lg:pt-[120px] py-8 md:py-12 lg:py-16 pt-[100px]">
                <p
                    onClick={() => navigate(-1)}
                    className="cursor-pointer text-gray-600 hover:text-black"
                >
                    Back
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-24">
                    {/* Product Images - Desktop */}
                    {/* Product Images - Desktop */}
                    <div className="hidden lg:flex">
                        {/* Thumbnails */}
                        <div className="w-20 mr-4 space-y-2 flex-shrink-0">
                            {product.images?.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        const element = document.getElementById(`product-image-${idx}`);
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                        }
                                    }}
                                    className={`w-full aspect-[3/4] bg-gray-50 overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-gold' : 'border-transparent'}`}
                                >
                                    <img
                                        src={img.url || img}
                                        alt={`${getLocalizedText('title')} - ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Main Image Scroll Area */}
                        <div className="hidden lg:block space-y-4 md:space-y-6">
                            <div className="space-y-4">
                                {product.images?.map((img, idx) => (
                                    <div
                                        key={idx}
                                        id={`product-image-${idx}`}
                                        className="bg-gray-50 overflow-hidden group relative"
                                    >



                                        <img
                                            src={img.url || img}
                                            alt={`${getLocalizedText('title')} - ${idx + 1}`}
                                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjM4NCIgdmlld0JveD0iMCAwIDI1NiAzODQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMzg0IiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+';
                                            }}
                                            onClick={() => openLightbox(idx)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Images - Mobile */}
                    <div className="lg:hidden">
                        {/* Main Image */}
                        <div className="relative mb-4">
                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={handleImagePrev}
                                        disabled={currentImageIndex === 0}
                                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 text-black w-8 h-8 md:w-10 md:h-10 flex items-center justify-center disabled:opacity-30 transition-all shadow-lg"
                                    >
                                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 " />
                                    </button>
                                    <button
                                        onClick={handleImageNext}
                                        disabled={currentImageIndex === product.images.length - 1}
                                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10  w-8 h-8 md:w-10 md:h-10 flex items-center justify-center disabled:opacity-30 transition-all shadow-lg"
                                    >
                                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                    </button>
                                </>
                            )}
                            <div
                                ref={mobileImageSliderRef}
                                className={`overflow-x-auto scrollbar-hide snap-x snap-mandatory ${showTryOn ? "pointer-events-none" : ""}`}
                            >

                                <div className="flex">
                                    {product.images?.map((img, idx) => (
                                        <div key={idx} className="flex-shrink-0 w-full snap-start">
                                            <div className="bg-gray-50 overflow-hidden aspect-[3/4] relative">
                                                <img
                                                    src={img.url || img}
                                                    onClick={() => openLightbox(currentImageIndex)}
                                                    alt={`${getLocalizedText('title')} - ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide px-2 py-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => scrollImageToSlide(idx)}
                                        className={`flex-shrink-0 w-12 h-16 bg-gray-50 overflow-hidden border transition-all ${currentImageIndex === idx ? 'border-gold' : 'border-transparent'}`}
                                    >
                                        <img
                                            src={img.url || img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="lg:sticky lg:top-24 lg:self-start space-y-6 md:space-y-8">
                        {/* Brand & Title */}
                        <div>
                            <h2
                                className="text-base md:text-lg lg:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3 text-gray-600"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                                {product.brand}
                            </h2>
                            <h1
                                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight font-light mb-3 md:mb-4"
                                style={{ fontFamily: 'Didot, serif' }}
                            >
                                {getLocalizedText('title')}
                            </h1>
                            <p className="text-base md:text-lg text-gray-600 leading-relaxed"
                                style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                {getLocalizedText('description')?.replace(/<[^>]*>/g, '').substring(0, 150)}...
                            </p>
                        </div>

                        {/* Price */}
                        <div className="border-t border-b border-gray-200 py-4 md:py-6">
                            <span
                                className="text-xl md:text-2xl tracking-wide"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                                RS. {getCurrentPrice()}
                            </span>
                            {/* <p
                                className="text-[10px] md:text-xs text-gray-500 mt-2 tracking-wider"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                            >
                                IMPORT DUTIES NOT INCLUDED
                            </p> */}
                        </div>

                        {/* Size Selection */}
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex justify-between items-center">
                                <label
                                    className="text-xs md:text-sm tracking-[0.2em] uppercase"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    Select Size
                                </label>
                                <button
                                    className="text-[10px] md:text-xs underline hover:no-underline tracking-wider text-gray-600"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    SIZE GUIDE
                                </button>
                            </div>

                            <div className="relative" ref={sizeDropdownRef}>
                                <button
                                    onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
                                    className="w-full px-4 md:px-6 py-3 md:py-4 border border-black text-left flex justify-between items-center hover:bg-gray-50 transition-colors text-sm md:text-base"
                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                >
                                    <span className="tracking-wider">
                                        {selectedSize ? (
                                            <>
                                                {selectedSize}
                                                {selectedVariant?.size_conversion && ` (${getSizeConversion(selectedVariant)})`}
                                            </>
                                        ) : (
                                            'CHOOSE A SIZE'
                                        )}
                                    </span>
                                    <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${sizeDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {sizeDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-black shadow-xl max-h-60 md:max-h-80 overflow-auto animate-fadeIn">
                                        {product.variants?.map((variant) => (
                                            <button
                                                key={variant._id}
                                                onClick={() => handleSizeSelect(variant.size)}
                                                className={`w-full px-4 md:px-6 py-3 md:py-4 text-left border-b border-gray-100 last:border-b-0 transition-colors text-sm md:text-base ${selectedSize === variant.size
                                                    ? 'bg-black text-white'
                                                    : 'hover:bg-gray-50'
                                                    }`}
                                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="tracking-wider">
                                                        {variant.size}
                                                        {variant.size_conversion && ` (${getSizeConversion(variant)})`}
                                                    </span>
                                                    {/* <span className={`text-[10px] md:text-xs tracking-wider ${selectedSize === variant.size ? 'text-white' : 'text-gray-500'
                                                        }`}>
                                                        {variant.stock > 0 ? 'IN STOCK' : 'PRE-ORDER'}
                                                    </span> */}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className="space-y-3 md:space-y-4">
                            <div className='flex justify-between'>
                                {/* <div className="flex items-center gap-3 md:gap-4">
                                    <div className="flex items-center border border-black">
                                        <button
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            className="px-3 md:px-4 py-2 md:py-3 hover:bg-gray-50 transition-colors"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="w-3 h-3 md:w-4 md:h-4" />
                                        </button>
                                        <span
                                            className="px-4 md:px-6 py-2 md:py-3 text-center min-w-[50px] md:min-w-[60px] tracking-wider text-sm md:text-base"
                                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                                        >
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            className="px-3 md:px-4 py-2 md:py-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                        </button>
                                    </div>
                                </div> */}
                                <div>
                                    <div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowTryOn(true);
                                            }}
                                            className="w-50 h-14 flex items-center justify-center rounded-xl border border-gray-300 
               animate-[colorPulse_3s_infinite] transition-all duration-300"
                                        >
                                            <img
                                                src={tryLook}
                                                alt="Try On"
                                                className="w-40 h-30 object-contain"
                                            />
                                        </button>
                                    </div>

                                </div>
                            </div>

                            <button
                                className="w-full py-4 md:py-5 bg-black text-white text-xs md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                                onClick={handleAddToCart}
                                disabled={!selectedSize || addingToCart}
                            >
                                {addingToCart ? 'ADDING TO CART...' : !selectedSize ? 'SELECT A SIZE' : 'ADD TO CART'}
                            </button>
                        </div>

                        {/* Product Details Tabs */}
                        <div className="border-t border-gray-200 pt-4 md:pt-6">
                            <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 mb-4 -mx-4 px-4 md:mx-0 md:px-0">
                                {[
                                    { key: 'details', label: 'Product Details' },
                                    { key: 'composition', label: 'Composition' }
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`px-4 md:px-6 py-3 text-xs md:text-sm uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap ${activeTab === tab.key
                                            ? 'border-gold text-black'
                                            : 'border-transparent text-gray-500 hover:text-black'
                                            }`}
                                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="animate-fadeIn">
                                {activeTab === 'details' && (
                                    <div className="space-y-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                        <div className="text-base md:text-lg leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: getLocalizedText('description') }} />

                                        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                <span className="text-sm uppercase tracking-wider text-gray-600"
                                                    style={{ fontFamily: 'Montserrat, sans-serif' }}>SKU</span>
                                                <span className="text-base">{product.sku_parent}</span>
                                            </div>
                                            {getLocalizedText('made') && (
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm uppercase tracking-wider text-gray-600"
                                                        style={{ fontFamily: 'Montserrat, sans-serif' }}>Made In</span>
                                                    <span className="text-base">{getLocalizedText('made')}</span>
                                                </div>
                                            )}
                                            {getLocalizedText('sex') && (
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm uppercase tracking-wider text-gray-600"
                                                        style={{ fontFamily: 'Montserrat, sans-serif' }}>Gender</span>
                                                    <span className="text-base">{getLocalizedText('sex')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'composition' && (
                                    <div className="space-y-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                        {product.composition?.length > 0 && (
                                            <div>
                                                <h4 className="text-lg md:text-xl font-semibold mb-3" style={{ fontFamily: 'Didot, serif' }}>
                                                    Material Composition
                                                </h4>
                                                <div className="space-y-2">
                                                    {product.composition.map((comp, idx) => {
                                                        const material = comp.material;
                                                        let materialText = '';

                                                        if (typeof material === 'string') {
                                                            materialText = material;
                                                        } else if (typeof material === 'object' && material !== null) {
                                                            materialText = material.en || material.it || material.es || material.nl || material.zh ||
                                                                Object.values(material)[0] || '';
                                                        }

                                                        return (
                                                            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                                                                <span className="text-base md:text-lg">{String(materialText)}</span>
                                                                <span className="text-base md:text-lg font-light">{comp.perc}%</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {getLocalizedText('care') && (
                                            <div className="pt-4 border-t border-gray-200">
                                                <h4 className="text-lg md:text-xl font-semibold mb-3" style={{ fontFamily: 'Didot, serif' }}>
                                                    Care Instructions
                                                </h4>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="text-base md:text-lg leading-relaxed">{getLocalizedText('care')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Section - RESTORED */}
            {relatedLoading ? (
                <div className="border-t border-gray-200 py-8 md:py-12 bg-gray-50">
                    <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-12">
                        <h3
                            className="text-2xl md:text-3xl mb-8 md:mb-12 tracking-wider text-center"
                            style={{ fontFamily: 'Didot, serif' }}
                        >
                            You May Also Like
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="animate-pulse">
                                    <div className="aspect-[3/4] bg-gray-200 mb-3 md:mb-4"></div>
                                    <div className="h-3 md:h-4 bg-gray-200 mb-2 w-3/4"></div>
                                    <div className="h-3 md:h-4 bg-gray-200 w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : relatedProducts.length > 0 && (
                <div className="border-t border-gray-200 py-8 md:py-12 lg:py-16 bg-gray-50">
                    <div className="max-w-[1800px] mx-auto px-4 md:px-6 lg:px-12">
                        <h3
                            className="text-2xl md:text-3xl mb-8 md:mb-12 tracking-wider text-center"
                            style={{ fontFamily: 'Didot, serif' }}
                        >
                            You May Also Like
                        </h3>
                        <div className="relative">
                            {relatedProducts.length > visibleItems && (
                                <>
                                    <button
                                        onClick={() => scrollToSlide(Math.max(currentSlide - 1, 0))}
                                        disabled={currentSlide === 0}
                                        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white w-10 h-10 md:w-12 md:h-12 items-center justify-center shadow-lg disabled:opacity-30 transition-all border border-gray-200"
                                    >
                                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                    <button
                                        onClick={() => scrollToSlide(Math.min(currentSlide + 1, maxSlide))}
                                        disabled={currentSlide === maxSlide}
                                        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white w-10 h-10 md:w-12 md:h-12 items-center justify-center shadow-lg disabled:opacity-30 transition-all border border-gray-200"
                                    >
                                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                </>
                            )}
                            <div ref={sliderRef} className="overflow-x-auto scrollbar-hide scroll-smooth">
                                <div className="flex gap-4 md:gap-6 lg:gap-8 min-w-max pb-4">
                                    {relatedProducts.map((item, idx) => (
                                        <Link
                                            to={`/${gender}/product/${item.sku}`}
                                            key={item._id || idx}
                                            className="flex-shrink-0 w-48 md:w-64 lg:w-80 group"
                                        >
                                            <div className="cursor-pointer">
                                                <div className="aspect-[3/4] bg-gray-100 mb-3 md:mb-4 overflow-hidden">
                                                    <img
                                                        src={item.images[0]}
                                                        alt={item.productName}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                </div>
                                                <h4
                                                    className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1 md:mb-2 text-gray-600"
                                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                                >
                                                    {item.brand}
                                                </h4>
                                                <p
                                                    className="text-sm md:text-base lg:text-lg mb-2 md:mb-3 line-clamp-2 leading-relaxed font-light"
                                                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                                                >
                                                    {item.productName}
                                                </p>
                                                <p
                                                    className="text-xs md:text-sm tracking-wider"
                                                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                                                >
                                                    RS. {item.minPrice?.toFixed(2) || '0.00'}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <TryOnModal
                open={showTryOn}
                onClose={() => setShowTryOn(false)}
                productImage={product.images?.[0]}
            />

        </div>

    );
};

export default ProductDetailPage;
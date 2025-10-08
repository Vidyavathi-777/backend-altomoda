import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import productsData from "../json/productsData.json"
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ProductDetailPage = () => {
    const [selectedSize, setSelectedSize] = useState('40 - IT');
    const [activeTab, setActiveTab] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const id = useParams().id
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const {gender = 'woman'} = useParams()

    const sliderRef = useRef(null);
    const product = productsData.productSlider.products.find(p => p.id === Number(id));
    const relatedProducts = productsData.productSlider.products.filter(p => p.id !== Number(id) && p.gender === gender);

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
    }

    const toggleTab = (tab) => {
        setActiveTab(activeTab === tab ? null : tab);
    };

    const scrollToSlide = (slideIndex) => {
        if (sliderRef.current) {
            const slideWidth = sliderRef.current.offsetWidth;
            sliderRef.current.scrollTo({
                left: slideIndex * slideWidth,
                behavior: 'smooth'
            });
            setCurrentSlide(slideIndex);
        }
    };

    const handlePrev = () => {
        const newSlide = Math.max(currentSlide - 1, 0);
        scrollToSlide(newSlide);
    };

    const handleNext = () => {
        const newSlide = Math.min(currentSlide + 1, Math.ceil(relatedProducts.length / 4) - 1);
        scrollToSlide(newSlide);
    };

    // Update current slide on scroll
    useEffect(() => {
        const slider = sliderRef.current;
        if (!slider) return;

        const handleScroll = () => {
            const slideIndex = Math.round(slider.scrollLeft / slider.offsetWidth);
            setCurrentSlide(slideIndex);
        };

        slider.addEventListener('scroll', handleScroll);
        return () => slider.removeEventListener('scroll', handleScroll);
    }, []);

    // Calculate visible items based on screen size
    const getVisibleItems = () => {
        if (typeof window === 'undefined') return 4;
        if (window.innerWidth >= 1024) return 4;
        if (window.innerWidth >= 768) return 3;
        return 2;
    };

    const visibleItems = getVisibleItems();
    const maxSlide = Math.ceil(relatedProducts.length / visibleItems) - 1;

    return (
        <div className="min-h-screen bg-white pt-[120px] sm:pt-[140px] md:pt-[160px] lg:pt-[180px]">
            {/* Main Product Section */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Images - Desktop (Left Side) */}
                    <div className="hidden lg:block">
                        <div className="space-y-4">
                            {product.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`${product.name} - ${idx + 1}`}
                                    className="w-full"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Product Images - Mobile (Swipeable) */}
                    <div className="lg:hidden">
                        <div className="relative">
                            <img
                                src={product.images[currentImageIndex]}
                                alt={product.name}
                                className="w-full"
                            />
                            <div className="flex justify-center gap-2 mt-4">
                                {product.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-2 h-2 rounded-full ${currentImageIndex === idx ? 'bg-black' : 'bg-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Info - Right Side */}
                    <div className="lg:sticky lg:top-8 lg:self-start pt-8">
                        {/* Tag */}
                        {product.tag && (
                            <div className="mb-4">
                                <span className="text-xs uppercase tracking-wider border border-black px-3 py-1">
                                    {product.tag}
                                </span>
                            </div>
                        )}

                        {/* Brand */}
                        <h2 className="text-sm uppercase tracking-wider mb-2 cursor-pointer hover:underline">
                            {product.brand}
                        </h2>

                        {/* Product Name */}
                        <h1 className="text-2xl mb-6">{product.name}</h1>

                        {/* Price */}
                        <div className="mb-2">
                            <span className="text-2xl font-light">
                                <span className="mr-1">€</span>
                                {product.price}
                            </span>
                        </div>

                        {/* VAT Info */}
                        <p className="text-xs text-gray-600 mb-8">Import Duties not included</p>

                        {/* Size Guide Link */}
                        <div className="mb-4">
                            <button className="text-sm underline hover:no-underline">
                                size guide
                            </button>
                        </div>

                        {/* Size Selection */}
                        <div className="mb-4 relative flex justify-between  gap-4">
                            <div className="relative w-full">
                                <ChevronDown className="w-4 h-4 absolute right-3 top-5 pointer-events-none" />
                                <select
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    className=" w-full border border-gray-300 px-4 py-5 text-sm appearance-none rounded-md bg-white cursor-pointer focus:outline-none focus:border-black"
                                >
                                    <option disabled>Select size</option>
                                    {product.sizes.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='w-full '>
                                <button className="w-full bg-gray-800 rounded-2xl text-white py-5 text-sm uppercase tracking-wider hover:bg-gray-400 transition mb-12">
                                    Add to cart
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}


                        {/* Accordion Tabs */}
                        <div className="space-y-0 border-t border-gray-200">
                            {/* Details Tab */}
                            <div className="border-b border-gray-200">
                                <button
                                    onClick={() => toggleTab('details')}
                                    className="w-full flex items-center justify-between py-4 text-left"
                                >
                                    <span className="text-sm uppercase tracking-wider font-medium">Details</span>
                                    {activeTab === 'details' ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                                {activeTab === 'details' && (
                                    <div className="pb-4 text-sm space-y-4">
                                        <p className="text-gray-700 leading-relaxed">{product.description}</p>
                                        <p><strong>Sku</strong>: {product.sku}</p>
                                        <p><strong>Care</strong>: {product.care}</p>
                                        <p><strong>Made</strong>: {product.madeIn}</p>
                                    </div>
                                )}
                            </div>

                            {/* Size & Fits Tab */}
                            <div className="border-b border-gray-200">
                                <button
                                    onClick={() => toggleTab('size')}
                                    className="w-full flex items-center justify-between py-4 text-left"
                                >
                                    <span className="text-sm uppercase tracking-wider font-medium">Size&Fits</span>
                                    {activeTab === 'size' ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                                {activeTab === 'size' && (
                                    <div className="pb-4 text-sm">
                                        <p><strong>Size conversion</strong>: IT</p>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Tab */}
                            <div className="border-b border-gray-200">
                                <button
                                    onClick={() => toggleTab('shipping')}
                                    className="w-full flex items-center justify-between py-4 text-left"
                                >
                                    <span className="text-sm uppercase tracking-wider font-medium">Shipping</span>
                                    {activeTab === 'shipping' ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>
                                {activeTab === 'shipping' && (
                                    <div className="pb-4 text-sm">
                                        <p>Complimentary Standard delivery: 2 to 5 business days</p>
                                        <p>Taxes & Duties are not included.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* You May Also Like Section */}
            <div className="border-t border-gray-200 py-12">
                <div className="max-w-8xl mx-auto px-4 relative">
                    <h3 className="text-xl mb-8">You May Also Like</h3>
                    <div className="relative">
                        <button
                            onClick={handlePrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentSlide === 0}
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>

                        <button
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white border border-gray-300 rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentSlide === maxSlide}
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                        <div
                            ref={sliderRef}
                            className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        >
                            <div className="flex space-x-6 min-w-max pb-4">
                                {relatedProducts.map((item, idx) => (
                                    <Link
                                        to={`/${gender}/product/${item.id}`}
                                        key={idx}
                                        className="flex-shrink-0 w-64 snap-start"
                                    >
                                        <div className="group cursor-pointer">
                                            <div className="aspect-[2/3] bg-gray-100 mb-3 overflow-hidden rounded-lg">
                                                <img
                                                    src={item.coverImage.src}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <h4 className="text-xs uppercase tracking-wider mb-1 hover:underline">
                                                {item.brand}
                                            </h4>
                                            <p className="text-sm mb-2 line-clamp-2">{item.name}</p>
                                            <p className="text-sm font-medium">
                                                <span className="mr-1">€</span>{item.price}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .snap-x {
                    scroll-snap-type: x mandatory;
                }
                .snap-start {
                    scroll-snap-align: start;
                }
            `}</style>
        </div>
    );
};

export default ProductDetailPage;
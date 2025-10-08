import { useEffect, useState } from 'react';
import { Search, ShoppingBag, Menu, X, User, ChevronRight } from 'lucide-react';
import NavItems from './NavItems';

const Header = ({ currentGender, onGenderChange }) => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [itemCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Set CSS variable for header height
    useEffect(() => {
        const updateHeaderHeight = () => {
            // When scrolled: top-banner (36px) + nav (53px) = ~89px
            // When not scrolled: top-banner (36px) + logo section (~120px) + nav (53px) = ~209px
            const headerHeight = isScrolled ? '89px' : '209px';
            document.documentElement.style.setProperty('--header-height', headerHeight);
        };
        
        updateHeaderHeight();
    }, [isScrolled]);

    return (
        <header className="w-full bg-white">
            {/* Top banner - Always visible on desktop, hidden on mobile */}
            <div className="bg-black text-white text-center py-3 px-4 hidden lg:flex justify-between items-center text-[10px] sm:text-xs">
                <div className="text-left">
                    REST OF THE WORLD - EN - €
                </div>
                <div className="flex-1 text-center tracking-wider uppercase">
                    TAXES AND CUSTOMS DUTIES ARE NOT INCLUDED AND MAY BE CHARGED UPON DELIVERY
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <button className="hover:opacity-70 transition">
                        Account: Log in
                    </button>
                    <button className="hover:opacity-70 transition">
                        Bag: ({itemCount})
                    </button>
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="hover:opacity-70 transition"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Main header */}
            <div className={`border-b border-gray-200 bg-white transition-all duration-300 ${isScrolled ? 'lg:fixed lg:top-9 lg:left-0 lg:right-0 lg:z-50 lg:shadow-md' : ''}`}>
                <div className="max-w-7xl mx-auto px-4">
                    {/* Mobile/Tablet Header */}
                    <div
                        className={`flex items-center justify-between py-4 lg:hidden bg-white transition-all duration-300 ${isScrolled ? 'fixed top-0 left-0 right-0 z-50 px-4 shadow-md' : ''}`}
                    >
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <a href="/" className="flex items-center">
                            <div className="text-4xl font-bold tracking-tighter">
                                Altomoda
                            </div>
                        </a>

                        <div className="flex items-center gap-2">
                            <button className="p-2">
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="p-2">
                                <ShoppingBag className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Desktop Logo - Hidden when scrolled */}
                    {!isScrolled && (
                        <div className="hidden lg:flex justify-center py-8">
                            <a href="/" className="flex items-center">
                                <div className="text-4xl font-bold tracking-tighter" >
                                    Altomoda
                                </div>
                            </a>
                        </div>
                    )}
                </div>

                <NavItems
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                    currentGender={currentGender}
                    onGenderChange={onGenderChange}
                />
            </div>
            
            {/* Spacer for mobile when header is fixed */}
            {isScrolled && <div className="lg:hidden h-[72px]" />}
            
            {/* Spacer for desktop when header is fixed */}
            {isScrolled && <div className="hidden lg:block h-[8px]" />}
        </header>
    );
};

export default Header;
import { useEffect, useState } from 'react';
import { Search, ShoppingBag, Menu, X, User, ChevronRight } from 'lucide-react';
import NavItems from './NavItems';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../Context/CartContext';
import { useUser } from  "../../Context/UserContext"


const Header = ({ currentGender, onGenderChange }) => {
    const { getCartItemCount } = useCart()
    const [itemCount, setItemCount] = useState(getCartItemCount());
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout } = useUser();


    useEffect(() => {
        const updateHeaderHeight = () => {
            const headerHeight = isScrolled ? '89px' : '209px';
            document.documentElement.style.setProperty('--header-height', headerHeight);
        };

        updateHeaderHeight();
    }, [isScrolled]);

    useEffect(() => {
        setItemCount(getCartItemCount());
    }, [getCartItemCount()]);

    return (
        <header className="w-full bg-white  font-[var(--font-body)] ">
            {/* Top banner - Always visible on desktop, hidden on mobile */}
            <div className="bg-black text-white text-center font-bold py-3 px-4 hidden lg:flex justify-between items-center text-4xl sm:text-xs">
                <div className="text-left">
                    REST OF THE WORLD - EN - €
                </div>
                <div className="flex-1 text-sm   text-center tracking-wider uppercase">
                    TAXES AND CUSTOMS DUTIES ARE NOT INCLUDED AND MAY BE CHARGED UPON DELIVERY
                </div>
                <div className="flex items-center text-sm gap-4 ">
                    {user ? (
                        <Link to={"/auth"} className="hover:opacity-70 transition">
                            Account: Log Out
                        </Link>
                    ) : (
                        <Link to="/auth" className="hover:opacity-70 transition">
                            Account: Log in
                        </Link>
                    )}
                    <Link
                        to={"/cart"}
                        className="hover:opacity-70 transition">
                        Bag: ({itemCount})
                    </Link>
                    <Link
                        to={"/search"}
                        className="hover:opacity-70 transition"
                    >
                        Search
                    </Link>
                </div>
            </div>

            {/* Main header */}
            <div className={`border-b border-gray-200 bg-white transition-all duration-300 ${isScrolled ? 'lg:fixed lg:top-9 lg:left-0 lg:right-0 lg:z-50 lg:shadow-md' : ''}`}>
                <div className=" w-full bg-black text-white flex-1 text-xs font-bold py-3 px-4 lg:hidden  text-center tracking-wider uppercase">
                    TAXES AND CUSTOMS DUTIES ARE NOT INCLUDED AND MAY BE CHARGED UPON DELIVERY
                </div>
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
                            <Link
                                to={"/search"}
                                className="p-2">
                                <Search className="w-5 h-5" />
                            </Link>
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

            {isScrolled && <div className="lg:hidden h-[72px]" />}
            {isScrolled && <div className="hidden lg:block h-[8px]" />}
        </header>
    );
};

export default Header;
import React from 'react'
import { useState, useEffect } from 'react'
import { Search, ShoppingBag, Menu, X, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCategories } from '../../Context/CategoriesContext';
import { useUser } from '../../Context/UserContext';
import { useGender } from "../../Context/GenderContext";

const NavItems = ({ mobileMenuOpen, setMobileMenuOpen }) => {

    const { gender, changeGender } = useGender();
    const navitems = {
        man: "68f86b10734810ab97bb98d1",
        woman: "68f86b1c734810ab97bb9a2f"
    };

    const { user } = useUser();

    const { womanCategories, manCategories, newArrivals } = useCategories();
    // console.log(womanCategories)

    const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);
    const [mobileGender, setMobileGender] = useState('woman');
    const [activeDesktopMenu, setActiveDesktopMenu] = useState(null);
    const [activeNavItem, setActiveNavItem] = useState(null);
    const [itemCount] = useState(0);
    const [menuTimeout, setMenuTimeout] = useState(null);
    const [mobileSubView, setMobileSubView] = useState(null);

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/man')) {
            setMobileGender('man');
        } else if (path.startsWith('/woman')) {
            setMobileGender('woman');
        }
    }, [location.pathname]);

    const handleGenderSwitch = (g) => {
        changeGender(g);
        navigate(g === "man" ? "/man" : "/woman");
        setMobileMenuOpen(false);
        setMobileSubView(null);
        setActiveNavItem(null); 
    };

    const handleMenuEnter = (menu) => {
        if (menuTimeout) {
            clearTimeout(menuTimeout);
        }
        setActiveDesktopMenu(menu);
    };

    const handleMenuLeave = () => {
        const timeout = setTimeout(() => {
            setActiveDesktopMenu(null);
        }, 150);
        setMenuTimeout(timeout);
    };

    const closeDesktopMenu = () => {
        setActiveDesktopMenu(null);
    };

    const handleNavItemClick = (item) => {
        setActiveNavItem(item);
        closeDesktopMenu();
    };

    const designerBrands = {
        woman: ['Gucci', 'Bottega Veneta', 'Balenciaga', 'Valentino Garavani', 'Prada', 'Burberry', 'Dolce & Gabbana', 'Fendi', 'Miu Miu', 'Saint Laurent'],
        man: ['Gucci', 'Bottega Veneta', 'Burberry', 'Prada', 'Valentino Garavani', 'Giorgio Armani', 'Balenciaga', 'Thom Browne', 'Dolce & Gabbana', 'Saint Laurent']
    };

    const magazineItems = ['Interview', 'Backstage', 'Special Project', 'How To Wear It', 'Get Dressed As', 'Green Talks', 'Trend'];

    const openMobileSubView = (view) => {
        setMobileSubView(view);
    };

    const closeMobileSubView = () => {
        setMobileSubView(null);
    };

    const handleMobileItemClick = (route) => {
        navigate(route);
        setMobileMenuOpen(false);
        setMobileSubView(null);
    };

    const handleDesktopItemClick = (route, item) => {
        navigate(route);
        handleNavItemClick(item);
        closeDesktopMenu();
    };

    const getCurrentCategories = () => {
        return mobileGender === 'woman' ? womanCategories : manCategories;
    };

    const cssVariables = {
        primary: '#30486B',
        secondary: '#FFAA6B',
        neutral: '#30486B',
        fontHeading: "'Didot', 'Cormorant Garamond', serif",
        fontBody: "'Montserrat', 'Inter', sans-serif",
        fontAccent: "'Montserrat', 'Inter', sans-serif"
    };

    return (
        <>
            <nav className="w-full hidden lg:flex items-center justify-center gap-8 py-4 border-t border-gray-200 bg-white relative transition-all duration-300" style={{ fontFamily: cssVariables.fontBody }}>
                {/* Designers */}
                <div
                    className="relative h-full group"
                    onMouseEnter={() => handleMenuEnter('designers')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button 
                        onClick={() => handleNavItemClick('designers')}
                        className={`text-lg font-medium tracking-wider transition-all duration-300 h-full flex items-center group-hover:scale-105 ${
                            activeNavItem === 'designers' ? 'text-black font-semibold' : 'text-gray-700'
                        }`}
                    >
                        Designers
                    </button>
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
                        activeNavItem === 'designers' ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></div>
                </div>

                {/* New Arrivals */}
                <div
                    className="relative h-full group"
                    onMouseEnter={() => handleMenuEnter('newarrivals')}
                    onMouseLeave={handleMenuLeave}
                >
                    <Link
                        to={`/${gender}/${navitems[gender]}/new-arrivals/products`}
                        onClick={() => handleNavItemClick('newarrivals')}
                        className={`text-lg font-medium tracking-wider transition-all duration-300 h-full flex items-center group-hover:scale-105 ${
                            activeNavItem === 'newarrivals' ? 'text-black font-semibold' : 'text-gray-700'
                        }`}
                    >
                        New Arrivals
                    </Link>
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
                        activeNavItem === 'newarrivals' ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></div>
                </div>

                {/* Woman */}
                <div
                    className="relative h-full group"
                    onMouseEnter={() => handleMenuEnter('woman')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button
                        onClick={() => handleGenderSwitch("woman")}
                        className={`text-lg font-medium tracking-wider transition-all duration-300 h-full flex items-center group-hover:scale-105 ${
                            gender === 'woman' ? 'text-black font-semibold' : 'text-gray-700'
                        }`}
                    >
                        Woman
                    </button>
                     <div className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
                        activeNavItem === 'woman' ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></div>
                </div>

                {/* Man */}
                <div
                    className="relative h-full group"
                    onMouseEnter={() => handleMenuEnter('man')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button
                        onClick={() => handleGenderSwitch("man")}
                        className={`text-lg font-medium tracking-wider transition-all duration-300 h-full flex items-center group-hover:scale-105 ${
                            gender === 'man' ? 'text-black font-semibold' : 'text-gray-700'
                        }`}
                    >
                        Man
                    </button>
                     <div className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
                        activeNavItem === 'man' ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></div>
                </div>

                {/* Boutiques */}
                {/* <div className="relative h-full group">
                    <Link 
                        to={"/boutique"}
                        onClick={() => handleNavItemClick('boutiques')}
                        className={`text-lg font-medium tracking-wider transition-all duration-300 h-full flex items-center group-hover:scale-105 ${
                            activeNavItem === 'boutiques' ? 'text-black font-semibold' : 'text-gray-700'
                        }`}
                    >
                        Boutiques
                    </Link>
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
                        activeNavItem === 'boutiques' ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></div>
                </div> */}

                {/* Magazine */}
                {/* <div className="relative h-full group">
                    <Link 
                        to={"/magazine"}
                        onClick={() => handleNavItemClick('magazine')}
                        className={`text-lg font-medium tracking-wider transition-all duration-300 h-full flex items-center group-hover:scale-105 ${
                            activeNavItem === 'magazine' ? 'text-black font-semibold' : 'text-gray-700'
                        }`}
                    >
                        TCZ_TheCornerZine
                    </Link>
                    <div className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
                        activeNavItem === 'magazine' ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></div>
                </div> */}
            </nav>

            {/* Mega Menu Dropdowns - Portal Style */}
            {activeDesktopMenu && (
                <div
                    className="hidden lg:block fixed left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[60] text-gray-800 animate-fadeIn"
                    style={{ fontFamily: cssVariables.fontBody }}
                    onMouseEnter={() => menuTimeout && clearTimeout(menuTimeout)}
                    onMouseLeave={handleMenuLeave}
                >
                    {/* Common wrapper */}
                    <div className="max-w-7xl mx-auto px-10 py-10 flex justify-between gap-10 text-base leading-relaxed">

                        {/* Designers Menu */}
                        {activeDesktopMenu === "designers" && (
                            <>
                                <div className="space-y-4 w-1/4">
                                    <Link
                                        to="/woman/designers"
                                        onClick={() => handleDesktopItemClick("/woman/designers", "designers")}
                                        className="block text-gray-700 transition-all duration-300 hover:text-black hover:translate-x-1 hover:font-medium"
                                    >
                                        Designers Woman
                                    </Link>
                                    <Link
                                        to="/man/designers"
                                        onClick={() => handleDesktopItemClick("/man/designers", "designers")}
                                        className="block text-gray-700 transition-all duration-300 hover:text-black hover:translate-x-1 hover:font-medium"
                                    >
                                        Designers Man
                                    </Link>
                                </div>

                                <div className="w-1/3">
                                    <h4 className="font-semibold text-gray-900 uppercase tracking-wide text-sm mb-4" style={{ fontFamily: cssVariables.fontHeading }}>
                                        Top Brands — Woman
                                    </h4>
                                    <div className="grid grid-cols-1 gap-y-2 text-gray-700">
                                        {designerBrands.woman.map((brand) => (
                                            <Link
                                                to={`/woman/${navitems.woman}/${brand}/products`}
                                                key={brand}
                                                onClick={() => handleDesktopItemClick(`/woman/${navitems.woman}/${brand}/products`, "designers")}
                                                className="transition-all duration-300 hover:text-black hover:translate-x-1 hover:font-medium"
                                            >
                                                {brand}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-1/3">
                                    <h4 className="font-semibold text-gray-900 uppercase tracking-wide text-sm mb-4" style={{ fontFamily: cssVariables.fontHeading }}>
                                        Top Brands — Man
                                    </h4>
                                    <div className="grid grid-cols-1 gap-y-2 text-gray-700">
                                        {designerBrands.man.map((brand) => (
                                            <Link
                                                to={`/man/${navitems.man}/${brand}/products`}
                                                key={brand}
                                                onClick={() => handleDesktopItemClick(`/man/${navitems.man}/${brand}/products`, "designers")}
                                                className="transition-all duration-300 hover:text-black hover:translate-x-1 hover:font-medium"
                                            >
                                                {brand}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* New Arrivals */}
                        {activeDesktopMenu === "newarrivals" && (
                            <div className="grid grid-cols-5 gap-8 w-full">
                                {Object.keys(newArrivals).map((mainCatKey) => {
                                    const mainCategory = newArrivals[mainCatKey];
                                    return (
                                        <div key={mainCategory.id}>
                                            <Link
                                                to={`/${gender}/${mainCategory.id}/new-arrivals/products`}
                                                onClick={() => handleDesktopItemClick(`/${gender}/${mainCategory.id}/new-arrivals/products`, "newarrivals")}
                                                className="font-bold uppercase tracking-wide text-gray-900 block mb-4 text-sm transition-all duration-300 hover:text-black hover:translate-x-1"
                                                style={{ fontFamily: cssVariables.fontHeading }}
                                            >
                                                {mainCategory.name}
                                            </Link>
                                            <div className="space-y-2 text-gray-950">
                                                {mainCategory.subs?.map((sub) => (
                                                    <Link
                                                        key={sub.id}
                                                        to={`/${gender}/${sub.id}/new-arrivals/products`}
                                                        onClick={() => handleDesktopItemClick(`/${gender}/${sub.id}/new-arrivals/products`, "newarrivals")}
                                                        className="block transition-all duration-300 hover:text-black hover:translate-x-1 hover:font-medium"
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Woman / Man Categories */}
                        {(activeDesktopMenu === "woman" || activeDesktopMenu === "man") && (
                            <div className="grid grid-cols-6 gap-8 w-full">
                                <div>
                                    <h4 className="font-bold uppercase tracking-wide text-gray-900 mb-6">
                                        <Link
                                            to={`/${activeDesktopMenu}/${navitems[activeDesktopMenu]}/products`}
                                            onClick={() => handleDesktopItemClick(`/${activeDesktopMenu}/${navitems[activeDesktopMenu]}/products`, activeDesktopMenu)}
                                            className="transition-all duration-300 hover:text-black hover:translate-x-1 block"
                                            style={{ fontFamily: cssVariables.fontHeading }}
                                        >
                                            {activeDesktopMenu}
                                        </Link>
                                    </h4>
                                </div>

                                {Object.keys(
                                    activeDesktopMenu === "woman" ? womanCategories : manCategories
                                ).map((mainCatKey) => {
                                    const mainCategory =
                                        activeDesktopMenu === "woman"
                                            ? womanCategories[mainCatKey]
                                            : manCategories[mainCatKey];
                                    return (
                                        <div key={mainCategory.id}>
                                            <Link
                                                to={`/${activeDesktopMenu}/${mainCategory.id}/products`}
                                                onClick={() => handleDesktopItemClick(`/${activeDesktopMenu}/${mainCategory.id}/products`, activeDesktopMenu)}
                                                className="font-semibold uppercase tracking-wide text-gray-900 block mb-4 text-sm transition-all duration-300 hover:text-black hover:translate-x-1"
                                                style={{ fontFamily: cssVariables.fontHeading }}
                                            >
                                                {mainCategory.name}
                                            </Link>
                                            <div className="space-y-2 text-gray-700">
                                                {mainCategory.subs?.map((sub) => (
                                                    <Link
                                                        key={sub.id}
                                                        to={`/${activeDesktopMenu}/${sub.id}/products`}
                                                        onClick={() => handleDesktopItemClick(`/${activeDesktopMenu}/${sub.id}/products`, activeDesktopMenu)}
                                                        className="block transition-all duration-300 hover:text-black hover:translate-x-1 hover:font-medium"
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Magazine */}
                        {/* {activeDesktopMenu === "magazine" && (
                            <div className="text-center mx-auto ">
                                <h4 className="font-bold uppercase tracking-wide text-gray-900 block mb-4 text-sm transition-all duration-300 hover:text-black hover:translate-x-1" style={{ fontFamily: cssVariables.fontHeading }} >
                                    Magazine
                                </h4>
                                <div className="space-y-2 text-gray-700">
                                    {magazineItems.map((item) => (
                                        <a
                                            key={item}
                                            href="#"
                                            className="block transition-all duration-300 hover:text-black hover:translate-x-1 hover:font-medium"
                                        >
                                            {item}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>
            )}

            {/* Mobile menu - No changes needed for mobile as it already works differently */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden animate-slideInLeft">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed left-0 top-0 bottom-0 w-full bg-white overflow-y-auto shadow-xl" style={{ fontFamily: cssVariables.fontBody }}>
                        {!mobileSubView ? (
                            <>
                                <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white sticky top-0">
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => handleGenderSwitch('woman')}
                                            className={`text-sm uppercase tracking-wider pb-1 transition-all duration-300 ${gender === 'woman' ? 'font-semibold text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Woman
                                        </button>
                                        <button
                                            onClick={() => handleGenderSwitch('man')}
                                            className={`text-sm uppercase tracking-wider pb-1 transition-all duration-300 ${gender === 'man' ? 'font-semibold text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Man
                                        </button>
                                    </div>
                                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <nav className="p-4 space-y-1">
                                    <button
                                        onClick={() => handleMobileItemClick(`/${mobileGender}/${navitems[mobileGender]}/products`)}
                                        className="block w-full text-left py-4 text-sm uppercase tracking-wider font-medium border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 hover:pl-2 hover:font-semibold"
                                    >
                                        {mobileGender.toUpperCase()}
                                    </button>

                                    {/* Dynamic Mobile Categories */}
                                    {Object.keys(getCurrentCategories()).map((mainCatKey) => {
                                        const mainCategory = getCurrentCategories()[mainCatKey];
                                        return (
                                            <div key={mainCategory.id} className="w-full flex items-center justify-between py-4 text-sm uppercase tracking-wider font-medium border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 group">
                                                <Link
                                                    to={`/${mobileGender}/${mainCategory.id}/products`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex-1 transition-all duration-300 group-hover:pl-2 group-hover:font-semibold"
                                                >
                                                    {mainCategory.name}
                                                </Link>
                                                <button
                                                    onClick={() => openMobileSubView(mainCatKey)}
                                                    className="p-2 ml-2 hover:bg-gray-200 rounded-full transition-all duration-300"
                                                >
                                                    <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                                </button>
                                            </div>
                                        );
                                    })}

                                    <div className='w-full flex items-center justify-between py-4 text-sm uppercase tracking-wider font-medium border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 group'>
                                        <Link to={"/" + mobileGender + "/designers"}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex-1 transition-all duration-300 group-hover:pl-2 group-hover:font-semibold"
                                        >
                                            Designers
                                        </Link>
                                        <ChevronRight
                                            onClick={() => openMobileSubView('designers')}
                                            className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                                        />
                                    </div>

                                    <div className="w-full flex items-center justify-between py-4 text-sm uppercase tracking-wider font-medium border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 group">
                                        <Link
                                            to={`/${mobileGender}/${navitems[mobileGender]}/new-arrivals/products`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex-1 transition-all duration-300 group-hover:pl-2 group-hover:font-semibold"
                                        >
                                            New Arrivals
                                        </Link>
                                        <button
                                            onClick={() => openMobileSubView('newarrivals')}
                                            className="p-2 ml-2 hover:bg-gray-200 rounded-full transition-all duration-300"
                                        >
                                            <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                        </button>
                                    </div>
{/* 
                                    <Link to={"/boutique"}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full text-left py-4 text-sm uppercase tracking-wider font-medium border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 hover:pl-2 hover:font-semibold"
                                    >
                                        Boutiques
                                    </Link>

                                    <div className='w-full flex items-center justify-between py-4 text-sm uppercase tracking-wider font-medium border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 group'>
                                        <Link to={"/magazine"}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex-1 transition-all duration-300 group-hover:pl-2 group-hover:font-semibold"
                                        >
                                            TCZ_TheCornerZine
                                        </Link>
                                        <ChevronRight
                                            onClick={() => openMobileSubView('magazine')}
                                            className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                                        />
                                    </div> */}

                                    {user ? (
                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                            <Link to={"/auth"}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center gap-3 text-sm py-3 transition-all duration-300 hover:bg-gray-50 hover:pl-2 hover:font-semibold rounded"
                                            >
                                                <User className="w-5 h-5" />
                                                Log out
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                            <Link to={"/auth"}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center gap-3 text-sm py-3 transition-all duration-300 hover:bg-gray-50 hover:pl-2 hover:font-semibold rounded"
                                            >
                                                <User className="w-5 h-5" />
                                                Log in
                                            </Link>
                                        </div>
                                    )}
                                </nav>
                            </>
                        ) : (
                            <>
                                <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white sticky top-0">
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => handleGenderSwitch("woman")}
                                            className={`text-sm uppercase tracking-wider pb-1 transition-all duration-300 ${gender === 'woman' ? 'font-semibold text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Woman
                                        </button>
                                        <button
                                            onClick={() => handleGenderSwitch("man")}
                                            className={`text-sm uppercase tracking-wider pb-1 transition-all duration-300 ${gender === 'man' ? 'font-semibold text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Man
                                        </button>
                                    </div>
                                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4">
                                    <button
                                        onClick={closeMobileSubView}
                                        className="flex items-center gap-2 text-sm mb-6 py-2 transition-all duration-300 hover:bg-gray-50 hover:pl-2 rounded group"
                                    >
                                        <ChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                                        BACK
                                    </button>

                                    <h3 className="text-sm uppercase tracking-wider font-bold mb-6 pb-2 border-b border-gray-200" style={{ fontFamily: cssVariables.fontHeading }}>
                                        {mobileSubView.toUpperCase().replace('-', ' ')}
                                    </h3>

                                    {mobileSubView === 'designers' ? (
                                        <div className="space-y-0">
                                            {designerBrands[mobileGender]?.map(brand => (
                                                <button
                                                    key={brand}
                                                    onClick={() => handleMobileItemClick(`/${mobileGender}/${navitems[mobileGender]}/${brand}/products`)}
                                                    className="block w-full text-left py-4 text-sm border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 hover:pl-3 hover:font-medium"
                                                >
                                                    {brand}
                                                </button>
                                            ))}
                                        </div>
                                    ) : mobileSubView === 'newarrivals' ? (
                                        <div className="space-y-0">
                                            {Object.keys(newArrivals).map((mainCatKey) => {
                                                const mainCategory = newArrivals[mainCatKey];
                                                return (
                                                    <div key={mainCategory.id}>
                                                        <Link
                                                            to={`/${mobileGender}/${mainCategory.id}/new-arrivals/products`}
                                                            onClick={() => setMobileMenuOpen(false)}
                                                            className="block w-full text-left py-4 text-sm font-semibold border-b border-gray-200 transition-all duration-300 hover:bg-gray-50 hover:pl-3"
                                                        >
                                                            {mainCategory.name}
                                                        </Link>
                                                        {mainCategory.subs && mainCategory.subs.map((sub) => (
                                                            <Link
                                                                key={sub.id}
                                                                to={`/${mobileGender}/${sub.id}/products`}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="block w-full text-left py-3 pl-6 text-sm text-gray-600 border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 hover:pl-8 hover:text-gray-800"
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) 
                                    // : mobileSubView === 'magazine' ? (
                                    //     <div className="space-y-0">
                                    //         {magazineItems.map(item => (
                                    //             <a
                                    //                 key={item}
                                    //                 href="#"
                                    //                 className="block w-full text-left py-4 text-sm border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 hover:pl-3 hover:font-medium"
                                    //             >
                                    //                 {item}
                                    //             </a>
                                    //         ))}
                                    //     </div>
                                    // )
                                     : (
                                        <div className="space-y-0">
                                            {getCurrentCategories()[mobileSubView]?.subs?.map(subCategory => (
                                                <button
                                                    key={subCategory.id}
                                                    onClick={() => handleMobileItemClick(`/${mobileGender}/${subCategory.id}/products`)}
                                                    className="block w-full text-left py-4 text-sm border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 hover:pl-3 hover:font-medium"
                                                >
                                                    {subCategory.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {user ? (
                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                            <Link to={"/auth"}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center gap-3 text-sm py-3 transition-all duration-300 hover:bg-gray-50 hover:pl-2 hover:font-semibold rounded"
                                            >
                                                <User className="w-5 h-5" />
                                                Log out
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                            <Link to={"/auth"}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center gap-3 text-sm py-3 transition-all duration-300 hover:bg-gray-50 hover:pl-2 hover:font-semibold rounded"
                                            >
                                                <User className="w-5 h-5" />
                                                Log in
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Add custom animations to your global CSS */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-slideInLeft {
                    animation: slideInLeft 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default NavItems;
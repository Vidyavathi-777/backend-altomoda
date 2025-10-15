import React from 'react'
import { useState, useEffect } from 'react'
import { Search, ShoppingBag, Menu, X, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCategories } from '../../Context/CategoriesContext';

const NavItems = ({ mobileMenuOpen, setMobileMenuOpen, currentGender, onGenderChange }) => {
    const navitems = {
        "man": "561d7300b49dbb9c2c551be1",
        "woman": "561d7300b49dbb9c2c551c29"
    }
    
    const { womanCategories, manCategories, newArrivals } = useCategories();
    
    const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);
    const [mobileGender, setMobileGender] = useState('woman');
    const [activeDesktopMenu, setActiveDesktopMenu] = useState(null);
    const [itemCount] = useState(0);
    const [menuTimeout, setMenuTimeout] = useState(null);
    const [mobileSubView, setMobileSubView] = useState(null);

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        setMobileGender(currentGender);
    }, [currentGender]);

    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/man')) {
            setMobileGender('man');
        } else if (path.startsWith('/woman')) {
            setMobileGender('woman');
        }
    }, [location.pathname]);
    
    useEffect(() => {
        if (mobileMenuOpen) {
            setMobileGender(currentGender);
        }
    }, [mobileMenuOpen, currentGender]);

    const handleGenderSwitch = (gender) => {
        setMobileGender(gender);
        if (onGenderChange) {
            onGenderChange(gender);
        }
        // Update URL
        if (gender === 'man') {
            navigate('/man');
        } else {
            navigate('/woman');
        }
        // Close mobile menu after gender switch
        setMobileMenuOpen(false);
        setMobileSubView(null);
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
        }, 100);
        setMenuTimeout(timeout);
    };

    const closeDesktopMenu = () => {
        setActiveDesktopMenu(null);
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

    const handleDesktopItemClick = (route) => {
        navigate(route);
        closeDesktopMenu();
    };

    const getCurrentCategories = () => {
        return mobileGender === 'woman' ? womanCategories : manCategories;
    };

    return (
        <>
            <nav className="w-full hidden lg:flex items-center justify-center gap-8 py-4 border-t border-gray-200 bg-white relative">
                {/* Designers */}
                <div
                    className="relative h-full"
                    onMouseEnter={() => handleMenuEnter('designers')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button className="text-lg font-medium tracking-wider hover:opacity-70 transition h-full flex items-center">
                        Designers
                    </button>
                </div>

                {/* New Arrivals */}
                <div
                    className="relative h-full"
                    onMouseEnter={() => handleMenuEnter('newarrivals')}
                    onMouseLeave={handleMenuLeave}
                >
                    <Link
                        to={`/${currentGender}/newarrival/products`}
                        onClick={closeDesktopMenu}
                        className="text-lg font-medium tracking-wider hover:opacity-70 transition  h-full flex items-center">
                        New Arrivals
                    </Link>
                </div>

                {/* Woman */}
                <div
                    className="relative h-full"
                    onMouseEnter={() => handleMenuEnter('woman')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button
                        onClick={() => handleGenderSwitch('woman')}
                        className={`text-lg font-medium tracking-wider hover:opacity-70 transition  h-full flex items-center ${currentGender === 'woman' ? 'border-b-2 border-black font-bold' : ''
                            }`}
                    >
                        Woman
                    </button>
                </div>

                {/* Man */}
                <div
                    className="relative h-full"
                    onMouseEnter={() => handleMenuEnter('man')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button
                        onClick={() => handleGenderSwitch('man')}
                        className={`text-lg font-medium tracking-wider hover:opacity-70 transition  h-full flex items-center ${currentGender === 'man' ? 'border-b-2 border-black font-bold' : ''
                            }`}
                    >
                        Man
                    </button>
                </div>

                {/* Boutiques */}
                <a href="#" className="text-lg font-medium tracking-wider hover:opacity-70 transition  h-full flex items-center">
                    Boutiques
                </a>

                {/* Up To 50% Off */}
                <div
                    className="relative h-full"
                    onMouseEnter={() => handleMenuEnter('upto50%off')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button className="text-lg font-medium text-red-600 tracking-wider hover:opacity-70 transition  h-full flex items-center">
                        Up To 50% Off
                    </button>
                </div>

                {/* Magazine */}
                <div
                    className="relative h-full"
                    onMouseEnter={() => handleMenuEnter('magazine')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button className="text-lg font-medium tracking-wider hover:opacity-70 transition  h-full flex items-center">
                        TCZ_TheCornerZine
                    </button>
                </div>

                {/* Product Finder */}
                <a href="#" className="text-lg font-medium tracking-wider hover:opacity-70 transition  h-full flex items-center">
                    Product Finder
                </a>
            </nav>

            {/* Mega Menu Dropdowns - Portal Style */}
            {activeDesktopMenu && (
                <div
                    className="hidden text-xl lg:block fixed left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[60]"

                    onMouseEnter={() => {
                        if (menuTimeout) clearTimeout(menuTimeout);
                    }}
                    onMouseLeave={handleMenuLeave}
                >
                    {activeDesktopMenu === 'designers' && (
                        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-12 px-8 py-12">
                            <div>
                                <div className="space-y-3">
                                    <Link to={"/woman/designers"} onClick={closeDesktopMenu} className="block  font-medium hover:underline">DESIGNERS Woman</Link>
                                    <Link to={"/man/designers"} onClick={closeDesktopMenu} className="block  font-medium hover:underline">DESIGNERS Man</Link>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold mb-6  uppercase tracking-wider">Top brands woman</h4>
                                <div className="space-y-3">
                                    {designerBrands.woman.slice(0, 10).map(brand => (
                                        <Link to={`/woman/designers/${brand}/products`} onClick={closeDesktopMenu} key={brand} className="block text-lg hover:underline">{brand}</Link>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold mb-6  uppercase tracking-wider">Top brands man</h4>
                                <div className="space-y-3">
                                    {designerBrands.man.slice(0, 10).map(brand => (
                                        <Link to={`/man/designers/${brand}/products`} onClick={closeDesktopMenu} key={brand} className="block text-lg hover:underline">{brand}</Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDesktopMenu === 'newarrivals' && (
                        <div className="max-w-7xl mx-auto grid grid-cols-5 gap-12 px-8 py-12">
                            {Object.keys(newArrivals).map((mainCat) => {
                                return (
                                    <div key={mainCat} className="flex-1 px-4">
                                        <Link
                                            to={`/woman/${mainCat}/products`}
                                            onClick={closeDesktopMenu}
                                            className="font-bold mb-6 uppercase tracking-wider block"
                                        >
                                            {mainCat}
                                        </Link>
                                        <div className='space-y-3'>
                                            {newArrivals[mainCat].map((sub, index) => (
                                                <Link
                                                    key={index}
                                                    to={`/woman/${mainCat}/${sub}/products`}
                                                    onClick={closeDesktopMenu}
                                                    className="block text-lg hover:underline text-gray-700"
                                                >
                                                    {sub}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}  

                    {activeDesktopMenu === 'woman' && (
                        <div className="max-w-7xl text-xl mx-auto flex justify-between px-8 py-12">
                            <div>
                                <h4 className="font-bold mb-6  uppercase tracking-wider">
                                    <Link to={`/${navitems.woman}/products`} onClick={closeDesktopMenu} className="hover:underline">WOMAN</Link>
                                </h4>
                            </div>
                            {Object.keys(womanCategories).map((mainCat) => {
                                return (
                                    <div key={mainCat} className="flex-1 px-4">
                                        <Link
                                            to={`/woman/${mainCat}/products`}
                                            onClick={closeDesktopMenu}
                                            className="font-bold mb-6 uppercase tracking-wider block"
                                        >
                                            {mainCat}
                                        </Link>
                                        <div className='space-y-3'>
                                            {womanCategories[mainCat].map((sub, index) => (
                                                <Link
                                                    key={index}
                                                    to={`/woman/${index}/products`}
                                                    onClick={closeDesktopMenu}
                                                    className="block text-lg hover:underline text-gray-700"
                                                >
                                                    {sub}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeDesktopMenu === 'man' && (
                        <div className="max-w-7xl text-xl mx-auto flex justify-between px-8 py-12">
                            <div>
                                <h4 className="font-bold mb-6 uppercase tracking-wider">
                                    <Link to={`/${navitems.man}/products`} onClick={closeDesktopMenu} className="hover:underline">MAN</Link>
                                </h4>
                            </div>
                            {Object.keys(manCategories).map((mainCat) => {
                                return (
                                    <div key={mainCat} className="flex-1 px-4">
                                        <Link
                                            to={`/man/${mainCat}/products`}
                                            onClick={closeDesktopMenu}
                                            className="font-bold mb-6 uppercase tracking-wider block"
                                        >
                                            {mainCat}
                                        </Link>
                                        <div className='space-y-3'>
                                            {manCategories[mainCat].map((sub, index) => (
                                                <Link
                                                    key={index}
                                                    to={`/man/${mainCat}/${sub}/products`}
                                                    onClick={closeDesktopMenu}
                                                    className="block text-lg hover:underline text-gray-700"
                                                >
                                                    {sub}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeDesktopMenu === 'upto50%off' && (
                        <div className="max-w-sm mx-auto px-8 py-12">
                            <Link to={"/man/discount/products"} onClick={closeDesktopMenu} className="block text-lg hover:underline py-1">
                                Man
                            </Link>
                            <Link to={"/woman/discount/products"} onClick={closeDesktopMenu} className="block text-lg hover:underline py-1">
                                Woman
                            </Link>
                        </div>
                    )}

                    {activeDesktopMenu === 'magazine' && (
                        <div className="max-w-sm mx-auto px-8 py-12">
                            <h4 className="font-bold mb-4 text-xl uppercase tracking-wider">Magazine</h4>
                            <div className="space-y-2">
                                {magazineItems.map(item => (
                                    <a key={item} href="#" className="block text-lg hover:underline">{item}</a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed left-0 top-0 bottom-0 w-full bg-white overflow-y-auto">
                        {!mobileSubView ? (
                            <>
                                <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => handleGenderSwitch('woman')}
                                            className={`text-sm uppercase tracking-wider pb-1 ${mobileGender === 'woman' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
                                        >
                                            Woman
                                        </button>
                                        <button
                                            onClick={() => handleGenderSwitch('man')}
                                            className={`text-sm uppercase tracking-wider pb-1 ${mobileGender === 'man' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
                                        >
                                            Man
                                        </button>
                                    </div>
                                    <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <nav className="p-4">
                                    <button
                                        onClick={() => handleMobileItemClick(`/${mobileGender}/products`)}
                                        className="block py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200 w-full text-left"
                                    >
                                        {mobileGender.toUpperCase()}
                                    </button>

                                    {/* Dynamic Mobile Categories */}
                                    {Object.keys(getCurrentCategories()).map((mainCat) => (
                                        <div key={mainCat} className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200">
                                            <Link
                                                to={`/${mobileGender}/${mainCat}/products`}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex-1"
                                            >
                                                {mainCat}
                                            </Link>
                                            <button
                                                onClick={() => openMobileSubView(mainCat)}
                                                className="p-2 ml-2"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => openMobileSubView('designers')}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        Designers
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => handleMobileItemClick(`/${mobileGender}/newarrival/products`)}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        New Arrivals
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <a href="#" className="block py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200">
                                        Boutiques
                                    </a>

                                    <button
                                        onClick={() => handleMobileItemClick(`/${mobileGender}/discount/products`)}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium text-red-600 border-b border-gray-200"
                                    >
                                        Up To 50% Off
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => openMobileSubView('magazine')}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        TCZ_TheCornerZine
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <a href="#" className="block py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200">
                                        Product Finder
                                    </a>

                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <a href="#" className="flex items-center gap-3 text-sm py-2">
                                            <User className="w-5 h-5" />
                                            Log in
                                        </a>
                                    </div>
                                </nav>
                            </>
                        ) : (
                            <>
                                <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => handleGenderSwitch('woman')}
                                            className={`text-sm uppercase tracking-wider pb-1 ${mobileGender === 'woman' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
                                        >
                                            Woman
                                        </button>
                                        <button
                                            onClick={() => handleGenderSwitch('man')}
                                            className={`text-sm uppercase tracking-wider pb-1 ${mobileGender === 'man' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
                                        >
                                            Man
                                        </button>
                                    </div>
                                    <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4">
                                    <button
                                        onClick={closeMobileSubView}
                                        className="flex items-center gap-2 text-sm mb-4"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                        HOME
                                    </button>

                                    <h3 className="text-sm uppercase tracking-wider font-bold mb-4">
                                        {mobileSubView.toUpperCase()}
                                    </h3>

                                    {mobileSubView === 'designers' ? (
                                        <div className="space-y-0">
                                            {designerBrands[mobileGender]?.map(brand => (
                                                <button
                                                    key={brand}
                                                    onClick={() => handleMobileItemClick(`/${mobileGender}/designers/${brand}/products`)}
                                                    className="block w-full text-left py-3 text-sm border-b border-gray-200"
                                                >
                                                    {brand}
                                                </button>
                                            ))}
                                        </div>
                                    ) : mobileSubView === 'magazine' ? (
                                        <div className="space-y-0">
                                            {magazineItems.map(item => (
                                                <a
                                                    key={item}
                                                    href="#"
                                                    className="block w-full text-left py-3 text-sm border-b border-gray-200"
                                                >
                                                    {item}
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-0">
                                            {getCurrentCategories()[mobileSubView]?.map(subCategory => (
                                                <button
                                                    key={subCategory}
                                                    onClick={() => handleMobileItemClick(`/${mobileGender}/${mobileSubView}/${subCategory}/products`)}
                                                    className="block w-full text-left py-3 text-sm border-b border-gray-200"
                                                >
                                                    {subCategory}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <a href="#" className="flex items-center gap-3 text-sm py-2">
                                            <User className="w-5 h-5" />
                                            Log in
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default NavItems;
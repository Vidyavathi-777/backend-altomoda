import React from 'react'
import { useState } from 'react'
import { Search, ShoppingBag, Menu, X, User, ChevronRight, ChevronLeft } from 'lucide-react';

const NavItems = ({ mobileMenuOpen, setMobileMenuOpen }) => {
    const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);
    const [mobileGender, setMobileGender] = useState('woman');
    const [activeDesktopMenu, setActiveDesktopMenu] = useState(null);
    const [itemCount] = useState(0);
    const [menuTimeout, setMenuTimeout] = useState(null);
    const [mobileSubView, setMobileSubView] = useState(null);

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

    const womanCategories = {
        clothing: ['Jumpsuits', 'Tops', 'Skirts', 'Dresses', 'Coats & Jackets', 'Pants', 'Knitwear', 'Beachwear', 'Loungewear & Underwear', 'Denim', 'Blazers & suits'],
        bags: ['Top handle', 'Clutch', 'Shoulderbag', 'Bucketbag', 'Tote bags', 'Backpack', 'Beltbag', 'Bag accessories', 'Luggage & Travel'],
        shoes: ['Sneakers', 'Sandals', 'Boots', 'Heels', 'Flats shoes'],
        accessories: ['Wallets', 'Sunglasses', 'Hats', 'Scarves', 'Jewelry', 'Socks', 'Belts', 'Beauty Cases', 'Hairs Accessories', 'Pouches', 'Keyrings', 'Gloves'],
        lifestyle: ['Home', 'Beauty', 'Free Time']
    };

    const manCategories = {
        clothing: ['Trousers', 'Topwear', 'Swimwear', 'Knitwear', 'Jeans', 'Shirts', 'Blazers', 'Coats & jackets', 'Suits', 'Loungewear & Underwear'],
        bags: ['Totes', 'Messenger bags', 'Backpack', 'Beltbag', 'Poches', 'Briefcases', 'Luggage & Travel', 'Wash bags'],
        shoes: ['Slides', 'Espadrilles', 'Loafers', 'Lace-ups', 'Sneakers', 'Slippers', 'Boots', 'Boat Shoes'],
        accessories: ['Scarves', 'Wallets', 'Sunglasses', 'Jewelry', 'Hats', 'Socks', 'Keyrings', 'Belts', 'Ties', 'Tech accessories', 'Watches'],
        lifestyle: ['Home', 'Beauty', 'Free Time']
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

    const getCurrentCategories = () => {
        return mobileGender === 'woman' ? womanCategories : manCategories;
    };

    return (
        <div>
            <nav className="w-full hidden lg:flex items-center justify-center gap-8 py-4 border-t border-gray-200">
                <div
                    className="relative"
                    onMouseEnter={() => handleMenuEnter('designers')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button className="text-sm font-medium tracking-wider hover:opacity-70 transition uppercase">
                        Designers
                    </button>
                    {activeDesktopMenu === 'designers' && (
                        <div
                            className="fixed top-[180px] left-0 right-0 bg-white border-t border-b border-gray-200 shadow-lg z-50"
                            onMouseEnter={() => handleMenuEnter('designers')}
                            onMouseLeave={handleMenuLeave}
                        >
                            <div className="max-w-7xl mx-auto grid grid-cols-3 gap-8 p-8">
                                <div>
                                    <div className="space-y-2">
                                        <a href="#" className="block text-sm hover:underline">DESIGNERS Woman</a>
                                        <a href="#" className="block text-sm hover:underline">DESIGNERS Man</a>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Top brands woman</h4>
                                    <div className="space-y-2">
                                        {designerBrands.woman.slice(0, 10).map(brand => (
                                            <a key={brand} href="#" className="block text-sm hover:underline">{brand}</a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Top brands man</h4>
                                    <div className="space-y-2">
                                        {designerBrands.man.slice(0, 10).map(brand => (
                                            <a key={brand} href="#" className="block text-sm hover:underline">{brand}</a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="relative"
                    onMouseEnter={() => handleMenuEnter('newarrivals')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button className="text-sm font-medium tracking-wider hover:opacity-70 transition uppercase">
                        New Arrivals
                    </button>
                    {activeDesktopMenu === 'newarrivals' && (
                        <div
                            className="fixed top-[180px] left-0 right-0  bg-white border border-gray-200 shadow-lg  z-50"
                            onMouseEnter={() => handleMenuEnter('newarrivals')}
                            onMouseLeave={handleMenuLeave}
                        >
                            <div className=" max-w-7xl mx-auto grid grid-cols-5 gap-6 p-8">
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Clothing</h4>
                                    <div className="space-y-2">
                                        {womanCategories.clothing.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Bags</h4>
                                    <div className="space-y-2">
                                        {womanCategories.bags.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Shoes</h4>
                                    <div className="space-y-2">
                                        {womanCategories.shoes.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Accessories</h4>
                                    <div className="space-y-2">
                                        {womanCategories.accessories.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Lifestyle</h4>
                                    <div className="space-y-2">
                                        {womanCategories.lifestyle.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="relative"
                    onMouseEnter={() => handleMenuEnter('woman')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button className="text-sm font-medium tracking-wider hover:opacity-70 transition uppercase">
                        Woman
                    </button>
                    {activeDesktopMenu === 'woman' && (
                        <div
                            className="fixed top-[180px] left-0 right-0  bg-white border border-gray-200 shadow-lg  z-50"
                            onMouseEnter={() => handleMenuEnter('woman')}
                            onMouseLeave={handleMenuLeave}
                        >
                            <div className="max-w-7xl mx-auto grid grid-cols-5 gap-6 p-8">
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">
                                        <a href="#" className="hover:underline">Woman</a>
                                    </h4>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Clothing</h4>
                                    <div className="space-y-2">
                                        {womanCategories.clothing.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Bags</h4>
                                    <div className="space-y-2">
                                        {womanCategories.bags.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Shoes</h4>
                                    <div className="space-y-2">
                                        {womanCategories.shoes.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                    <h4 className="font-bold mb-4 mt-6 text-xs uppercase tracking-wider">Lifestyle</h4>
                                    <div className="space-y-2">
                                        {womanCategories.lifestyle.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Accessories</h4>
                                    <div className="space-y-2">
                                        {womanCategories.accessories.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="relative"
                    onMouseEnter={() => handleMenuEnter('man')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button className="text-sm font-medium tracking-wider hover:opacity-70 transition uppercase">
                        Man
                    </button>
                    {activeDesktopMenu === 'man' && (
                        <div
                            className="fixed top-[180px] left-0 right-0  bg-white border border-gray-200 shadow-lg  z-50"
                            onMouseEnter={() => handleMenuEnter('man')}
                            onMouseLeave={handleMenuLeave}
                        >
                            <div className="max-w-7xl mx-auto grid grid-cols-5 gap-6 p-8">
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">
                                        <a href="#" className="hover:underline">Man</a>
                                    </h4>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Clothing</h4>
                                    <div className="space-y-2">
                                        {manCategories.clothing.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Bags</h4>
                                    <div className="space-y-2">
                                        {manCategories.bags.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Shoes</h4>
                                    <div className="space-y-2">
                                        {manCategories.shoes.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Accessories</h4>
                                    <div className="space-y-2">
                                        {manCategories.accessories.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                    <h4 className="font-bold mb-4 mt-6 text-xs uppercase tracking-wider">Lifestyle</h4>
                                    <div className="space-y-2">
                                        {manCategories.lifestyle.map(item => (
                                            <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <a href="#" className="text-sm font-medium tracking-wider hover:opacity-70 transition uppercase">
                    Boutiques
                </a>

                <div
                    className="relative"
                    onMouseEnter={() => handleMenuEnter('upto50%off')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button className="text-sm font-medium text-red-600 tracking-wider hover:opacity-70 transition uppercase">
                        Up To 50% Off
                    </button>
                    {activeDesktopMenu === 'upto50%off' && (
                        <div
                            className="fixed top-[180px] left-0 right-0  bg-white border border-gray-200 shadow-lg  z-50"
                            onMouseEnter={() => handleMenuEnter('upto50%off')}
                            onMouseLeave={handleMenuLeave}
                        >
                            <div className="max-w-sm mx-auto p-8">
                                <div className="block text-sm hover:underline">
                                    man
                                </div>
                                <div className='block text-sm hover:underline'>
                                    woman
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="relative"
                    onMouseEnter={() => handleMenuEnter('magazine')}
                    onMouseLeave={handleMenuLeave}
                >
                    <button className="text-sm font-medium tracking-wider hover:opacity-70 transition uppercase">
                        TCZ_TheCornerZine
                    </button>
                    {activeDesktopMenu === 'magazine' && (
                        <div
                            className="fixed top-[180px] left-0 right-0  bg-white border border-gray-200 shadow-lg  z-50"
                            onMouseEnter={() => handleMenuEnter('magazine')}
                            onMouseLeave={handleMenuLeave}
                        >
                            <div className="max-w-sm mx-auto p-8">
                                <h4 className="font-bold mb-4 text-xs uppercase tracking-wider">Magazine</h4>
                                <div className="space-y-2">
                                    {magazineItems.map(item => (
                                        <a key={item} href="#" className="block text-sm hover:underline">{item}</a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <a href="#" className="text-sm font-medium tracking-wider hover:opacity-70 transition uppercase">
                    Product Finder
                </a>
            </nav>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed left-0 top-0 bottom-0 w-full bg-white overflow-y-auto">
                        {!mobileSubView ? (
                            <>
                                <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => setMobileGender('woman')}
                                            className={`text-sm uppercase tracking-wider pb-1 ${mobileGender === 'woman' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
                                        >
                                            Woman
                                        </button>
                                        <button
                                            onClick={() => setMobileGender('man')}
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
                                    <a href="#" className="block py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200">
                                        {mobileGender.toUpperCase()}
                                    </a>

                                    <button
                                        onClick={() => openMobileSubView('clothing')}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        Clothing
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => openMobileSubView('bags')}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        Bags
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => openMobileSubView('shoes')}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        Shoes
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => openMobileSubView('accessories')}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        Accessories
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => openMobileSubView('lifestyle')}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        Lifestyle
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => openMobileSubView('designers')}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        Designers
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => openMobileSubView('newarrivals')}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        New Arrivals
                                        <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <a href="#" className="block py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200">
                                        Boutiques
                                    </a>

                                    <button
                                        onClick={() => openMobileSubView('sale')}
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
                                            onClick={() => setMobileGender('woman')}
                                            className={`text-sm uppercase tracking-wider pb-1 ${mobileGender === 'woman' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
                                        >
                                            Woman
                                        </button>
                                        <button
                                            onClick={() => setMobileGender('man')}
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

                                    <div className="space-y-0">
                                        {getCurrentCategories()[mobileSubView]?.map(item => (
                                            <a key={item} href="#" className="block py-3 text-sm border-b border-gray-200">
                                                {item}
                                            </a>
                                        ))}
                                    </div>

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
        </div>
    );
};

export default NavItems;
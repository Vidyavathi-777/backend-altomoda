import React from 'react'
import { useState, useEffect } from 'react'
import { Search, ShoppingBag, Menu, X, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCategories } from '../../Context/CategoriesContext';
import { useUser } from '../../Context/UserContext';

const NavItems = ({ mobileMenuOpen, setMobileMenuOpen, currentGender, onGenderChange }) => {
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


    const cssVariables = {
        primary: '#30486B',
        secondary: '#FFAA6B',
        neutral: '#30486B',
        fontHeading: "'Cormorant Garamond', serif",
        fontBody: "'Inter', sans-serif",
        fontAccent: "'Inter', sans-serif"
    };

    return (
        <>
            <nav className="w-full hidden lg:flex items-center justify-center gap-8 py-4 border-t border-gray-200 bg-white relative "  style={{ fontFamily: cssVariables.fontBody }}>
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
                        to={`/${navitems[currentGender]}/products`}
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
                    <Link
                        to={"/magazine"}
                        className="text-lg font-medium tracking-wider hover:opacity-70 transition  h-full flex items-center">
                        TCZ_TheCornerZine
                    </Link>
                </div>

                {/* Product Finder */}
                <a href="#" className="text-lg font-medium tracking-wider hover:opacity-70 transition  h-full flex items-center">
                    Product Finder
                </a>
            </nav>

            {/* Mega Menu Dropdowns - Portal Style */}
{activeDesktopMenu && (
  <div
    className="hidden lg:block fixed left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[60] text-gray-800" style={{ fontFamily: cssVariables.fontBody }}
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
              onClick={closeDesktopMenu}
              className="block hover:text-black hover:underline transition"
            >
              Designers Woman
            </Link>
            <Link
              to="/man/designers"
              onClick={closeDesktopMenu}
              className="block hover:text-black hover:underline transition"
            >
              Designers Man
            </Link>
          </div>

          <div className="w-1/3">
            <h4 className="font-semibold text-gray-900 uppercase tracking-wide text-sm mb-4">
              Top Brands — Woman
            </h4>
            <div className="grid grid-cols-1 gap-y-2 text-gray-700">
              {designerBrands.woman.map((brand) => (
                <Link
                  to={`/woman/${navitems.woman}/${brand}/products`}
                  key={brand}
                  onClick={closeDesktopMenu}
                  className="hover:text-black hover:underline transition"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>

          <div className="w-1/3">
            <h4 className="font-semibold text-gray-900 uppercase tracking-wide text-sm mb-4">
              Top Brands — Man
            </h4>
            <div className="grid grid-cols-1 gap-y-2 text-gray-700">
              {designerBrands.man.map((brand) => (
                <Link
                  to={`/man/${navitems.man}/${brand}/products`}
                  key={brand}
                  onClick={closeDesktopMenu}
                  className="hover:text-black transition"
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
        <div className="grid grid-cols-5 gap-8 w-full ">
          {Object.keys(newArrivals).map((mainCatKey) => {
            const mainCategory = newArrivals[mainCatKey];
            return (
              <div key={mainCategory.id}>
                <Link
                  to={`/${currentGender}/${mainCategory.id}/new-arrivals/products`}
                  onClick={closeDesktopMenu}
                  className="font-bold uppercase tracking-wide text-gray-900 block  mb-4 text-sm hover:text-black hover:underline"
                >
                  {mainCategory.name}
                </Link>
                <div className="space-y-2 text-gray-950">
                  {mainCategory.subs?.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/${currentGender}/${sub.id}/new-arrivals/products`}
                      onClick={closeDesktopMenu}
                      className="block  hover:text-black hover:underline transition"
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
            <h4 className="font-bold uppercase tracking-wide text-gray-900 hover:text-black hover:underline mb-6">
              <Link
                to={`/${navitems[activeDesktopMenu]}/products`}
                onClick={closeDesktopMenu}
                className="hover:underline"
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
                  onClick={closeDesktopMenu}
                  className="font-semibold uppercase tracking-wide text-gray-900 block mb-4 text-sm hover:text-black hover:underline"
                >
                  {mainCategory.name}
                </Link>
                <div className="space-y-2 text-gray-700">
                  {mainCategory.subs?.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/${activeDesktopMenu}/${sub.id}/products`}
                      onClick={closeDesktopMenu}
                      className="block hover:text-black hover:underline transition"
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

      {/* Upto 50% Off */}
      {activeDesktopMenu === "upto50%off" && (
        <div className="text-center space-y-3 mx-auto hover:underline">
          <h4 className="font-semibold text-gray-900 uppercase tracking-wide mb-3">
            Upto 50% Off
          </h4>
          <Link
            to="/man/discount/products"
            onClick={closeDesktopMenu}
            className="block hover:text-black transition"
          >
            Man
          </Link>
          <Link
            to="/woman/discount/products"
            onClick={closeDesktopMenu}
            className="block hover:text-black transition"
          >
            Woman
          </Link>
        </div>
      )}

      {/* Magazine */}
      {activeDesktopMenu === "magazine" && (
        <div className="text-center mx-auto ">
          <h4 className="font-semibold uppercase tracking-wide text-gray-900 mb-4">
            Magazine
          </h4>
          <div className="space-y-2 text-gray-700">
            {magazineItems.map((item) => (
              <a
                key={item}
                href="#"
                className="block hover:text-black hover:underline transition"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
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
                                        onClick={() => handleMobileItemClick(`/${mobileGender}/${navitems[mobileGender]}/products`)}
                                        className="block py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200 w-full text-left"
                                    >
                                        {mobileGender.toUpperCase()}
                                    </button>

                                    {/* Dynamic Mobile Categories */}
                                    {Object.keys(getCurrentCategories()).map((mainCatKey) => {
                                        const mainCategory = getCurrentCategories()[mainCatKey];
                                        return (
                                            <div key={mainCategory.id} className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200">
                                                <Link
                                                    to={`/${mobileGender}/${mainCategory.id}/products`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="flex-1"
                                                >
                                                    {mainCategory.name}
                                                </Link>
                                                <button
                                                    onClick={() => openMobileSubView(mainCatKey)}
                                                    className="p-2 ml-2"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    <div className='w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200'>
                                                                          <Link to={"/"+mobileGender+"/designers"}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        Designers
                                          </Link>
                                    <ChevronRight
                                        onClick={() => openMobileSubView('designers')}
                                        className="w-5 h-5"
                                    />

                                    </div>


                                    <div className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200">
                                        <Link
                                            to={`/${mobileGender}/${navitems[mobileGender]}/products`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex-1"
                                        >
                                            New Arrivals
                                        </Link>
                                        <button
                                            onClick={() => openMobileSubView('newarrivals')}
                                            className="p-2 ml-2"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <a href="#" className="block py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200">
                                        Boutiques
                                    </a>

                                    <Link
                                        to={`/${mobileGender}/${navitems[mobileGender]}/products`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block py-3 text-sm uppercase tracking-wider font-medium text-red-600 border-b border-gray-200"
                                    >
                                        Up To 50% Off
                                    </Link>
                                    <div className='w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200'>
                                                                          <Link to={"/magazine"}
                                                                          onClick={() => setMobileMenuOpen(false)}
                                        
                                        className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200"
                                    >
                                        TCZ_TheCornerZine
                                         </Link>
                                        <ChevronRight
                                        onClick={() => openMobileSubView('magazine')}
                                         className="w-5 h-5" />

                                    </div>


                                   

                                    <a href="#" className="block py-3 text-sm uppercase tracking-wider font-medium border-b border-gray-200">
                                        Product Finder
                                    </a>

                                  {user ? (
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <Link to={"/auth"} 
                                          onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 text-sm py-2">
                                            <User className="w-5 h-5" />
                                            Log out
                                        </Link>
                                    </div>
                                    ) : (
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <Link to={"/auth"} 
                                          onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 text-sm py-2">
                                            <User className="w-5 h-5" />
                                            Log in
                                        </Link>
                                    </div>
                                    )}
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
                                                    onClick={() => handleMobileItemClick(`/${mobileGender}/${navitems[mobileGender]}/${brand}/products`)}
                                                    className="block w-full text-left py-3 text-sm border-b border-gray-200"
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
                                                            className="block w-full text-left py-3 text-sm font-semibold border-b border-gray-200"
                                                        >
                                                            {mainCategory.name}
                                                        </Link>
                                                        {mainCategory.subs && mainCategory.subs.map((sub) => (
                                                            <Link
                                                                key={sub.id}
                                                                to={`/${mobileGender}/${sub.id}/products`}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="block w-full text-left py-2 pl-4 text-sm text-gray-600 border-b border-gray-100"
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                );
                                            })}
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
                                            {getCurrentCategories()[mobileSubView]?.subs?.map(subCategory => (
                                                <button
                                                    key={subCategory.id}
                                                    onClick={() => handleMobileItemClick(`/${mobileGender}/${subCategory.id}/products`)}
                                                    className="block w-full text-left py-3 text-sm border-b border-gray-200"
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
                                        className="flex items-center gap-3 text-sm py-2">
                                            <User className="w-5 h-5" />
                                            Log out
                                        </Link>
                                    </div>
                                    ) : (
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <Link to={"/auth"} 
                                          onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 text-sm py-2">
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
        </>
    );
};

export default NavItems;
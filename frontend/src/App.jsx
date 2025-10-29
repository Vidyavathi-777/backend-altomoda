import './index.css'
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import Header from './components/Homepage.jsx/Header';
import BrandsSection from './components/Homepage.jsx/BrandsSection';
import Footer from './components/Homepage.jsx/Footer';
import { useEffect, useState } from "react";
import ProductsPage from './pages/ProductsPage';
import DesignersPage from './pages/DesignersPage';
import { CategoriesProvider } from './Context/CategoriesContext';
import { CartProvider } from './Context/CartContext';



function App({ gender: propGender }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentGender, setCurrentGender] = useState('woman');

  useEffect(() => {
    const pathGender = location.pathname.includes('/man') ? 'man' : 'woman';
    setCurrentGender(propGender || pathGender);
  }, [location.pathname, propGender]);

  const handleGenderChange = (gender) => {
    setCurrentGender(gender);
    navigate(gender === 'man' ? '/man' : '/woman');
  };

  return (
    <UserProvider>
    <CategoriesProvider currentGender={currentGender}>
      <CartProvider >
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <Header currentGender={currentGender} onGenderChange={handleGenderChange} />
      </header>

      <Routes>
        <Route path='/:gender?' element={<HomePage />} />
        <Route path='/:gender/product/:sku_parent' element={<ProductDetailPage />} />
        <Route path='/product/:id' element={<ProductDetailPage />} />
        <Route path="/:gender/:categoryId/:brandName/products" element={<ProductsPage />} />
<Route path="/:gender/:categoryId/products" element={<ProductsPage />} />
<Route path="/:categoryId/:brandName/products" element={<ProductsPage />} />
<Route path="/:categoryId/products" element={<ProductsPage />} />
           {/* <Route path="/:categoryId/products" element={<ProductsPage />} />
        <Route path='/:gender/discount/products' element={<ProductsPage />} />
        <Route path='/:gender/designers/:brandName/products' element={<ProductsPage />} /> */}

        {/* <Route path='/:categoryId/:brandName/products' element={<ProductsPage />} />
        
        {/* gender + categoryId */}
        {/* <Route path='/:gender/:categoryId/products' element={<ProductsPage />} />
        <Route path='/:gender/:brandName/products' element={<ProductsPage />} />
        
        {/* Just categoryId (for backward compatibility) */}
        {/* <Route path='/:categoryId/products' element={<ProductsPage />} />  */}
        
        {/* Designers page */}
        <Route path='/:gender/designers' element={<DesignersPage />} />
       <Route path='/magazine' element={<MagazinePage />}/>
       <Route path='/auth' element={<UserAuth/>} />
       <Route path='/login' element={<LoginPage/>} />
       <Route path='/signup' element={<SignupPage/>} />
       <Route path='/search' element={<SearchPage />} />
       <Route path='/cart' element={<CartPage />} />
       <Route path='/checkout' element={<CheckoutPage/>} />
       <Route path='/success' element={<SuccessPage />} />
       <Route path='/privacyPolicy' element={<PrivacyPolicy />} />
       <Route path='/terms&conditions' element={<CancellationsPolicy />} /> 
       <Route path='/addresses' element={<AddressManagement />} />
 

{/* <Route path='/:categoryId/products' element={<ProductsPage />} />
<Route path='/:gender/:categoryId/products' element={<ProductsPage />} />
<Route path='/:gender/:category/:subCategory/products' element={<ProductsPage />} />
<Route path='/:gender/:brandName/products' element={<ProductsPage />} /> */}
        {/* <Route path='/:gender/designers' element={<DesignersPage />} /> */}
        {/* <Route path='/:gender/newArrival/products' element={<ProductsPage />} />
        <Route path='/:gender/newArrival/:category/products' element={<ProductsPage />} />
        <Route path='/:gender/newArrival/:category/:subCategory/products' element={<ProductsPage />} /> */}
      </Routes>

      <BrandsSection />
      <Footer />
      </CartProvider>
    </CategoriesProvider>
    </UserProvider>
  );
}
import MagazinePage from './pages/MagazinePage';
// import UserLogin from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import PrivacyPolicy from './pages/PrivacyPage';
import CancellationsPolicy from './pages/TermsAndConditions';
import UserAuth from './pages/UserAuth';
import LoginPage from "./components/LoginPage";
import SignupPage from './components/SignUpPage';
import { UserProvider } from './Context/UserContext';
import AddressManagement from './pages/AddressManagement';

export default App;

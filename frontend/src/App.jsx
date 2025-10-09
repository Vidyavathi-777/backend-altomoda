import './App.css'
import { Routes, Route, Link } from "react-router-dom";
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import Header from './components/Homepage.jsx/Header';
import BrandsSection from './components/Homepage.jsx/BrandsSection';
import Footer from './components/Homepage.jsx/Footer';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductsPage from './pages/ProductsPage';
import DesignersPage from './pages/DesignersPage';

function App({ gender: propGender }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentGender, setCurrentGender] = useState('woman')

  useEffect(() => {
    const pathGender = location.pathname === '/man' ? 'man' : 'woman'
    setCurrentGender(propGender || pathGender)
  }, [location.pathname, propGender])

  const handleGenderChange = (gender) => {
    setCurrentGender(gender)
    if (gender === 'man') {
      navigate('/man')
    } else {
      navigate('/woman')
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <Header currentGender={currentGender} onGenderChange={handleGenderChange} />
      </header>
      <Routes>
        <Route path='/:gender?' element={<HomePage />} />

        <Route path='/:gender/product/:id' element={<ProductDetailPage />} />
        {/* <Route path='/:gender/:newArrivals?/:category?/:subCategory?/products' element={<ProductsPage />} /> */}

        <Route path='/:gender/products' element={<ProductsPage />} />
        <Route path='/:gender/discount/products' element={<ProductsPage />} />
        <Route path='/:gender/designers/:brandName/products' element={<ProductsPage />} />

        <Route path='/:gender/:category/products' element={<ProductsPage />} />

        <Route path='/:gender/:category/:subCategory/products' element={<ProductsPage />} />

        
        <Route path='/:gender/designers' element={<DesignersPage />} />
<Route path='/:gender/newArrival/products' element={<ProductsPage />} />
<Route path='/:gender/newArrival/:category/products' element={<ProductsPage />} />
<Route path='/:gender/newArrival/:category/:subCategory/products' element={<ProductsPage />} />

      </Routes>
      <BrandsSection />
      <Footer />
    </>
  )
}

export default App

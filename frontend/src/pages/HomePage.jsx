
import HeroSection from "../components/Homepage.jsx/HeroSection";
import Newsletter from "../components/Homepage.jsx/NewsLetter";
import NewArrivals from "../components/Homepage.jsx/NewArrivals";
import ImageCarousel from "../components/Homepage.jsx/ImageCarousel";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect,useState } from "react";
import categoriesData from "../json/sliders.json"
import BannerCaurosel from "../components/Homepage.jsx/BannerCaurosel";
import DesignerBrandScroller from "../components/Homepage.jsx/DesignersScroller";
import { useParams } from "react-router-dom";
import CategoryPage from "../components/Homepage.jsx/CategroyPage";


const HomePage = ({gender:propGender}) => {
  const { gender = "woman" } = useParams();
  const location = useLocation()
  const navigate = useNavigate()
  const [currentGender, setCurrentGender] = useState('woman')

  useEffect(() =>{
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

  const womanIndexes = [0, 1, 2, 3];

  // MAN indexes
  const manIndexes = [6, 7, 8, 9];

  // Pick correct blocks based on gender
  const activeIndexes = gender === "woman" ? womanIndexes : manIndexes;

  const categoryBlocks = activeIndexes.map(i => categoriesData.sliders[i]);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Main Content */}
      <main className="pt-[60px]  md:pt-[90px] lg:pt-[200px]">
        <BannerCaurosel />
        <DesignerBrandScroller />
        <CategoryPage sliders={categoriesData.sliders} />

        <NewArrivals  />
        {/* <Newsletter /> */}
        {/* <ImageCarousel  /> */}

        
      </main>
    </div>
  );
};

export default HomePage;

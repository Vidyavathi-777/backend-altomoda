
import HeroSection from "../components/Homepage.jsx/HeroSection";
import Newsletter from "../components/Homepage.jsx/NewsLetter";
import NewArrivals from "../components/Homepage.jsx/NewArrivals";
import ImageCarousel from "../components/Homepage.jsx/ImageCarousel";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect,useState } from "react";


const HomePage = ({gender:propGender}) => {
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



  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Main Content */}
      <main className="pt-[120px] sm:pt-[140px] md:pt-[160px] lg:pt-[180px]">
        <HeroSection  />
        <NewArrivals  />
        {/* <Newsletter /> */}
        <ImageCarousel  />

        
      </main>
    </div>
  );
};

export default HomePage;

import React from 'react';
import MagazineArticle from '../components/MagazineArticle';
import articles from "../json/Magazine.json";

const MagazinePage = () => {
  return (
    <div className="min-h-screen bg-white pt-[120px] sm:pt-[140px] md:pt-[160px] lg:pt-[200px]">
      {/* Hero Section */}
      <div className="relative">
        <div className="relative pt-[38.666%] bg-gray-50 overflow-hidden">
          <img
            src="https://res.cloudinary.com/contentchef/image/upload/w_2100,q_auto,dpr_1,f_auto/thecorner-d377/AzFzk3MehAb/banner_magazine_6"
            alt="Intro"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-6xl  font-medium text-white">TCZ. THE CORNER ZINE</h1>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {articles.map((article) => (
            <MagazineArticle key={article.id} article={article} />
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 border border-gray-800 text-gray-800 font-medium hover:bg-gray-800 hover:text-white transition-colors">
            Load more articles
          </button>
        </div>
      </div>
    </div>
  );
}

export default MagazinePage;
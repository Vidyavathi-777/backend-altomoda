import React from 'react';

const MagazineArticle = ({article}) => {
return(
    <div className="w-full mb-8 ">
      <div className="group cursor-pointer">
        {/* Image Container */}
        <div className="relative w-full overflow-hidden mb-4">
          <div className="relative pt-[124.333%] bg-gray-100">
            <img
              src={article.image}
              alt={article.alt}
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Category */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 text-xs font-medium border border-gray-800 text-gray-800">
            {article.category}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h2 className="text-xl font-normal leading-tight text-gray-900 group-hover:text-gray-600 transition-colors">
            {article.title}
          </h2>
          <div className="text-sm text-gray-600 leading-relaxed">
            <p className="line-clamp-3">{article.description}</p>
            <button className="text-gray-800 font-medium hover:text-gray-600 transition-colors mt-2">
              Show more
            </button>
          </div>
          <button className="px-6 py-2 border border-gray-800 text-gray-800 text-sm font-medium hover:bg-gray-800 hover:text-white transition-colors">
            Read More
          </button>
        </div>
      </div>
    </div>
  );


};

export default MagazineArticle;
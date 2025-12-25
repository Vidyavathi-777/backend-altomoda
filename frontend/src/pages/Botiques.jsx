import React, { useState, useEffect } from 'react';
import boutiqueData from "../json/Botiques.json"

const BoutiqueCard = ({ boutique, onClick }) => {
      useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, []);
  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl group"
      onClick={() => onClick(boutique)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={boutique.image_url} 
          alt={boutique.city}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div> */}
        <div className="absolute top-4 left-4">
          <span className="bg-gold text-black px-3 py-1 text-xs font-semibold rounded-full">
            {boutique.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-serif font-semibold text-gray-900">{boutique.city}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{boutique.location.split(' - ')[1]}</span>
        </div>
        <p className="text-sm text-gray-600 mb-1">{boutique.name}</p>
        <p className="text-gray-500 text-sm mb-4">{boutique.address}</p>
        <div className="flex items-center text-gold">
          <span className="text-sm font-medium">Discover</span>
          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const BoutiqueDetail = ({ boutique, onBack }) => {
      useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, []);
  const [activeImage, setActiveImage] = useState(0);
  const allImages = [boutique.main_image, ...boutique.gallery_images];

  const formatOpeningHours = (hours) => {
    return Object.entries(hours).map(([day, time]) => (
      <div key={day} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-gray-600 capitalize">{day.replace('_', ' - ')}</span>
        <span className="text-gray-900 font-medium">{time}</span>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-white lg:pt-[200px] pt-[80px]">
      {/* Header */}
      <div className="relative h-full overflow-hidden">
        <img 
          src={boutique.image_url} 
          alt={boutique.city}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-opacity-40"></div>
        <div className="absolute bottom-8 left-8 text-white">
          <button 
            onClick={onBack}
            className="flex items-center text-white mb-6 hover:text-gold transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to boutiques
          </button>
          <h1 className="text-4xl font-serif font-light mb-2">{boutique.city}</h1>
          <p className="text-xl font-serif font-light opacity-90">{boutique.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-light text-gray-900 mb-4">About the boutique</h2>
              <p className="text-gray-700 leading-relaxed">{boutique.description}</p>
            </div>

            {/* Gallery */}
            <div className="mb-8">
              <h3 className="text-xl font-serif font-light text-gray-900 mb-6">Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                      activeImage === index ? 'ring-2 ring-gold' : ''
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${boutique.city} view ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src={allImages[activeImage]} 
                alt={`${boutique.city} featured`}
                className="w-full h-96 object-cover"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-serif font-light text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">{boutique.address}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${boutique.contacts.phone}`} className="text-gray-700 hover:text-gold transition-colors">
                    {boutique.contacts.phone}
                  </a>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gold mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${boutique.contacts.email}`} className="text-gray-700 hover:text-gold transition-colors">
                    {boutique.contacts.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-serif font-light text-gray-900 mb-4">Opening Hours</h3>
              <div className="space-y-1">
                {formatOpeningHours(boutique.opening_hours)}
              </div>
            </div>

            {/* Category */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-serif font-light text-gray-900 mb-2">Category</h3>
              <p className="text-gray-700">{boutique.category}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BoutiquesPage = () => {
      useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, []);
  const [selectedBoutique, setSelectedBoutique] = useState(null);

  if (selectedBoutique) {
    return <BoutiqueDetail boutique={selectedBoutique} onBack={() => setSelectedBoutique(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:pt-[200px] pt-[80px]">
      {/* Header */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-serif font-light text-gray-900 mb-6">
            {boutiqueData.page_title}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4">
            {boutiqueData.page_description}
          </p>
          <p className="text-gray-500 italic">
            {boutiqueData.page_subtitle}
          </p>
        </div>
      </div>

      {/* Boutiques Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boutiqueData.boutiques.map((boutique, index) => (
            <BoutiqueCard 
              key={index}
              boutique={boutique}
              onClick={setSelectedBoutique}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoutiquesPage;
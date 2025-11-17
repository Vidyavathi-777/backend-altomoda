import { useState, useRef, useEffect } from "react";
import axios from "axios";

const TryOnModal = ({ open, onClose, productImage }) => {
  const [userImage, setUserImage] = useState(null);
  const [userImagePreview, setUserImagePreview] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: upload, 2: generating, 3: result
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const fileInputRef = useRef(null);

  // Reset all state when modal closes
  useEffect(() => {
    if (!open) {
      resetAllState();
    }
  }, [open]);

  const resetAllState = () => {
    setUserImage(null);
    setUserImagePreview(null);
    setGeneratedImage(null);
    setLoading(false);
    setError(null);
    setStep(1);
    setLightboxOpen(false);
    setLightboxImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetAllState();
    onClose();
  };

  if (!open) return null;

  const handleTryOn = async () => {
    if (!userImage) {
      alert("Please upload your image");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setGeneratedImage(null);
      setStep(2);

      let outfitUrl = productImage;
      
      if (typeof productImage === 'object' && productImage !== null) {
        outfitUrl = productImage.url || productImage.imageUrl || productImage.src || 
                   productImage.image || productImage.original || 
                   (Array.isArray(productImage.images) ? productImage.images[0] : null);
        
        if (typeof outfitUrl === 'object') {
          throw new Error('Invalid product image format');
        }
      }

      if (!outfitUrl || typeof outfitUrl !== 'string') {
        throw new Error('Invalid product image URL');
      }

      if (!outfitUrl.startsWith('http')) {
        outfitUrl = `${window.location.origin}${outfitUrl.startsWith('/') ? '' : '/'}${outfitUrl}`;
      }

      const formData = new FormData();
      formData.append("userImage", userImage);
      formData.append("outfitUrl", outfitUrl);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/products/tryon`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000
        }
      );

      if (response.data.success) {
        setGeneratedImage(response.data.image);
        setStep(3);
      } else {
        throw new Error(response.data.message || "Try-on failed");
      }

    } catch (err) {
      console.error("Try-on error:", err);
      setError(err.response?.data?.message || err.message || "Try-on failed");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }
      setUserImage(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = { target: { files: [file] } };
      handleImageUpload(event);
    }
  };

  const handleReset = () => {
    setUserImage(null);
    setUserImagePreview(null);
    setGeneratedImage(null);
    setError(null);
    setStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTryAnother = () => {
    setGeneratedImage(null);
    setStep(1);
  };

  const openLightbox = (image) => {
    setLightboxImage(image);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage(null);
  };

  const getProductImageUrl = () => {
    if (typeof productImage === 'string') return productImage;
    if (typeof productImage === 'object' && productImage !== null) {
      return productImage.url || productImage.imageUrl || productImage.src || 
             productImage.image || productImage.original || 
             (Array.isArray(productImage.images) ? productImage.images[0] : '');
    }
    return '';
  };

  const displayProductImage = getProductImageUrl();

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-2xl relative max-h-[95vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Virtual Try-On</h2>
              <p className="text-sm text-gray-600 mt-1">See how this outfit looks on you</p>
            </div>
            <button
              onClick={handleClose}  
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-black text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > stepNumber ? 'bg-black' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Product Preview */}
              {displayProductImage && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-3">Outfit to try on</p>
                  <div className="flex justify-center">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => openLightbox(displayProductImage)}
                    >
                      <img
                        src={displayProductImage}
                        alt="Product outfit"
                        className="w-64 h-64 object-contain rounded-lg bg-white p-2 shadow-sm group-hover:shadow-md transition-shadow duration-200"
                      />
                      <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">Click image to view larger</p>
                </div>
              )}

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors duration-200">
                {!userImagePreview ? (
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">Upload your photo</p>
                    <p className="text-xs text-gray-400">
                      Supported formats: JPEG, PNG • Max size: 10MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-700">Your photo</p>
                    <div 
                      className="flex justify-center cursor-pointer group"
                      onClick={() => openLightbox(userImagePreview)}
                    >
                      <div className="relative">
                        <img
                          src={userImagePreview}
                          alt="Your upload"
                          className="w-48 h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
                        />
                        <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Change photo
                    </button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleTryOn}
                disabled={!userImage}
                className="w-full py-4 px-6 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                Generate Try-On
              </button>
            </div>
          )}

          {/* Step 2: Generating */}
          {step === 2 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating your try-on</h3>
              <p className="text-gray-600">This may take a few moments...</p>
              <p className="text-sm text-gray-500 mt-4">Analyzing your photo and applying the outfit</p>
            </div>
          )}

          {/* Step 3: Result */}
          {step === 3 && generatedImage && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Try-On Result</h3>
                <p className="text-gray-600">Here's how the outfit looks on you</p>
              </div>

              <div className="space-y-6">
                {/* Try-On Result - Larger Display */}
                <div className="text-center">
                  <div 
                    className="cursor-pointer group mx-auto max-w-md"
                    onClick={() => openLightbox(generatedImage)}
                  >
                    <div className="relative">
                      <img
                        src={generatedImage}
                        alt="Try On Result"
                        className="w-full h-80 object-contain rounded-xl bg-gray-50 p-4 shadow-sm border-2 border-green-200 group-hover:shadow-md transition-shadow duration-200"
                      />
                      <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-200 flex items-center justify-center">
                        <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                          <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7" />
                          </svg>
                          <p className="text-sm font-medium">Click to view larger</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">Click the image to view in full size</p>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-gray-100">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = generatedImage;
                    link.download = 'virtual-try-on-result.png';
                    link.click();
                  }}
                  className="text-sm text-gray-600 hover:text-black underline transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Result
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/95 flex justify-center items-center z-[60] p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={lightboxImage}
                alt="Enlarged view"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TryOnModal;
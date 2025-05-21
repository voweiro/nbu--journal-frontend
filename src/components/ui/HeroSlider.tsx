import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface SlideProps {
  title: string;
  description: string;
  imageUrl: string;
}

interface HeroSliderProps {
  slides: SlideProps[];
  autoPlayInterval?: number;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ 
  slides, 
  autoPlayInterval = 5000 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    
    const interval = setInterval(() => {
      goToNextSlide();
    }, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [currentSlide, slides.length, autoPlayInterval]);

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500); // Match this with CSS transition duration
  };

  const goToNextSlide = () => {
    const nextSlide = (currentSlide + 1) % slides.length;
    goToSlide(nextSlide);
  };

  const goToPrevSlide = () => {
    const prevSlide = (currentSlide - 1 + slides.length) % slides.length;
    goToSlide(prevSlide);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Hero image with proper styling */}
          <div className="absolute inset-0 w-full h-full">
            {/* Using regular img tag instead of Next.js Image for background images */}
            <img 
              src={slide.imageUrl} 
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: 'center 30%' }}
            />
            
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black opacity-40"></div>
          </div>
          {/* Text content with proper centering */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center text-white">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 transform transition-transform duration-700 ease-out shadow-text"
                    style={{ 
                      opacity: index === currentSlide ? 1 : 0,
                      transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)'
                    }}>
                  {slide.title}
                </h1>
                <p className="text-lg sm:text-xl opacity-90 mb-8 transform transition-transform duration-700 delay-100 ease-out shadow-text"
                   style={{ 
                     opacity: index === currentSlide ? 1 : 0,
                     transform: index === currentSlide ? 'translateY(0)' : 'translateY(20px)'
                   }}>
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={goToPrevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full focus:outline-none"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={goToNextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full focus:outline-none"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full focus:outline-none transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;

import React, { useState, useEffect } from 'react';
import './BrandsSlider.css';

interface BrandsSliderProps {
  images: string[];
  titles: string[];
}

export const BrandsSlider: React.FC<BrandsSliderProps> = ({ images, titles }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  return (
    <section className="featured-brand-section">
      <div className="featured-brand-slider-container">
        <div className="slider-wrapper">
          <div className="slider-arrow left-arrow" onClick={handlePrev}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
          </div>
          
          <div className="slider-main">
            <img src={images[currentSlide]} alt="Бренд" />
            <div className="brand-label">
              <h3>{titles[currentSlide]}</h3>
            </div>
          </div>
          
          <div className="slider-arrow right-arrow" onClick={handleNext}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </div>
        </div>
        
        <div className="slider-dots">
          {images.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
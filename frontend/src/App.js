import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import HamburgerMenu from "./components/HamburgerMenu";
import DesignCategories from "./components/DesignCategories";
import Hero from "./components/Hero";
import ScrollIndicator from "./components/ScrollIndicator";
import RecentProjects from "./components/RecentProjects";
import Footer from "./components/Footer";
import BrandReviewForm from "./components/BrandReviewForm";
import BrandReview from "./pages/BrandReview";

function HomePage() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <DesignCategories scrollPosition={scrollPosition} />
      <Hero />
      <ScrollIndicator />
      <RecentProjects />
    </>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBrandReviewOpen, setIsBrandReviewOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleBrandReviewOpen = () => {
    setIsBrandReviewOpen(true);
    setIsMenuOpen(false);
    document.body.style.overflow = 'hidden';
  };

  const handleBrandReviewClose = () => {
    setIsBrandReviewOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar 
          onMenuClick={handleMenuToggle} 
          onBrandReviewClick={handleBrandReviewOpen}
        />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/brand-review" element={<BrandReview />} />
        </Routes>
        
        <Footer />
        
        <HamburgerMenu 
          isOpen={isMenuOpen} 
          onClose={handleMenuClose}
          onBrandReviewClick={handleBrandReviewOpen}
        />
        
        <BrandReviewForm 
          isOpen={isBrandReviewOpen} 
          onClose={handleBrandReviewClose}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;

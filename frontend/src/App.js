import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import Work from "./pages/Work";
import ProjectCaseStudy from "./pages/ProjectCaseStudy";

function HomePage() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const pos = window.scrollY;
      setScrollPosition(pos);
      
      // Check if we should dock
      const footer = document.querySelector('.footer');
      const footerTop = footer?.offsetTop || 99999;
      const viewportHeight = window.innerHeight;
      const scrollThreshold = footerTop - viewportHeight + 100;
      
      setIsDocked(pos >= scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <DesignCategories scrollPosition={scrollPosition} isHomePage={true} isDocked={isDocked} />
      <Hero />
      <ScrollIndicator />
      <RecentProjects />
    </>
  );
}

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBrandReviewOpen, setIsBrandReviewOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

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
      <Navbar 
        onMenuClick={handleMenuToggle}
      />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/brand-review" element={<BrandReview />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:projectId" element={<ProjectCaseStudy />} />
      </Routes>
      
      <Footer showDockedRectangle={!isHomePage || (isHomePage && scrollPosition > 1500)} />
      
      <HamburgerMenu 
        isOpen={isMenuOpen} 
        onClose={handleMenuClose}
      />
      
      <BrandReviewForm 
        isOpen={isBrandReviewOpen} 
        onClose={handleBrandReviewClose}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

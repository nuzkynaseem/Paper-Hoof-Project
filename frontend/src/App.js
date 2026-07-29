import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import HamburgerMenu from "./components/HamburgerMenu";
import Hero from "./components/Hero";
import IntroReveal from "./components/IntroReveal";
import RecentProjects from "./components/RecentProjects";
import MoreWorks from "./components/MoreWorks";
import Footer from "./components/Footer";
import BrandReviewForm from "./components/BrandReviewForm";
import BrandReview from "./pages/BrandReview";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import Work from "./pages/Work";
import ProjectCaseStudy from "./pages/ProjectCaseStudy";
import CustomCursor from "./components/CustomCursor";

function HomePage() {
  return (
    <>
      <Hero />
      <IntroReveal />
      <RecentProjects />
      <MoreWorks />
    </>
  );
}

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBrandReviewOpen, setIsBrandReviewOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Show the custom scrollbar only while the user is actively scrolling
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      document.documentElement.classList.add('is-scrolling');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        document.documentElement.classList.remove('is-scrolling');
      }, 700);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleBrandReviewClose = () => {
    setIsBrandReviewOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="App">
      <CustomCursor />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar 
        onMenuClick={handleMenuToggle}
        isMenuOpen={isMenuOpen}
        darkHero={isHomePage}
      />
      
      <main id="main-content" tabIndex="-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/brand-review" element={<BrandReview />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:projectId" element={<ProjectCaseStudy />} />
        </Routes>
      </main>

      <Footer />
      
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

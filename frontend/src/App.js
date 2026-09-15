import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import HamburgerMenu from "./components/HamburgerMenu";
import Hero from "./components/Hero";
import IntroReveal from "./components/IntroReveal";
import RecentProjects from "./components/RecentProjects";
import MoreWorks from "./components/MoreWorks";
import Footer from "./components/Footer";
import BrandReviewForm from "./components/BrandReviewForm";
import CustomCursor from "./components/CustomCursor";
import PageLoader from "./components/PageLoader";
import { API_BASE } from "./utils/api";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import SEO from "./components/SEO";

// Route-level code splitting to keep initial bundle ultra-light
const BrandReview = lazy(() => import("./pages/BrandReview"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Work = lazy(() => import("./pages/Work"));
const ProjectCaseStudy = lazy(() => import("./pages/ProjectCaseStudy"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));

function HomePage() {
  return (
    <>
      <SEO
        title="Paper Hoof Studio — Brand Strategy & Digital Experience"
        description="Paper Hoof is an independent brand design studio operating at the intersection of clarity, tactile beauty, and digital strategy. We craft enduring brand identities and web experiences."
        path="/"
      />
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
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Record visit analytics on public load (syncs with Vercel Web Analytics)
  useEffect(() => {
    if (!isAdminRoute) {
      fetch(`${API_BASE}/analytics/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: location.pathname,
          referrer: document.referrer || "direct",
          screen: `${window.innerWidth}x${window.innerHeight}`
        })
      }).catch(() => {});
    }
  }, [location.pathname, isAdminRoute]);

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

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0d1a14] flex items-center justify-center text-[#97D9AF]">Loading...</div>}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="App">
      <Analytics />
      <SpeedInsights />
      <PageLoader />
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
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/brand-review" element={<BrandReview />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/work" element={<Work />} />
            <Route path="/work/:projectId" element={<ProjectCaseStudy />} />
          </Routes>
        </Suspense>
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

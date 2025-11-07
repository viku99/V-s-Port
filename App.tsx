//  Root Application Component
// This file orchestrates the entire application.
// It sets up routing, the main layout, and the global EditorProvider
// which powers the in-page, real-time content editing functionality.

import React, { ReactNode } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Header from './components/Header';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PortfolioPage from './pages/PortfolioPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import Chatbot from './components/Chatbot';
import ScrollToTop from './components/ScrollToTop';

import { EditorProvider, useEditor } from './components/EditorProvider';
import EditorToolbar from './components/EditorToolbar';
import LoginModal from './components/LoginModal';
import MediaUploadModal from './components/MediaUploadModal';

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-black text-white">
          <h1 className="text-5xl font-black uppercase mb-4">Something went wrong.</h1>
          <p className="text-xl text-neutral-400 mb-8">
            An unexpected error occurred. Please try again or return to the homepage.
          </p>
          <motion.a
            href="/"
            className="shimmer-button group inline-block mt-8 px-6 py-3 border border-white text-white uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Return to Home <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
          </motion.a>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Top Loading Bar Component ---
const TopLoader: React.FC = () => (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
        <motion.div
            className="h-full bg-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            style={{ transformOrigin: '0% 50%' }}
        />
    </div>
);


// --- Main App Wrapper ---
function App() {
  return (
    <HashRouter>
      <EditorProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-black text-neutral-100 antialiased">
          <Header />
          <main className="pl-0 md:pl-20">
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </main>
          <Chatbot />
          <EditorToolbar />
          <LoginModal />
          <MediaUploadModal />
        </div>
      </EditorProvider>
    </HashRouter>
  );
};

// --- Animated Routes ---
function AppRoutes() {
    const location = useLocation();
    const { isLoading, siteContent, error } = useEditor();

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-5xl font-black uppercase mb-4">Failed to Load Content</h1>
              <p className="text-xl text-neutral-400 mb-8">
                There was a problem fetching the site's data. Please try refreshing the page.
              </p>
              <p className="text-sm text-neutral-500 font-mono mb-8">Error: {error}</p>
              <motion.button
                onClick={() => window.location.reload()}
                className="shimmer-button group inline-block mt-8 px-6 py-3 border border-white text-white uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Refresh Page
              </motion.button>
            </div>
        );
    }

    if (isLoading || !siteContent) {
        return <TopLoader />;
    }

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/portfolio/:slug" element={<ProjectDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </AnimatePresence>
    );
}

export default App;
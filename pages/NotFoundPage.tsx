import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';

const NotFoundPage: React.FC = () => {
  return (
    <AnimatedPage>
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: 'spring' }}
        >
          <h1 className="text-8xl md:text-9xl font-black text-neutral-800">
            404
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-wider mt-4 text-white">
            Page Not Found
          </h2>
          <p className="text-lg text-neutral-400 mt-6 max-w-md">
            The page you're looking for might have been moved, deleted, or perhaps never existed.
          </p>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring', delay: 0.2 }}
        >
          <Link
            to="/portfolio"
            className="group inline-block mt-12 px-6 py-3 border border-white text-white uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-300"
          >
            Back to Portfolio <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
          </Link>
        </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default NotFoundPage;
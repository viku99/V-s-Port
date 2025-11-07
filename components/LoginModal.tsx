import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor } from './EditorProvider';
import Icon from './Icon';

function LoginModal() {
    const { isLoginVisible, setIsLoginVisible, login } = useEditor();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const usernameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isLoginVisible) {
            setTimeout(() => usernameRef.current?.focus(), 100);
        } else {
            setUsername('');
            setPassword('');
            setError('');
            setIsLoading(false);
        }
    }, [isLoginVisible]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(username, password);
            if (!result.success) {
                setError(result.message || 'An error occurred.');
            }
        } catch (e) {
            setError('An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const formInputStyles = "w-full py-3 bg-neutral-800 border border-neutral-700 rounded-md px-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all";

    return (
        <AnimatePresence>
            {isLoginVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[102] flex items-center justify-center p-4"
                    onClick={() => setIsLoginVisible(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl w-full max-w-sm p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-white mb-2 text-center">Editor Access</h2>
                        <p className="text-sm text-neutral-400 mb-6 text-center">Login to manage site content.</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <input
                                    ref={usernameRef}
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className={formInputStyles}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className={formInputStyles}
                                />
                            </div>

                             <AnimatePresence>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="text-xs text-red-500 text-center"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <div className="pt-2">
                                <motion.button
                                    type="submit"
                                    className="shimmer-button group w-full flex items-center justify-center mt-4 px-6 py-3 border border-white text-white uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-300 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:border-neutral-700 disabled:cursor-not-allowed"
                                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Icon name="spinner" className="text-current -ml-1 mr-3" /> : 'Login'}
                                </motion.button>
                            </div>
                            <p className="text-xs text-neutral-500 text-center pt-2">Admin access only. Activity is logged.</p>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default LoginModal;
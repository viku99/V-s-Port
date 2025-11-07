import React from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';

const socialLinks = [
    { name: 'linkedin', href: "https://www.linkedin.com/in/vikasbala19" },
    { name: 'behance', href: "https://www.behance.net/vikasbala" },
    { name: 'github', href: "https://github.com/viku99" },
    { name: 'instagram', href: "https://www.instagram.com/zorox.x_" },
    { name: 'mail', href: "mailto:vikasbg.png@gmail.com" },
];

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative z-10 w-full text-text-muted text-sm text-center p-4 md:pl-20">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <p>&copy; {currentYear} Vikas. All Rights Reserved.</p>
                <div className="flex items-center gap-4">
                    {socialLinks.map(link => (
                        <motion.a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text-muted hover:text-text-primary transition-colors duration-300"
                            title={link.name.charAt(0).toUpperCase() + link.name.slice(1)}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Icon name={link.name} className="w-5 h-5" />
                        </motion.a>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;

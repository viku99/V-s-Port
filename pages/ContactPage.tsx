// 📞 Contact Page
// This page provides ways to get in touch.
// It includes an AI-powered contact form that analyzes the user's message
// to suggest the most appropriate communication channel.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from '@google/genai';
import AnimatedPage from '../components/AnimatedPage';
import Icon from '../components/Icon';


// --- Types & Data ---
interface Suggestion {
  channel: string;
  reason: string;
  cta_text: string;
  link: string;
}

const socialLinks = [
    { name: 'linkedin', href: "https://www.linkedin.com/in/vikasbala19" },
    { name: 'behance', href: "https://www.behance.net/vikasbala" },
    { name: 'github', href: "https://github.com/viku99" },
    { name: 'instagram', href: "https://www.instagram.com/zorox.x_" },
    { name: 'whatsapp', href: "https://wa.me/919043529067" },
    { name: 'discord', href: "https://discord.com/users/zororobinxo" },
    { name: 'mail', href: "mailto:vikasbg.png@gmail.com" },
];

const iconMap: { [key: string]: string } = {
    'LinkedIn': 'linkedin',
    'Behance': 'behance',
    'Github': 'github',
    'Instagram': 'instagram',
    'WhatsApp': 'whatsapp',
    'Discord': 'discord',
    'Email': 'mail',
};


function ContactPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(e.target.value);
    if (suggestion) setSuggestion(null);
    if (error) setError(null);
  }
    
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setSuggestion(null);
    setError(null);

    if (!process.env.API_KEY) {
        setError("Sorry, the AI assistant is not configured. The site administrator needs to set up an API key.");
        setIsLoading(false);
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = `You are a smart communications assistant for Vikas, a Motion Designer. Your job is to analyze incoming messages and suggest the best way for the user to contact him.

You must choose one of the following channels:
- **Email**: For formal business, job offers, freelance projects, and detailed professional inquiries.
- **LinkedIn**: For professional networking, recruitment, and corporate collaborations.
- **Discord**: For creative collaborations, community chat, and peer-to-peer technical discussions.
- **Behance**: For feedback on portfolio work or connecting with the creative community.
- **Instagram**: For casual messages, quick questions, and social interactions.
- **WhatsApp**: Only for very urgent or direct communication. Use this sparingly.

**Handling Inappropriate or Unclear Messages:**
- If the user's message is abusive, inappropriate, sexually explicit, nonsensical (e.g., 'meow', 'asdfghjk'), or completely irrelevant to a professional inquiry, you MUST decline to process it. Respond with the following JSON object:
  \`\`\`json
  {
    "channel": "Decline",
    "reason": "I can only process messages related to professional inquiries. Please provide details about a project or collaboration.",
    "cta_text": "",
    "link": ""
  }
  \`\`\`
- Do NOT engage with inappropriate content. Simply return the 'Decline' object.

**Standard Response:**
For all legitimate inquiries, analyze the user's message for its tone, content, and likely intent. Based on your analysis, you must return a JSON object with the *exact* following structure:
\`\`\`json
{
  "channel": "The single best channel name from the list above",
  "reason": "A short, friendly, one-sentence explanation for your choice.",
  "cta_text": "A compelling call-to-action for the button, like 'Connect on LinkedIn' or 'Send an Email'.",
  "link": "The corresponding contact link."
}
\`\`\`

Here are the links for each channel:
- Email: "mailto:vikasbg.png@gmail.com?subject=Contact from Portfolio&body=${encodeURIComponent(message)}"
- LinkedIn: "https://www.linkedin.com/in/vikasbala19"
- Discord: "https://discord.com/users/zororobinxo"
- Behance: "https://www.behance.net/vikasbala"
- Instagram: "https://www.instagram.com/zorox.x_"
- WhatsApp: "https://wa.me/919043529067"

Be thoughtful in your recommendation to ensure the communication is efficient and professional.`;
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                channel: { type: Type.STRING },
                reason: { type: Type.STRING },
                cta_text: { type: Type.STRING },
                link: { type: Type.STRING },
            },
            required: ["channel", "reason", "cta_text", "link"]
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `From: ${name || 'Anonymous'}\n\nMessage:\n${message}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema
            },
        });
        
        const responseText = response.text;
        if (!responseText) {
            throw new Error("Received an empty response from the AI. This could be due to content filtering or a network issue.");
        }

        const parsedSuggestion = JSON.parse(responseText);
        
        if (parsedSuggestion.channel === 'Decline') {
            setError(parsedSuggestion.reason);
            setSuggestion(null);
        } else {
            setSuggestion(parsedSuggestion);
        }

    } catch (err) {
        console.error("AI analysis failed:", err);
        setError("Sorry, the AI assistant is currently unavailable. Please use a social link below.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const formInputStyles = "w-full py-3 bg-transparent border-b border-neutral-700 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-500";

  return (
    <AnimatedPage>
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="container mx-auto max-w-lg text-center">
            
            <motion.h1 
                className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
            >
                Get In Touch
            </motion.h1>
            <motion.p
                className="text-neutral-400 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                Have a project in mind? Let my AI assistant find the best way to connect.
            </motion.p>
          
            <motion.form 
                onSubmit={handleSubmit}
                className="space-y-6 text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
            >
                <input
                    type="text"
                    placeholder="Your Name"
                    className={formInputStyles}
                    value={name}
                    onChange={handleTextChange(setName)}
                />
                <textarea
                    placeholder="Your Message"
                    required
                    rows={4}
                    className={`${formInputStyles} resize-none`}
                    value={message}
                    onChange={handleTextChange(setMessage)}
                ></textarea>
                <motion.button
                  type="submit"
                  className="shimmer-button group w-full mt-8 px-6 py-3 border border-white text-white uppercase text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center disabled:bg-neutral-800 disabled:text-neutral-500 disabled:border-neutral-700 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  disabled={isLoading || !message.trim()}
                >
                    {isLoading ? (
                        <>
                            <Icon name="spinner" className="mr-2" />
                            <span>Analyzing...</span>
                        </>
                    ) : (
                       "Send Message"
                    )}
                </motion.button>
            </motion.form>

            <AnimatePresence>
                {suggestion && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-8 bg-neutral-900 border border-neutral-800 p-6 rounded-lg text-left"
                    >
                       <div className="flex items-start gap-4">
                           <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-neutral-800 text-neutral-300 rounded-full">
                                <Icon name={iconMap[suggestion.channel] || 'mail'} />
                           </div>
                           <div>
                                <h4 className="font-bold text-white">Suggested Channel: {suggestion.channel}</h4>
                                <p className="text-sm text-neutral-400 mt-1">{suggestion.reason}</p>
                                <motion.a 
                                    href={suggestion.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shimmer-button group inline-block mt-4 px-5 py-2 bg-blue-600 text-white font-bold text-sm tracking-wider uppercase rounded-md hover:bg-blue-500 transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {suggestion.cta_text} <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                                </motion.a>
                           </div>
                       </div>
                    </motion.div>
                )}
                {error && (
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 text-red-500 text-sm"
                    >
                       {error}
                    </motion.p>
                )}
            </AnimatePresence>

            <motion.div
                className="flex justify-center items-center space-x-6 mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6 }}
            >
                {socialLinks.map((link, index) => (
                    <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors duration-300" title={link.name}>
                        <Icon name={link.name} />
                    </a>
                ))}
            </motion.div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default ContactPage;
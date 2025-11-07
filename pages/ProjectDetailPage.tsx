// 📄 Project Detail Page
// This page showcases a single project in detail, now with full inline editing capabilities.

import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { useEditor } from '../components/EditorProvider';
import Editable from '../components/Editable';
import Icon from '../components/Icon';


// Define YT types for the global window object to avoid TS errors
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

// --- Helper to get video ID from various YouTube URL formats ---
const getYouTubeVideoId = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        let videoId: string | null = null;
        
        const hostname = urlObj.hostname;
        const pathname = urlObj.pathname;

        if (hostname.includes('youtube.com')) {
            if (pathname.startsWith('/shorts/')) {
                videoId = pathname.split('/')[2];
            } else {
                videoId = urlObj.searchParams.get('v');
            }
        } else if (hostname.includes('youtu.be')) {
            videoId = pathname.slice(1);
        }
        
        if (videoId) {
            // Clean any potential query params from the video ID
            return videoId.split('?')[0];
        }
        return null;
    } catch (e) {
        return null;
    }
};

const YOUTUBE_API_SRC = 'https://www.youtube.com/iframe_api';

// --- Floating Video Player Component ---
const FloatingVideoPlayer: React.FC<{ src: string }> = ({ src }) => {
    const [isMini, setIsMini] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isClosed, setIsClosed] = useState(false);
    const [playbackError, setPlaybackError] = useState(false);
    const [shouldScroll, setShouldScroll] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const playerDivRef = useRef<HTMLDivElement>(null);
    const playerInstanceRef = useRef<any>(null);

    const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
    const videoId = isYouTube ? getYouTubeVideoId(src) : null;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!playerInstanceRef.current && isYouTube) return;
    
                if (entry.isIntersecting) {
                    setIsMini(false);
                    setIsClosed(false);
                } else {
                    if (!isClosed) {
                        setIsMini(true);
                    }
                }
            },
            { threshold: 0.5 }
        );
        
        const currentContainer = containerRef.current;
        if (currentContainer) {
            observer.observe(currentContainer);
        }
    
        return () => {
            if (currentContainer) {
                observer.unobserve(currentContainer);
            }
        };
    }, [isClosed, isYouTube]);

    useEffect(() => {
        if (!isYouTube || !videoId || !playerDivRef.current) return;
        
        const createPlayer = () => {
            if (playerInstanceRef.current) playerInstanceRef.current.destroy();
            playerInstanceRef.current = new window.YT.Player(playerDivRef.current, {
                videoId: videoId,
                playerVars: { autoplay: 1, mute: 1, loop: 1, playlist: videoId, controls: 1, modestbranding: 1, rel: 0 },
                events: {
                    'onReady': (event: any) => {
                        setIsPlaying(true);
                        const iframe = event.target.getIframe();
                        if (iframe) {
                            iframe.setAttribute('disablepictureinpicture', 'true');
                        }
                    },
                    'onError': (e: any) => { if ([101, 150].includes(e.data)) setPlaybackError(true); },
                    'onStateChange': (e: any) => setIsPlaying(e.data === window.YT.PlayerState.PLAYING)
                }
            });
        };
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = YOUTUBE_API_SRC;
            document.body.appendChild(tag);
            window.onYouTubeIframeAPIReady = createPlayer;
        } else {
            createPlayer();
        }
        return () => {
            if (playerInstanceRef.current) playerInstanceRef.current.destroy();
            if (window.onYouTubeIframeAPIReady) window.onYouTubeIframeAPIReady = () => {};
        };
    }, [isYouTube, videoId]);
    
    useEffect(() => {
        if (shouldScroll) {
            containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setShouldScroll(false);
        }
    }, [shouldScroll]);

    const handlePlayPause = () => {
        if (!playerInstanceRef.current) return;
        const player = playerInstanceRef.current;
        if (isPlaying) {
            isYouTube ? player.pauseVideo() : player.pause();
        } else {
            isYouTube ? player.playVideo() : player.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleClose = () => {
        if (playerInstanceRef.current && isPlaying) {
            if (isYouTube) {
                playerInstanceRef.current.pauseVideo();
            } else {
                playerInstanceRef.current.pause();
            }
            setIsPlaying(false);
        }
        setIsClosed(true);
    };

    const handleExpand = () => {
        setIsMini(false);
        setShouldScroll(true);
    };

    if (playbackError && videoId) {
        return (
            <div className="relative aspect-video bg-black rounded-lg group flex flex-col items-center justify-center text-center p-4">
                <img src={`https://i3.ytimg.com/vi/${videoId}/maxresdefault.jpg`} alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2">Playback Unavailable</h3>
                    <p className="text-neutral-300 mb-4 text-sm max-w-sm">This video can't be embedded. Please watch it directly on YouTube.</p>
                    <a href={src} target="_blank" rel="noopener noreferrer" className="shimmer-button group inline-block mt-4 px-5 py-2 bg-red-600 text-white font-bold text-sm tracking-wider uppercase rounded-md hover:bg-red-500 transition-all duration-300">
                        Watch on YouTube <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </a>
                </div>
            </div>
        );
    }
    
    return (
        <div ref={containerRef} className="relative aspect-video w-full h-full bg-black rounded-lg overflow-hidden">
             <AnimatePresence>
                {!isClosed && (
                    <motion.div
                        layout
                        className={`${isMini ? "fixed bottom-4 right-4 w-64 md:w-80 h-auto z-[101] rounded-lg overflow-hidden shadow-2xl bg-black" : "absolute inset-0 w-full h-full"}`}
                        drag={isMini}
                        dragConstraints={{ top: 16, left: 16, right: window.innerWidth - (window.innerWidth > 768 ? 320 : 256) - 16, bottom: window.innerHeight - 144 - 16 }}
                        dragMomentum={false}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                        <div className={`relative w-full h-full aspect-video transition-all duration-300 ease-in-out ${!isPlaying ? 'grayscale scale-105' : 'grayscale-0 scale-100'}`}>
                            {isYouTube ? (
                                <div ref={playerDivRef} className="w-full h-full" />
                            ) : (
                                <video ref={playerInstanceRef} key={src} className="w-full h-full object-contain" controls loop muted playsInline autoPlay onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} disablePictureInPicture>
                                    <source src={src} type="video/mp4" />
                                </video>
                            )}
                            {isMini && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 text-white">
                                    <button onClick={handleExpand} title="Expand" className="p-2 rounded-full hover:bg-white/20"><Icon name="expand"/></button>
                                    <button onClick={handlePlayPause} title={isPlaying ? "Pause" : "Play"} className="p-2 rounded-full hover:bg-white/20">{isPlaying ? <Icon name="pause"/> : <Icon name="play" />}</button>
                                    <button onClick={handleClose} title="Close" className="p-2 rounded-full hover:bg-white/20"><Icon name="close" className="w-5 h-5"/></button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

function ProjectDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { siteContent } = useEditor();
    
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const shareMenuRef = useRef<HTMLDivElement>(null);

    const projectIndex = siteContent?.projects.findIndex(p => p.id === slug);
    const project = projectIndex !== -1 ? siteContent?.projects[projectIndex!] : undefined;
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
                setIsShareOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!project) {
        return <Navigate to="/portfolio" replace />;
    }
    
    const handleCopyLink = () => {
        if (!isCopied) {
            navigator.clipboard.writeText(window.location.href).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            });
        }
    };

    const hasMedia = project.video || project.images.length > 0;
    const basePath = `projects[${projectIndex}]`;

    const MainMedia = () => {
        if (project.video) {
            return (
                <Editable path={`${basePath}.video`} type="media">
                    <FloatingVideoPlayer src={project.video} />
                </Editable>
            );
        }
        if (project.thumbnail) {
            return (
                <Editable path={`${basePath}.thumbnail`} type="media">
                     <div className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden">
                        <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                     </div>
                </Editable>
            );
        }
        return (
             <Editable path={`${basePath}.thumbnail`} type="media">
                 <div className="relative aspect-video bg-neutral-900 rounded-lg flex items-center justify-center">
                    <p className="text-neutral-500">No media found. Add a thumbnail or video URL in Edit Mode.</p>
                 </div>
            </Editable>
        );
    };

    const pageUrl = window.location.href;
    const shareText = `Check out "${project.title}" from Vikas's portfolio:`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`;
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;

    return (
        <AnimatedPage>
            <div className="min-h-screen p-4 md:p-8 pt-24 md:pt-8">
                <div className="container mx-auto max-w-6xl">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="mb-8">
                        <Link to="/portfolio" className="group text-neutral-400 hover:text-white transition-colors duration-300 inline-flex items-center">
                            <Icon name="arrow-left" className="inline-block transition-transform duration-300 group-hover:-translate-x-1 mr-2 w-5 h-5"/> Back to Portfolio
                        </Link>
                    </motion.div>

                    <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="mb-8 text-center">
                        <Editable as="h1" path={`${basePath}.title`} className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-2" />
                        <p className="text-lg text-neutral-400">
                            <Editable path={`${basePath}.category`} as="span" /> &bull; <Editable path={`${basePath}.year`} as="span" />
                        </p>
                    </motion.header>

                    <motion.div className="mb-6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
                       <MainMedia />
                    </motion.div>

                    <motion.div
                        className="mb-12 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="relative inline-block text-left" ref={shareMenuRef}>
                            <div>
                                <motion.button
                                    onClick={() => setIsShareOpen(!isShareOpen)}
                                    type="button"
                                    className="inline-flex items-center justify-center px-4 py-2 border border-neutral-700 text-sm font-medium rounded-md text-neutral-300 bg-neutral-900/50 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-blue-500 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Icon name="share" className="mr-2" />
                                    Share
                                </motion.button>
                            </div>
                            <AnimatePresence>
                                {isShareOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        transition={{ duration: 0.15 }}
                                        style={{ originX: 0.5, originY: 0 }}
                                        className="origin-top absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-md shadow-lg bg-neutral-900 border border-neutral-800 focus:outline-none z-10"
                                    >
                                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                            <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white w-full text-left transition-colors" role="menuitem">
                                                <Icon name="twitter" /> Share on Twitter
                                            </a>
                                            <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white w-full text-left transition-colors" role="menuitem">
                                                <Icon name="linkedin" /> Share on LinkedIn
                                            </a>
                                            <button onClick={handleCopyLink} className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white w-full text-left transition-colors" role="menuitem">
                                                {isCopied ? <Icon name="check" className="text-green-500" /> : <Icon name="copy" />}
                                                {isCopied ? 'Copied!' : 'Copy Link'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                        <motion.div 
                            className="lg:col-span-1" 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.7 }}
                        >
                            <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">About the Project</h2>
                            <Editable path={`${basePath}.description`} as="div" className="text-neutral-300 leading-relaxed mb-8 max-w-prose" multiline />
                            
                            <h3 className="text-xl font-bold uppercase tracking-wider mb-4">Tools Used</h3>
                            <div className="flex flex-wrap gap-2">
                                <Editable
                                    path={`${basePath}.tools`}
                                    multiline
                                    label="Tools (comma separated)"
                                    render={(tools: string[]) => tools.map(tool => (
                                        <span key={tool} className="bg-neutral-800 text-neutral-300 px-3 py-1 text-sm font-medium rounded-full">
                                            {tool}
                                        </span>
                                    ))}
                                />
                            </div>
                        </motion.div>

                        {hasMedia && project.images.length > 0 && (
                            <motion.div 
                                className="lg:col-span-2" 
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.7 }}
                            >
                                <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">Gallery</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {project.images.map((image, index) => (
                                        <Editable
                                            key={image + index}
                                            path={`${basePath}.images[${index}]`}
                                            type="media"
                                        >
                                            <motion.div className="group relative aspect-video overflow-hidden rounded-lg" whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
                                                <img src={image} alt={`Project image ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                            </motion.div>
                                        </Editable>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}

export default ProjectDetailPage;
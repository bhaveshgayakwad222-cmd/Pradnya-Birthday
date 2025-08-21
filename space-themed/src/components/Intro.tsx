import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Music2, Rocket, Star, Globe, Moon,
  User, SendHorizonal
} from 'lucide-react';
import bgMusic from './music/huahain.mp3';
import CoverImg from './img/main.jpg';

// Cosmic animated background with stars
function CosmicBackground() {
  // Use useMemo to generate star positions only once
  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 8 + 2;
      const delay = Math.random() * 5;
      
      return { id: i, size, x, y, duration, delay };
    });
  }, []);
  
  return (
    <>
      {/* Deep space gradient background */}
      <motion.div
        className="fixed inset-0 z-0 overflow-hidden" // Changed from absolute to fixed
        animate={{
          background: [
            "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
            "linear-gradient(135deg, #16222A, #3A6073, #16222A)",
            "linear-gradient(135deg, #000428, #004e92, #000428)"
          ]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Star layer */}
      <div className="fixed inset-0 z-1"> {/* Changed from absolute to fixed */}
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              width: star.size,
              height: star.size,
              left: `${star.x}%`,
              top: `${star.y}%`,
              boxShadow: `0 0 ${star.size + 1}px ${star.size/2}px rgba(255, 255, 255, 0.8)`
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay
            }}
          />
        ))}
      </div>
    </>
  );
}

// Background music component
function BgMusic({ audioRef, isPlaying }) {
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => console.error('Audio playback failed:', error));
        }
      } else {
        audioRef.current.pause();
      }
    }
    
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [audioRef, isPlaying]);

  return null;
}

// Floating space objects with fixed positions
function FloatingSpaceObjects() {
  // Use useMemo to generate object positions only once
  const spaceObjectsWithPositions = useMemo(() => {
    const spaceObjects = [
      { Icon: Star, color: 'text-yellow-300', size: 24 },
      { Icon: Moon, color: 'text-gray-300', size: 28 },
      { Icon: Rocket, color: 'text-red-400', size: 32 },
      { Icon: Globe, color: 'text-blue-400', size: 30 },
    ];
    
    // Generate positions for each object
    return spaceObjects.flatMap((obj, index) => 
      Array.from({ length: 2 }).map((_, i) => ({
        ...obj,
        id: `${index}-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: index * 0.8 + i * 0.4
      }))
    );
  }, []);
  
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {spaceObjectsWithPositions.map((obj) => (
        <motion.div
          key={obj.id}
          initial={{ opacity: 0 }}
          animate={{
            y: [0, 20, 0],
            opacity: [0.2, 1, 0.2],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 10,
            delay: obj.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute"
          style={{
            left: `${obj.x}%`,
            top: `${obj.y}%`,
          }}
        >
          <obj.Icon className={obj.color} size={obj.size} />
        </motion.div>
      ))}
    </div>
  );
}

// Music attachment component
function MusicAttachment({ onSongChoice, audioRef }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => {
      if (audio.duration) {
        const currentProgress = (audio.currentTime / audio.duration) * 100;
        setProgress(currentProgress);
        
        // Trigger completion after 3 seconds of playing if not already completed
        if (audio.currentTime >= 3 && !completedRef.current) {
          completedRef.current = true;
          onSongChoice(); // Signal completion but don't stop playing
        }
      }
    };
    
    audio.addEventListener('timeupdate', updateProgress);
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, [audioRef, onSongChoice]);

  const togglePlay = () => {
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-md shadow-lg border border-indigo-500/30 p-1 w-64 cursor-pointer"
      onClick={togglePlay}
    >
      <div className="flex items-center space-x-3 p-2">
        <div className="relative w-12 h-12 rounded-md overflow-hidden">
          <motion.img 
            src={CoverImg} 
            alt="Music" 
            className="w-full h-full object-cover"
            animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Music size={18} className="text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-white text-sm truncate">Hua Hain Aaj Pehli Bar</h4>
          <p className="text-indigo-200/80 text-xs">From Sanam Re</p>
          <div className="mt-1 w-full h-1 bg-indigo-900/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-400"
              style={{ width: `${progress}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
        </div>
        
        <div>
          {isPlaying ? 
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity }}>
              <Music2 size={18} className="text-indigo-300" />
            </motion.div>
            : <Music size={18} className="text-indigo-300" />
          }
        </div>
      </div>
    </motion.div>
  );
}

interface IntroProps {
  onComplete: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  isMusicPlaying: boolean;
  setIsMusicPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Intro: React.FC<IntroProps> = ({ onComplete, audioRef, isMusicPlaying, setIsMusicPlaying }) => {
  const chatBottomRef = useRef(null);
  const messagesInitializedRef = useRef(false);
  const [messages, setMessages] = useState([]);
  const [showReplyOptions, setShowReplyOptions] = useState(false);
  const [showMusicAttachment, setShowMusicAttachment] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Space-themed messages
  const cosmicMessages = [
    "Heyyy! It's your birthday and i wanted to do something special...",
    "I've prepared an interstellar journey through the universe of memories just for you... 🚀",
    "Would you like to explore this?",
  ];
  
  // Show messages progressively
  useEffect(() => {
    const showMessages = async () => {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1000));
      
      // First message
      setMessages([{ sender: 'cosmos', text: cosmicMessages[0] }]);
      setIsTyping(false);
      
      // Subsequent messages
      for (let i = 1; i < cosmicMessages.length - 1; i++) {
        await new Promise(r => setTimeout(r, 1500));
        setIsTyping(true);
        await new Promise(r => setTimeout(r, 1000));
        setMessages(prev => [...prev, { sender: 'cosmos', text: cosmicMessages[i] }]);
        setIsTyping(false);
      }
      
      // Final question with options
      await new Promise(r => setTimeout(r, 1500));
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1000));
      setMessages(prev => [...prev, { 
        sender: 'cosmos', 
        text: cosmicMessages[cosmicMessages.length - 1] 
      }]);
      setIsTyping(false);
      setShowReplyOptions(true);
    };
    
    if (!messagesInitializedRef.current) {
      showMessages();
      messagesInitializedRef.current = true;
    }
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showReplyOptions, showMusicAttachment]);

  const handleUserReply = (replyText) => {
    setShowReplyOptions(false);
    setMessages(prev => [...prev, { sender: 'user', text: replyText }]);
    
    // Show typing then music attachment
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          sender: 'cosmos', 
          text: "Here's something special from across the cosmos that I think you'll enjoy..." 
        }]);
        
        setTimeout(() => setShowMusicAttachment(true), 1000);
      }, 2000);
    }, 1000);
  };

  const handleSongComplete = () => {
    setIsMusicPlaying(true);
    
    // Create a sequence of events with clear timing
    const showMessage = (text, delay = 0) => {
      return new Promise(resolve => {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { sender: 'cosmos', text }]);
            resolve();
          }, 1500);
        }, delay);
      });
    };

    // Execute sequence in order with async/await pattern
    const runSequence = async () => {
      // // First message after a delay
      await showMessage("Preparing for the travel. Are you ready to journey through space and time?", 1000);
      
      // Second message
      await showMessage("Let's go! 🚀", 1000);
      
      // Then show final message and complete
      setTimeout(() => {
        setShowFinalMessage(true);
        setTimeout(() => onComplete(), 3000);
      }, 1500);
    };
    
    // Start the sequence
    runSequence();
  };

  const toggleMusic = (e) => {
    e.stopPropagation();
    setIsMusicPlaying(prev => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative overflow-hidden"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      <CosmicBackground />
      <FloatingSpaceObjects />
      
      {/* Music Toggle Button */}
      <motion.button
        className="fixed top-5 right-5 z-50 bg-gray-900/70 backdrop-blur rounded-full p-3 shadow-lg border border-indigo-500/30"
        whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(129, 140, 248, 0.5)' }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMusic}
        animate={{ 
          boxShadow: isMusicPlaying ? '0 0 10px rgba(129, 140, 248, 0.7)' : '0 0 5px rgba(129, 140, 248, 0.3)'
        }}
      >
        {isMusicPlaying ? 
          <Music2 size={24} className="text-indigo-300" /> : 
          <Music size={24} className="text-indigo-400" />
        }
      </motion.button>

      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-10">
        <AnimatePresence mode="wait">
          {!showFinalMessage ? (
            <motion.div 
              className="w-full max-w-md mx-auto bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-indigo-500/30 overflow-hidden flex flex-col h-[600px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Chat header */}
              <div className="p-4 border-b border-indigo-500/20 flex items-center space-x-3">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center"
                  animate={{ 
                    boxShadow: ['0 0 0 rgba(79, 70, 229, 0.4)', '0 0 15px rgba(79, 70, 229, 0.6)', '0 0 0 rgba(79, 70, 229, 0.4)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Globe size={20} className="text-indigo-100" />
                </motion.div>
                <div>
                  <h3 className="text-indigo-100 font-medium">Happy Birthday Madam</h3>
                  <div className="flex items-center text-xs text-indigo-300/70">
                    <motion.span 
                      className="w-2 h-2 rounded-full bg-green-400 mr-1"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span>Online from Alpha Centauri</span>
                  </div>
                </div>
              </div>
              
              {/* Chat messages - Hide scrollbar */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-3" 
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {/* Hide webkit scrollbar */}
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message.sender === 'cosmos' && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2 mt-1">
                        <Globe size={15} className="text-indigo-100" />
                      </div>
                    )}
                    
                    <div 
                      className={`rounded-2xl px-4 py-2 max-w-[75%] ${
                        message.sender === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-gray-800/80 text-indigo-100 rounded-tl-none border border-indigo-500/20'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center ml-2 mt-1">
                        <User size={15} className="text-purple-100" />
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2 mt-1">
                      <Globe size={15} className="text-indigo-100" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-gray-800/80 text-indigo-100 rounded-tl-none border border-indigo-500/20">
                      <motion.div className="flex space-x-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-indigo-400"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                
                {/* Music attachment */}
                {showMusicAttachment && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2 mt-1">
                      <Globe size={15} className="text-indigo-100" />
                    </div>
                    <MusicAttachment 
                      onSongChoice={handleSongComplete} 
                      audioRef={audioRef}
                    />
                  </motion.div>
                )}
                
                <div ref={chatBottomRef} />
              </div>
              
              {/* Reply options or input */}
              <div className="p-4 border-t border-indigo-500/20">
                {showReplyOptions ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Yes, I\'m ready! 🚀', 'Let\'s embark! ✨', 'Show me the cosmos! 🌟'].map((option) => (
                      <motion.button
                        key={option}
                        onClick={() => handleUserReply(option)}
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center bg-gray-800/70 rounded-full pr-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-indigo-100 placeholder-indigo-300/50 px-4 py-2 outline-none rounded-l-full"
                      disabled
                    />
                    <motion.button
                      className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center disabled:opacity-50"
                      disabled
                    >
                      <SendHorizonal size={16} className="text-white" />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/70 backdrop-blur-lg p-12 rounded-2xl shadow-2xl border border-indigo-500/30 max-w-lg text-center"
            >
              <motion.p
                animate={{ scale: [1, 1.1, 1], textShadow: ['0 0 5px rgba(79, 70, 229, 0)', '0 0 20px rgba(79, 70, 229, 0.6)', '0 0 5px rgba(79, 70, 229, 0)'] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
              >
                Prepare for warp speed!
              </motion.p>
              
              <motion.div
                className="mt-5 flex justify-center"
                animate={{ y: [0, -10], opacity: [1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              >
                <Rocket size={50} className="text-purple-500" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Intro;
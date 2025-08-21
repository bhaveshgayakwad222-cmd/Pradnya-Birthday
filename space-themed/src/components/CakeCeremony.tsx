import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { 
  Heart, Sparkles, Stars, Gift, Cake, 
  Rocket, Globe, Lock, Unlock, Key, 
  ShieldAlert, ShieldCheck, Container, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CakeCeremonyProps {
  onComplete: () => void;
}

// Confetti cannon effect using canvas-confetti
const fireConfetti = () => {
  const count = 5;
  const defaults = { 
    origin: { y: 0.7 },
    zIndex: 1000,
    gravity: 0.8,
    scalar: 1.2
  };
  
  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(200 * particleRatio),
    });
  }

  // Multiple bursts of space-themed confetti (blues, purples, silvers)
  fire(0.25, {
    spread: 70,
    origin: { y: 0.9, x: 0.5 },
    colors: ['#60A5FA', '#818CF8', '#A78BFA', '#C4B5FD', '#E0E7FF', '#FFFFFF']
  });
  
  setTimeout(() => {
    fire(0.15, {
      spread: 60,
      origin: { y: 0.9, x: 0.3 },
      colors: ['#2563EB', '#4F46E5', '#4338CA', '#FFFFFF']
    });
  }, 200);
  
  setTimeout(() => {
    fire(0.15, {
      spread: 60,
      origin: { y: 0.9, x: 0.7 },
      colors: ['#60A5FA', '#818CF8', '#A78BFA', '#FFFFFF']
    });
  }, 400);
  
  setTimeout(() => {
    fire(0.3, {
      spread: 100,
      decay: 0.91,
      origin: { y: 0.8, x: 0.5 },
      colors: ['#60A5FA', '#818CF8', '#A78BFA', '#C4B5FD', '#E0E7FF', '#FFFFFF']
    });
  }, 600);
};

// Space background with stars and nebula
const SpaceBackground = ({ children }) => {
  return (
    <div className="w-full h-screen fixed inset-0 overflow-hidden">
      {/* Deep space background with nebula effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950 to-black z-0">
        {/* Nebula layers */}
        <div className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: "radial-gradient(circle at 30% 20%, rgba(121, 40, 202, 0.3), transparent 30%), radial-gradient(circle at 70% 65%, rgba(33, 150, 243, 0.3), transparent 30%), radial-gradient(circle at 50% 50%, rgba(250, 140, 250, 0.2), transparent 60%)",
          }}
        />
      </div>
      
      {/* Stars */}
      {Array.from({ length: 100 }).map((_, i) => {
        const size = Math.random() * 2 + 1;
        return (
          <div 
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: size + 'px',
              height: size + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              boxShadow: size > 1.5 ? `0 0 ${size}px ${size/2}px rgba(255,255,255,0.8)` : 'none',
              animation: `twinkle ${Math.random() * 3 + 2}s infinite ${Math.random() * 2}s ease-in-out`
            }}
          />
        );
      })}
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Floating digital particle effect component
const DigitalParticles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-400"
          style={{
            width: Math.random() * 3 + 2 + 'px',
            height: Math.random() * 3 + 2 + 'px',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.4,
            filter: 'blur(1px)'
          }}
          animate={{
            y: [0, -100],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}
    </div>
  );
};

// Airlock Security Puzzle Component
const AirlockPuzzle = ({ onSolve }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [targetSequence] = useState<number[]>([2, 4, 1, 3]); // The correct sequence
  const [isProcessing, setIsProcessing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isError, setIsError] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Button press sound
  const buttonSoundRef = useRef<HTMLAudioElement>(null);
  const errorSoundRef = useRef<HTMLAudioElement>(null);
  const successSoundRef = useRef<HTMLAudioElement>(null);
  
  // Handle button press
  const handleButtonPress = (buttonId: number) => {
    if (isProcessing || success) return;
    
    // Play button sound
    if (buttonSoundRef.current) {
      buttonSoundRef.current.currentTime = 0;
      buttonSoundRef.current.play().catch(console.error);
    }
    
    // Add to sequence
    setSequence(prev => [...prev, buttonId]);
  };
  
  // Check if sequence is correct
  useEffect(() => {
    if (sequence.length === targetSequence.length && !isProcessing) {
      setIsProcessing(true);
      
      // Check if sequence matches target
      const isCorrect = sequence.every((num, i) => num === targetSequence[i]);
      
      setTimeout(() => {
        if (isCorrect) {
          // Success!
          if (successSoundRef.current) {
            successSoundRef.current.play().catch(console.error);
          }
          setSuccess(true);
          setTimeout(() => {
            onSolve();
          }, 2000);
        } else {
          // Error - wrong sequence
          if (errorSoundRef.current) {
            errorSoundRef.current.play().catch(console.error);
          }
          setIsError(true);
          setTimeout(() => {
            setIsError(false);
            setSequence([]);
            setIsProcessing(false);
            setAttempts(prev => prev + 1);
            
            // Show hint after 3 attempts
            if (attempts >= 2 && !showHint) {
              setShowHint(true);
              setHint('Hint: Try the quadratic sequence');
            }
          }, 1000);
        }
      }, 1000);
    }
  }, [sequence, targetSequence, isProcessing, attempts, showHint]);
  
  return (
    <motion.div 
      className="w-full h-screen flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <audio ref={buttonSoundRef} src="/button-press.mp3" />
      <audio ref={errorSoundRef} src="/error-beep.mp3" />
      <audio ref={successSoundRef} src="/success-chime.mp3" />
      
      <motion.div 
        className="max-w-md w-full p-8 rounded-2xl bg-gray-900/80 backdrop-blur-md border border-blue-500/30 shadow-lg shadow-blue-500/20"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        <div className="text-center mb-8">
          <motion.div 
            className="text-blue-400 mb-2 flex justify-center"
            animate={{ 
              scale: success ? [1, 1.2, 1] : 1,
              opacity: success ? [1, 0.8, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: success ? Infinity : 0, repeatType: "loop" }}
          >
            {success ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
          </motion.div>
          <h2 className="text-2xl font-bold text-blue-200 mb-1">Space Station Airlock</h2>
          <p className="text-blue-300/80">Enter security sequence to proceed</p>
          
          {/* Status display */}
          <div className="mt-4 h-10 flex justify-center items-center">
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="text-blue-400" size={28} />
              </motion.div>
            ) : isError ? (
              <motion.p
                className="text-red-400 font-bold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3, times: [0, 0.5, 1] }}
              >
                ACCESS DENIED
              </motion.p>
            ) : success ? (
              <motion.p
                className="text-green-400 font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: [1, 1.1, 1] }}
              >
                ACCESS GRANTED
              </motion.p>
            ) : (
              <p className="text-blue-300/60 text-sm">
                {sequence.length > 0 
                  ? `${sequence.length}/${targetSequence.length} entered` 
                  : "Waiting for input..."}
              </p>
            )}
          </div>
          
          {/* Input indicators */}
          <div className="flex justify-center gap-2 mt-3">
            {targetSequence.map((_, i) => (
              <motion.div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  sequence.length > i 
                    ? success 
                      ? 'bg-green-400' 
                      : isError 
                        ? 'bg-red-400' 
                        : 'bg-blue-400' 
                    : 'bg-gray-600'
                }`}
                animate={
                  sequence.length === i && !isProcessing && !success
                    ? { scale: [1, 1.2, 1] }
                    : {}
                }
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            ))}
          </div>
          
          {/* Hint text */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                className="mt-4 text-yellow-300/80 text-sm px-4 py-2 bg-yellow-900/20 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {hint}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Security keypad */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(num => (
            <motion.button
              key={num}
              className="bg-gray-800 h-20 rounded-xl flex items-center justify-center text-2xl font-bold border border-gray-700 shadow-inner shadow-black/20"
              style={{ 
                color: isProcessing ? '#4B5563' : '#E5E7EB',
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
              onClick={() => handleButtonPress(num)}
              whileHover={!isProcessing ? { scale: 1.05, backgroundColor: '#374151' } : {}}
              whileTap={!isProcessing ? { scale: 0.98 } : {}}
              disabled={isProcessing || success}
            >
              <span>{num}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      <motion.div
        className="text-blue-300/70 mt-8 text-center max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm mb-2 flex items-center justify-center gap-2">
          <Lock size={14} />
          Space Station JSS-2025 Security Protocol
        </p>
        <p className="text-xs">
          Enter the correct sequence to unlock the airlock and access the celebration chamber.
        </p>
      </motion.div>
    </motion.div>
  );
};

// Space Station Interior with Cake Component
const SpaceStationInterior = ({ onComplete }) => {
  // States for cake cutting
  const [isCut, setIsCut] = useState(false);
  const [knifePosition, setKnifePosition] = useState({ x: 0, y: 0 });
  const [sliceOffset, setSliceOffset] = useState(0);
  const [cakeAnimationComplete, setCakeAnimationComplete] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [cutEffectPlayed, setCutEffectPlayed] = useState(false);
  const [ambientLights, setAmbientLights] = useState(3); // Lighting level 1-5
  
  const cakeRef = useRef(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const celebrationAudioRef = useRef<HTMLAudioElement>(null);

  // Pre-calculate all random positions and values on component mount
  // This ensures they don't change when the component re-renders during drag
  const randomPositions = useMemo(() => {
    return {
      // Window stars
      leftWindowStars: Array.from({ length: 30 }).map(() => ({
        width: Math.random() * 2 + 1,
        height: Math.random() * 2 + 1,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 2
      })),

      rightWindowStars: Array.from({ length: 30 }).map(() => ({
        width: Math.random() * 2 + 1,
        height: Math.random() * 2 + 1,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 2
      })),

      // Station blinking lights
      blinkLights: Array.from({ length: 10 }).map(() => ({
        top: `${10 + Math.random() * 80}%`,
        left: `${Math.random() * 100}%`,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 2
      })),

      // Panel lights
      panelLights: Array.from({ length: 12 }).map(() => ({
        bgColor: Math.random() > 0.7 ? '#60A5FA' : '#1E40AF',
        animate: Math.random() > 0.8,
        duration: 2 + Math.random() * 2,
      })),

      // Wall panels
      wallPanels: Array.from({ length: 12 }).map(() => 
        Array.from({ length: 12 }).map(() => ({
          hasGradient: Math.random() > 0.9
        }))
      ),

      // Star decorations for cake
      cakeStarPositions: Array.from({ length: 8 }).map((_, i) => ({
        leftPosition: 20 + i * 8,
        topPosition: Math.random() * 6 + 2,
        delay: i * 0.3
      }))
    };
  }, []);
  
  useEffect(() => {
    // Simulate space station lights fluctuating slightly
    const lightInterval = setInterval(() => {
      setAmbientLights(prev => Math.max(2, Math.min(4, prev + Math.floor(Math.random() * 3) - 1)));
    }, 5000);
    
    return () => clearInterval(lightInterval);
  }, []);
  
  useEffect(() => {
    if (isCut && !cutEffectPlayed) {
      // Play celebration sound
      if (celebrationAudioRef.current) {
        celebrationAudioRef.current.play().catch(console.error);
      }
      
      // Fire confetti
      fireConfetti();
      setCutEffectPlayed(true);
      
      // Show next button after a delay
      setTimeout(() => {
        setShowNextButton(true);
      }, 3000);
    }
  }, [isCut, cutEffectPlayed]);

  // Fixed: Improved gesture binding to prevent affecting other elements
  const bind = useGesture({
    onDrag: ({ movement: [mx, my], down, velocity, event, target }) => {
      if (down && !isCut) {
        // Prevent default touch actions and stop propagation
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        
        setKnifePosition({ x: mx, y: my });
        
        // Create slice effect when knife moves down
        if (my > 80) {
          setSliceOffset(Math.min(120, my - 80));
          
          // Play knife sound when it first touches the cake
          if (my > 80 && my < 100 && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
          }
        }
        
        // Complete the slice when knife moves down with enough velocity
        if (my > 180 && velocity[1] > 0.5) {
          setIsCut(true);
          
          // Set a timeout for the animation completion
          setTimeout(() => {
            setCakeAnimationComplete(true);
          }, 1500);
        }
      }
    },
  }, {
    // Improved drag configuration
    drag: {
      from: () => [knifePosition.x, knifePosition.y],
      bounds: { left: -100, right: 100, top: -50, bottom: 250 },
      threshold: 0, // Lower threshold to make it more responsive
      rubberband: true,
      filterTaps: true, // Prevent conflicts with taps/clicks
      pointer: { touch: true } // Ensure touch support
    }
  });
  
  return (
    <motion.div
      className="w-full h-screen flex flex-col items-center justify-center relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Audio elements for sound effects */}
      <audio ref={audioRef} src="/laser-cut.mp3" />
      <audio ref={celebrationAudioRef} src="/celebration-sound.mp3" />
      
      {/* Fixed: Space Station Interior Elements with improved positioning */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Wall panels */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />
          
          {/* Wall panel grid - Using pre-calculated random values */}
          <div className="absolute inset-0 grid grid-cols-12 grid-rows-12">
            {randomPositions.wallPanels.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <div 
                  key={`panel-${rowIndex}-${colIndex}`}
                  className="border border-gray-700/40"
                  style={{
                    backgroundImage: cell.hasGradient 
                      ? 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), transparent)' 
                      : 'none'
                  }}
                />
              ))
            ))}
          </div>
          
          {/* Ambient station lighting */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(48, 63, 159, 0.05), transparent 70%)',
              opacity: ambientLights * 0.2, // Lighting level affects opacity
            }}
          />
        </div>
        
        {/* Space windows - using pre-calculated star positions */}
        <div className="absolute left-0 bottom-20 w-1/4 h-40 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-black">
            {/* Stars visible through window */}
            {randomPositions.leftWindowStars.map((star, i) => (
              <motion.div
                key={`window-star-${i}`}
                className="absolute bg-white rounded-full"
                style={{
                  width: star.width,
                  height: star.height,
                  left: star.left,
                  top: star.top,
                  boxShadow: `0 0 2px 1px rgba(255, 255, 255, 0.8)`
                }}
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: star.duration,
                  repeat: Infinity,
                  delay: star.delay
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 border-4 border-gray-700 rounded-lg" />
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="border-b border-r border-gray-700/50" />
            <div className="border-b border-gray-700/50" />
            <div className="border-r border-gray-700/50" />
            <div />
          </div>
        </div>
        
        {/* Space window on the right - using pre-calculated star positions */}
        <div className="absolute right-0 bottom-40 w-1/4 h-40 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-black">
            {/* Stars visible through window */}
            {randomPositions.rightWindowStars.map((star, i) => (
              <motion.div
                key={`window-star-right-${i}`}
                className="absolute bg-white rounded-full"
                style={{
                  width: star.width,
                  height: star.height,
                  left: star.left,
                  top: star.top,
                  boxShadow: `0 0 2px 1px rgba(255, 255, 255, 0.8)`
                }}
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: star.duration,
                  repeat: Infinity,
                  delay: star.delay
                }}
              />
            ))}
            
            {/* Distant Globe visible */}
            <motion.div 
              className="absolute w-20 h-20 rounded-full bg-purple-900"
              style={{
                top: '30%',
                left: '60%',
                boxShadow: 'inset -5px -5px 15px rgba(0,0,0,0.3), 0 0 15px rgba(168, 85, 247, 0.4)'
              }}
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
          </div>
          <div className="absolute inset-0 border-4 border-gray-700 rounded-lg" />
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="border-b border-r border-gray-700/50" />
            <div className="border-b border-gray-700/50" />
            <div className="border-r border-gray-700/50" />
            <div />
          </div>
        </div>
      </div>
      
      {/* Fixed: Station blinking lights - using pre-calculated positions */}
      {randomPositions.blinkLights.map((light, i) => (
        <motion.div
          key={`light-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full bg-red-500 will-change-opacity"
          style={{
            top: light.top,
            left: light.left,
            boxShadow: '0 0 5px 2px rgba(239, 68, 68, 0.4)'
          }}
          animate={{
            opacity: [1, 0.3, 1],
          }}
          transition={{
            duration: light.duration,
            delay: light.delay,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      ))}
      
      {/* Fixed: Space station control panels with improved positioning */}
      <div className="absolute top-8 left-8 right-8 flex justify-between z-10 pointer-events-none">
        <div className="w-96 h-20 bg-gray-900 border border-gray-700 rounded-md flex flex-col p-2">
          <div className="text-xs text-blue-400 font-mono mb-1">STATION STATUS: NOMINAL</div>
          <div className="flex-1 grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`status-${i}`} className="bg-gray-800 rounded flex justify-center items-center">
                <motion.div
                  className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-400' : i === 1 ? 'bg-blue-400' : 'bg-yellow-400'}`}
                  animate={{ 
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{ 
                    duration: i === 0 ? 2 : i === 1 ? 3 : 2.5, 
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-12 gap-0.5 mt-1">
            {randomPositions.panelLights.map((light, i) => (
              <motion.div 
                key={`light-${i}`}
                className="h-1"
                style={{
                  backgroundColor: light.bgColor,
                  willChange: 'opacity, background-color'
                }}
                animate={{
                  opacity: [1, 0.7, 1],
                  backgroundColor: light.animate ? ['#60A5FA', '#3B82F6', '#60A5FA'] : undefined
                }}
                transition={{
                  duration: light.duration,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="w-40 h-20 bg-gray-900 border border-gray-700 rounded-md flex flex-col justify-center items-center">
          <div className="text-xs text-blue-500 font-mono">JSS-2025</div>
          <motion.div
            className="text-xl font-mono text-blue-400 mt-1"
            animate={{
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          >
            {new Date().toLocaleTimeString().substring(0, 5)}
          </motion.div>
          <div className="text-xs text-blue-500/70 font-mono mt-1">
            COSMIC STANDARD TIME
          </div>
        </div>
      </div>
      
      {/* Digital particles effect - No changes needed as it's already using pointer-events-none */}
      <DigitalParticles />

      {/* Title */}
      <motion.div
        className="absolute top-8 left-0 right-0 flex justify-center z-10 pointer-events-none"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="px-8 py-3 bg-gray-800/50 backdrop-blur-sm rounded-full border border-blue-500/30">
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 flex items-center gap-3">
            <Cake className="text-blue-300" /> 
            <span>Cosmic Celebration</span>
            <Globe className="text-blue-300" />
          </h1>
        </div>
      </motion.div>

      {/* Instructions */}
      <AnimatePresence>
        {!isCut && (
          <motion.div
            className="absolute top-28 mb-8 text-xl font-medium text-center z-10 pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-gray-900/70 backdrop-blur-sm shadow-lg text-blue-400 border border-blue-500/20"
              animate={{ 
                boxShadow: ['0 4px 6px rgba(0, 0, 0, 0.3)', '0 10px 15px rgba(37, 99, 235, 0.2)', '0 4px 6px rgba(0, 0, 0, 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="text-blue-300" size={18} />
              <span>Use the laser cutter to cut the cake</span>
              <Sparkles className="text-blue-300" size={18} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed: Main content area with cake on a table */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-[500px] h-[400px] flex items-center justify-center pointer-events-none">
        <div className="relative z-10 w-full h-full">
          {/* Metal table */}
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[400px] h-[100px] bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg shadow-xl border-t border-gray-500 z-10"
            style={{
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Table texture/reflection */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.2) 30%, transparent 60%)',
                backgroundSize: '200% 200%',
                animation: 'reflectionMove 10s linear infinite'
              }}
            />
            
            {/* Table legs */}
            <div className="absolute bottom-0 left-10 w-8 h-20 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg" 
              style={{ transform: 'translateY(60%)' }} />
            <div className="absolute bottom-0 right-10 w-8 h-20 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg"
              style={{ transform: 'translateY(60%)' }} />
            
            {/* Holographic interface on table */}
            <div className="absolute top-4 left-4 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-400"
                  animate={{
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.4,
                    repeat: Infinity
                  }}
                />
              ))}
            </div>
            
            <motion.div
              className="absolute top-4 right-4 text-xs text-blue-400 font-mono"
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              JSS-2025
            </motion.div>
          </motion.div>
          
          {/* Fixed: Make this div the only interactive part with absolute isolation */}
          <div 
            className="absolute bottom-[90px] left-1/2 transform -translate-x-1/2 w-[280px] h-[300px] pointer-events-auto"
            style={{ 
              touchAction: 'none',
              isolation: 'isolate' // Isolates this element for stacking context
            }}
          >            
            {/* Force field effect */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-30 z-0"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.2, 0.3, 0.2],
                background: [
                  'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%)',
                  'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0) 70%)',
                  'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 70%)'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
            />
            
            {/* Enhanced cosmic cake with improved details */}
            <motion.div
              ref={cakeRef}
              className="absolute bottom-0 left-0 w-full flex flex-col items-center z-10"
              animate={isCut ? { y: 0, scale: 1.05 } : { y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Improved cake base/plate with cosmic glow */}
              <motion.div
                className="w-[280px] h-8 rounded-full bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 shadow-lg mb-[-4px]"
                style={{ 
                  filter: "drop-shadow(0px 4px 8px rgba(59, 130, 246, 0.3))",
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.15)"
                }}
                animate={{ rotate: isCut ? [0, -1, 1, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Metallic plate details */}
                <div className="absolute inset-0 rounded-full">
                  <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-200/50 to-transparent"></div>
                  <div className="absolute top-2/4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>
              </motion.div>
              
              {/* Enhanced cake with cosmic design */}
              <motion.div
                className="relative w-full h-64 rounded-2xl overflow-hidden"
                style={{ 
                  background: isCut 
                    ? "linear-gradient(to bottom, #fce4ec 0%, #f8bbd0 100%)" 
                    : "linear-gradient(to bottom, #fce4ec 0%, #e1bee7 50%, #9575cd 100%)",
                  boxShadow: "0px 5px 25px rgba(0,0,0,0.2), 0 0 15px rgba(96, 165, 250, 0.2)"
                }}
              >
                {/* Enhanced cake texture with starfield pattern */}
                <div className="absolute inset-0 opacity-30" 
                  style={{ 
                    backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px), radial-gradient(circle, #fff 0.5px, transparent 0.5px)",
                    backgroundSize: "10px 10px, 20px 20px",
                    backgroundPosition: "0 0, 10px 10px" 
                  }} 
                />

                {/* Galaxy swirl pattern inside cake */}
                <div className="absolute inset-0 opacity-20"
                  style={{
                    background: "conic-gradient(from 0deg at 50% 50%, #9c27b0, #3f51b5, #2196f3, #9c27b0)"
                  }}
                />

                {/* Glowing frosting top layer */}
                <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-white to-blue-50/90 rounded-t-xl">
                  {/* Frosting texture */}
                  <div className="absolute inset-0 opacity-60"
                    style={{
                      backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                      backgroundSize: "6px 6px"
                    }}
                  />
                  
                  {/* Shimmer effect on frosting */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
                
                {/* Enhanced space-themed decorations */}
                <div className="absolute top-0 inset-x-0 h-12 flex items-center justify-center">
                  {/* Central cosmic element - galaxy swirl */}
                  <motion.div
                    className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-10"
                    animate={{
                      rotate: 360
                    }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-400 opacity-60"
                      style={{
                        transform: "scale(0.7)",
                        filter: "blur(1px)"
                      }}
                    />
                    <div className="absolute inset-0 rounded-full"
                      style={{
                        background: "conic-gradient(from 0deg at 50% 60%, transparent, #fff, transparent, transparent)",
                        transform: "scale(1.2)",
                        opacity: 0.3
                      }}
                    />
                  </motion.div>
                  
                  {/* Planet decorations with enhanced details */}
                  <motion.div
                    className="absolute left-6 top-3 w-6 h-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-300 to-blue-500"
                      style={{ boxShadow: '0 0 10px rgba(96, 165, 250, 0.5)' }} 
                    />
                    <div className="absolute inset-0 rounded-full opacity-70"
                      style={{
                        background: "linear-gradient(40deg, transparent 50%, rgba(255,255,255,0.4) 55%, transparent 60%)"
                      }}
                    />
                    <div className="absolute w-8 h-1.5 rounded-full bg-blue-200/20 top-2 left-1/2 transform -translate-x-1/2 rotate-45" />
                    {/* Tiny moon */}
                    <motion.div
                      className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 -top-1 -right-1"
                      style={{ boxShadow: '0 0 3px rgba(255, 255, 255, 0.8)' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.div>
                  
                  <motion.div
                    className="absolute right-8 top-2 w-7 h-7"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-300 to-purple-500"
                      style={{ boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)' }} 
                    />
                    {/* Saturn-like ring */}
                    <div className="absolute top-1/2 left-1/2 w-10 h-3 -translate-x-1/2 -translate-y-1/2 bg-purple-200/40 rounded-full" 
                      style={{ transform: "translateX(-50%) translateY(-50%) rotateX(75deg)" }} 
                    />
                    <div className="absolute w-9 h-3 bg-purple-200/20 rounded-full top-2 left-1/2 transform -translate-x-1/2 -rotate-30" />
                  </motion.div>
                  
                  {/* Enhanced asteroid belt */}
                  <div className="absolute top-1.5 h-9 w-full">
                    <div className="relative h-full w-full">
                      {randomPositions.cakeStarPositions.map((star, i) => {
                        // Create a curved path for the stars
                        const curveHeight = Math.sin((star.leftPosition / 100) * Math.PI) * 7;
                        return (
                          <motion.div
                            key={i}
                            className="absolute w-1.5 h-1.5 rounded-full"
                            style={{
                              left: `${star.leftPosition}%`,
                              top: `${star.topPosition + curveHeight}px`,
                              backgroundColor: i % 3 === 0 ? '#FBBF24' : i % 3 === 1 ? '#C4B5FD' : '#E0E7FF',
                              boxShadow: i % 3 === 0 
                                ? '0 0 3px 1px rgba(250, 204, 21, 0.7)'
                                : '0 0 3px 1px rgba(255, 255, 255, 0.7)'
                            }}
                            animate={{
                              opacity: [0.7, 1, 0.7],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              duration: 2 + (i % 3),
                              delay: star.delay,
                              repeat: Infinity
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Improved frosting swirls with cosmic colors */}
                {Array.from({ length: 10 }).map((_, i) => {
                  const isSpecial = i % 3 === 0;
                  return (
                    <motion.div
                      key={i}
                      className="absolute top-1 h-4 w-4"
                      style={{
                        left: `${18 + i * 26}px`,
                        borderRadius: '50%',
                        background: isSpecial 
                          ? 'linear-gradient(to bottom right, #C4B5FD, #818CF8)'
                          : '#fff',
                        boxShadow: isSpecial 
                          ? '0px 0px 6px rgba(168, 85, 247, 0.4)' 
                          : '0px 2px 3px rgba(0,0,0,0.05)'
                      }}
                      animate={{ 
                        y: [0, -1, 0],
                        scale: isCut ? [1, 0.7] : [1, 1.05, 1] 
                      }}
                      transition={{ 
                        duration: 2,
                        delay: i * 0.1,
                        repeat: isCut ? 0 : Infinity,
                        repeatType: 'reverse'
                      }}
                    />
                  );
                })}

                {/* Improved cake slice effect with cosmic filling */}
                {sliceOffset > 0 && (
                  <motion.div
                    className="absolute w-full"
                    style={{
                      height: `${sliceOffset}px`,
                      bottom: 0,
                      clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                      background: 'linear-gradient(to bottom, #e1bee7 0%, #9575cd 70%, #5e35b1 100%)'
                    }}
                    animate={isCut ? { 
                      y: [0, 30],
                      opacity: [1, 0],
                      x: [0, -20]
                    } : {}}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    {/* Cosmic filling patterns */}
                    <div className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 2px)",
                        backgroundSize: "8px 8px",
                      }}
                    />
                    
                    {/* Filling sparkle effect */}
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={`sparkle-${i}`}
                        className="absolute w-1.5 h-1.5 rounded-full bg-white"
                        style={{
                          left: `${15 + i * 14}%`,
                          top: `${10 + (i % 3) * 20}%`,
                          boxShadow: '0 0 4px 2px rgba(255, 255, 255, 0.7)'
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.2,
                          repeat: Infinity,
                        }}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Enhanced cake layers with cosmic gradients */}
                <div className="absolute top-1/3 w-full h-2 bg-gradient-to-r from-purple-300/50 via-white/60 to-purple-300/50" />
                <div className="absolute top-2/3 w-full h-2 bg-gradient-to-r from-blue-300/50 via-white/60 to-blue-300/50" />

                {/* Improved cake message */}
                <motion.div
                  className="absolute top-12 left-1/2 transform -translate-x-1/2"
                  animate={isCut ? { scale: 0, opacity: 0 } : { scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative">
                    {/* Birthday text on cake with improved design */}
                    {/* <motion.div
                      className="bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-blue-300/40"
                      style={{
                        boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
                        background: "linear-gradient(to right, rgba(255,255,255,0.8), rgba(240,249,255,0.9), rgba(255,255,255,0.8))"
                      }}
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 font-bold text-sm">
                        Happy Birthday Madam Ji!
                      </span>
                    </motion.div> */}
                    
                    {/* Enhanced heart decoration */}
                    <motion.div
                      className="absolute -right-10 -top-3"
                      animate={{ rotate: [0, 10, 0, -10, 0], scale: [1, 1.1, 1, 1.1, 1] }}
                      transition={{ duration: 5, repeat: Infinity }}
                    >
                      <Heart size={20} className="text-red-500 drop-shadow-lg" fill="currentColor" />
                    </motion.div>
                    
                    {/* Added star decoration */}
                    <motion.div
                      className="absolute -left-8 -top-2"
                      animate={{ rotate: [0, 180], scale: [1, 1.2, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <div className="text-yellow-400 w-4 h-4">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Enhanced candles - Cosmic light beams */}
            <div className="absolute bottom-[260px] left-0 w-full pointer-events-none flex justify-center gap-8 z-10">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="relative"
                  animate={isCut ? { scale: 0, opacity: 0 } : {}}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  {/* Light beam base with enhanced effects */}
                  <motion.div
                    className="w-1 h-32 mx-auto bg-blue-200/5"
                    style={{ 
                      borderRadius: '1px',
                      boxShadow: '0 0 8px 2px rgba(96, 165, 250, 0.5)',
                      transformOrigin: 'bottom center',
                      background: 'linear-gradient(to top, rgba(96,165,250,0.3), rgba(255,255,255,0.1))'
                    }}
                    animate={{ opacity: [0.7, 1, 0.7], scaleY: [0.98, 1.02, 0.98] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                  
                  {/* Holographic flame with enhanced effects */}
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    animate={{ scale: [1, 1.2, 0.9, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <div className="w-4 h-8"
                      style={{ 
                        borderRadius: '50% 50% 20% 20% / 40% 40% 60% 60%',
                        filter: 'blur(1px)',
                        background: 'linear-gradient(to top, #60A5FA, #93C5FD, #DBEAFE, #ffffff)',
                        boxShadow: '0 0 15px rgba(96, 165, 250, 0.8)'
                      }}
                    />
                    <div className="absolute inset-0 opacity-70"
                      style={{ 
                        borderRadius: '50% 50% 20% 20% / 40% 40% 60% 60%',
                        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)'
                      }}
                    />
                    
                    {/* Added particle effects around flame */}
                    {Array.from({ length: 3 }).map((_, j) => (
                      <motion.div
                        key={`flame-particle-${j}`}
                        className="absolute w-1 h-1 rounded-full bg-white/80"
                        style={{
                          top: `-${j * 2 + 1}px`,
                          left: `${j % 2 === 0 ? -2 : 2}px`
                        }}
                        animate={{
                          y: [0, -10],
                          opacity: [0.7, 0],
                          x: j % 2 === 0 ? [0, -5] : [0, 5]
                        }}
                        transition={{
                          duration: 1 + j * 0.2,
                          repeat: Infinity,
                          repeatDelay: j * 0.3
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              ))}
            </div>
            
            {/* Fixed: Laser Cutter positioned directly above cake for proper interaction */}
            {!isCut && (
              <motion.div
                className="absolute cursor-grab active:cursor-grabbing z-40"
                {...bind()}
                style={{
                  width: 30,
                  height: 180,
                  position: 'absolute',
                  left: '50%',
                  top: '30px',
                  x: knifePosition.x,
                  y: knifePosition.y,
                  transform: `translateX(-50%) rotate(${Math.min(15, Math.max(-15, knifePosition.x * 0.1))}deg)`,
                  transformOrigin: "50% 100%", // Origin at the bottom for better rotation
                  touchAction: 'none', // Critical for proper touch handling
                  userSelect: 'none' // Prevent text selection while dragging
                }}
              >
                {/* Laser handle */}
                <div className="w-full flex flex-col items-center">
                  <div className="w-full h-16 rounded-t-lg bg-gradient-to-b from-gray-300 to-gray-500 border border-gray-400" />
                  <div className="w-4 h-20 bg-gradient-to-b from-gray-500 to-gray-700 border-x border-gray-600" />
                  <div className="w-8 h-4 rounded-md bg-gray-800 flex justify-center items-center border border-gray-600">
                    <motion.div 
                      className="w-4 h-2 bg-blue-500 rounded-sm"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  </div>
                </div>
                
                {/* Laser beam */}
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-40 bg-blue-400"
                  style={{
                    boxShadow: '0 0 10px 2px rgba(96, 165, 250, 0.8)'
                  }}
                  animate={{ opacity: [0.8, 1, 0.8], height: [38, 42, 38] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Celebration message after cutting */}
      <AnimatePresence>
        {cakeAnimationComplete && (
          <motion.div
            className="absolute flex flex-col items-center gap-6 z-30"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.div
              className="text-center max-w-md px-8 py-5 rounded-2xl bg-gray-900/80 backdrop-blur-sm shadow-xl border border-blue-500/20"
              animate={{ 
                boxShadow: [
                  '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
                  '0 20px 25px -5px rgba(59, 130, 246, 0.5)',
                  '0 10px 25px -5px rgba(59, 130, 246, 0.3)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.h2 
                className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.8 }}
              >
                Happy Birthday Madam Ji!
              </motion.h2>
              
              <motion.p 
                className="text-xl text-blue-200 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Well, i have prepared a special message for you.
                <br />
                <span className="inline-flex items-center gap-1 mt-2">
                  Enjoy this special day! <Rocket size={16} className="text-blue-300" />
                </span>
              </motion.p>
            </motion.div>
            
            {/* Next button to continue */}
            {showNextButton && (
              <motion.button
                onClick={onComplete}
                className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 text-white font-bold text-xl shadow-lg hover:shadow-xl flex items-center gap-2 pointer-events-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  y: [0, -5, 0],
                  boxShadow: [
                    '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                    '0 15px 25px -5px rgba(59, 130, 246, 0.5)',
                    '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Stars size={20} className="text-blue-200" />
                Continue The Journey
                <Gift size={20} className="text-blue-200" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes reflectionMove {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </motion.div>
  );
};

// Main CakeCeremony component
export const CakeCeremony: React.FC<CakeCeremonyProps> = ({ onComplete }) => {
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  
  return (
    <SpaceBackground>
      {!puzzleSolved ? (
        <AirlockPuzzle onSolve={() => setPuzzleSolved(true)} />
      ) : (
        <SpaceStationInterior onComplete={onComplete} />
      )}
    </SpaceBackground>
  );
};

export default CakeCeremony;
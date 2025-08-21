import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star as StarIcon, Gift, Rocket, Moon, Award, Zap } from 'lucide-react';
import BurstS from './soundfx/glitter.mp3';

// UFO SVG Component
const UFO = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    width="60"
    height="30"
    viewBox="0 0 60 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="30" cy="10" rx="15" ry="6" fill="#70D6FF" />
    <ellipse cx="30" cy="15" rx="25" ry="8" fill="#3A86FF" />
    <circle cx="20" cy="15" r="2" fill="#FFFF00" />
    <circle cx="30" cy="15" r="2" fill="#FFFF00" />
    <circle cx="40" cy="15" r="2" fill="#FFFF00" />
    <ellipse cx="30" cy="6" rx="8" ry="4" fill="#C8E7FF" opacity="0.6" />
  </svg>
);

// Astronaut SVG Component
const Astronaut = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    width="40"
    height="50"
    viewBox="0 0 40 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="15" r="10" fill="white" />
    <rect x="12" y="15" width="16" height="20" rx="8" fill="white" />
    <circle cx="20" cy="15" r="7" fill="#3A3A5C" />
    <rect x="8" y="20" width="24" height="5" rx="2.5" fill="#E0E0E0" />
    <rect x="10" y="25" width="20" height="10" rx="5" fill="#E0E0E0" />
    <circle cx="16" cy="14" r="2" fill="#7DF9FF" opacity="0.7" />
    <rect x="16" y="35" width="3" height="8" fill="#E0E0E0" />
    <rect x="22" y="35" width="3" height="8" fill="#E0E0E0" />
    <rect x="15" y="43" width="5" height="2" fill="#E0E0E0" />
    <rect x="21" y="43" width="5" height="2" fill="#E0E0E0" />
  </svg>
);

// Cosmic Portal SVG Component
const CosmicPortal = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    width="120"
    height="80"
    viewBox="0 0 120 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="60" cy="40" rx="40" ry="20" fill="url(#portal-gradient)" />
    <ellipse cx="60" cy="40" rx="30" ry="15" fill="url(#inner-gradient)" />
    <ellipse cx="60" cy="40" rx="20" ry="10" fill="url(#core-gradient)" />
    <defs>
      <radialGradient id="portal-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 40) rotate(90) scale(20 40)">
        <stop stopColor="#7A4EFE" />
        <stop offset="1" stopColor="#4923B5" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="inner-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 40) rotate(90) scale(15 30)">
        <stop stopColor="#B476FF" />
        <stop offset="1" stopColor="#7A4EFE" stopOpacity="0.5" />
      </radialGradient>
      <radialGradient id="core-gradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 40) rotate(90) scale(10 20)">
        <stop stopColor="#FFD1FB" />
        <stop offset="1" stopColor="#B476FF" stopOpacity="0.8" />
      </radialGradient>
    </defs>
  </svg>
);

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  isActive: boolean;
  constellationId?: number;
}

interface Constellation {
  id: number;
  stars: number[];
  isComplete: boolean;
  name: string;
  portalColor: string;
}

interface GardenPlot {
  id: string;
  x: number;
  y: number;
  size: number;
  constellationId?: number;
  isActive: boolean;
  portalColor: string;
  rotation: number;
}

interface FloatingObject {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  type: 'ufo' | 'astronaut';
  direction: number;
}

interface ShootingStar {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
  width: number;
}

interface RoomProps {
  onComplete: () => void;
}

const REWARD_THRESHOLD = 1; // Only need 1 constellation

export const Room: React.FC<RoomProps> = ({ onComplete }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [gardenPlots, setGardenPlots] = useState<GardenPlot[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [activeLine, setActiveLine] = useState<{fromId: number, toPosition: {x: number, y: number}} | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [completedConstellations, setCompletedConstellations] = useState(0);
  const [sparkleEffects, setSparkleEffects] = useState<{id: string, x: number, y: number}[]>([]);
  const [floatingObjects, setFloatingObjects] = useState<FloatingObject[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [moonPhase, setMoonPhase] = useState(0);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  
  // Generate background stars
  const backgroundStars = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 8 + 2;
      const delay = Math.random() * 5;
      
      return { id: i, size, x, y, duration, delay };
    });
  }, []);

  // Track screen size for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Initial size
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if mobile view
  const isMobile = screenSize.width < 768;
  
  // Initialize audio
  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);
  
  // Generate shooting stars periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newShootingStar: ShootingStar = {
          id: `shooting-star-${Date.now()}`,
          startX: Math.random() * 30,
          startY: Math.random() * 30,
          endX: Math.random() * 50 + 50,
          endY: Math.random() * 50 + 30,
          duration: Math.random() * 2 + 1,
          delay: Math.random() * 3,
          width: Math.random() * 50 + 50
        };
        
        setShootingStars(prev => [...prev, newShootingStar]);
        
        // Remove shooting star after animation
        setTimeout(() => {
          setShootingStars(prev => prev.filter(star => star.id !== newShootingStar.id));
        }, (newShootingStar.duration + newShootingStar.delay + 0.5) * 1000);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Generate floating objects periodically
  useEffect(() => {
    // Only add floating objects on larger screens
    if (screenSize.width < 640) return;
    
    // Initial objects
    const initialObjects: FloatingObject[] = [
      {
        id: `ufo-${Date.now()}`,
        x: Math.random() * 80 + 10,
        y: Math.random() * 40 + 20,
        rotation: Math.random() * 10 - 5,
        scale: Math.random() * 0.5 + 0.8,
        type: 'ufo',
        direction: Math.random() > 0.5 ? 1 : -1
      },
      {
        id: `astronaut-${Date.now() + 1}`,
        x: Math.random() * 80 + 10,
        y: Math.random() * 30 + 20,
        rotation: Math.random() * 20 - 10,
        scale: Math.random() * 0.4 + 0.7,
        type: 'astronaut',
        direction: Math.random() > 0.5 ? 1 : -1
      }
    ];
    
    setFloatingObjects(initialObjects);
    
    // Add more objects periodically
    const interval = setInterval(() => {
      if (floatingObjects.length < 4 && Math.random() > 0.7) {
        const newObject: FloatingObject = {
          id: `${Math.random() > 0.5 ? 'ufo' : 'astronaut'}-${Date.now()}`,
          x: Math.random() * 80 + 10,
          y: Math.random() * 40 + 10,
          rotation: Math.random() * 20 - 10,
          scale: Math.random() * 0.5 + 0.7,
          type: Math.random() > 0.5 ? 'ufo' : 'astronaut',
          direction: Math.random() > 0.5 ? 1 : -1
        };
        
        setFloatingObjects(prev => [...prev, newObject]);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [screenSize.width]);
  
  // Animate floating objects
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingObjects(prev => 
        prev.map(obj => ({
          ...obj,
          x: obj.x + (obj.direction * 0.2),
          y: obj.y + (Math.sin(Date.now() / 1000) * 0.1),
          rotation: obj.rotation + (obj.direction * 0.2)
        })).filter(obj => obj.x > -10 && obj.x < 110) // Keep objects in bounds
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  // Change moon phase occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      setMoonPhase(prev => (prev + 1) % 4);
    }, 20000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Generate interactive stars and constellation
  useEffect(() => {
    // Define constellation
    const constellationData: Constellation[] = [
      { 
        id: 1, 
        stars: [1, 2, 3, 4, 5, 6, 7], 
        isComplete: false, 
        name: "The Birthday Crown", 
        portalColor: "#9D4EDD" 
      }
    ];
    
    // Create stars with specific positions for crown constellation
    // Adjusting positioning based on screen size
    const starPositions = screenSize.width < 768 ? [
      // Crown constellation, slightly adjusted for mobile
      {id: 1, x: 50, y: 25, constellationId: 1},
      {id: 2, x: 35, y: 30, constellationId: 1},
      {id: 3, x: 20, y: 25, constellationId: 1},
      {id: 4, x: 30, y: 15, constellationId: 1},
      {id: 5, x: 50, y: 15, constellationId: 1},
      {id: 6, x: 70, y: 15, constellationId: 1},
      {id: 7, x: 80, y: 25, constellationId: 1},
    ] : [
      // Standard crown constellation for desktop
      {id: 1, x: 50, y: 30, constellationId: 1},
      {id: 2, x: 40, y: 35, constellationId: 1},
      {id: 3, x: 30, y: 30, constellationId: 1},
      {id: 4, x: 35, y: 25, constellationId: 1},
      {id: 5, x: 45, y: 25, constellationId: 1},
      {id: 6, x: 55, y: 25, constellationId: 1},
      {id: 7, x: 60, y: 30, constellationId: 1},
    ];
    
    const newStars = starPositions.map(pos => ({
      id: pos.id,
      x: pos.x + (Math.random() * 3 - 1.5), // Add slight randomness
      y: pos.y + (Math.random() * 3 - 1.5),
      size: isMobile ? Math.random() * 4 + 10 : Math.random() * 4 + 7, // Larger on mobile
      isActive: false,
      constellationId: pos.constellationId
    }));
    
    setStars(newStars);
    setConstellations(constellationData);
    
    // Create portal plot for the constellation
    const plots: GardenPlot[] = [
      {
        id: `plot-1`,
        x: 50,
        y: 75,
        size: isMobile ? 100 : 120,
        constellationId: 1,
        isActive: false,
        portalColor: "#9D4EDD",
        rotation: Math.random() * 10 - 5
      }
    ];
    
    setGardenPlots(plots);
  }, [screenSize.width, isMobile]);
  
  // Draw constellation lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw completed constellation lines
    constellations.forEach(constellation => {
      if (constellation.isComplete) {
        const constellationStars = stars.filter(star => 
          constellation.stars.includes(star.id)
        );
        
        if (constellationStars.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = `${constellation.portalColor}AA`;
          ctx.lineWidth = 3;
          
          const firstStar = constellationStars[0];
          ctx.moveTo(
            (firstStar.x / 100) * canvas.width,
            (firstStar.y / 100) * canvas.height
          );
          
          for (let i = 1; i < constellationStars.length; i++) {
            const star = constellationStars[i];
            ctx.lineTo(
              (star.x / 100) * canvas.width,
              (star.y / 100) * canvas.height
            );
          }
          
          ctx.stroke();
          
          // Add glow effect to the completed constellation
          ctx.shadowBlur = 15;
          ctx.shadowColor = constellation.portalColor;
          ctx.strokeStyle = `${constellation.portalColor}77`;
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
    });
    
    // Draw lines for selected stars
    if (selectedStars.length > 1) {
      const selectedStarsData = stars.filter(star => selectedStars.includes(star.id));
      
      if (selectedStarsData.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 150, 0.8)';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 150, 0.5)';
        
        const firstStar = selectedStarsData[0];
        ctx.moveTo(
          (firstStar.x / 100) * canvas.width,
          (firstStar.y / 100) * canvas.height
        );
        
        for (let i = 1; i < selectedStarsData.length; i++) {
          const star = selectedStarsData[i];
          ctx.lineTo(
            (star.x / 100) * canvas.width,
            (star.y / 100) * canvas.height
          );
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
    
    // Draw active line (when dragging)
    if (activeLine) {
      const fromStar = stars.find(star => star.id === activeLine.fromId);
      
      if (fromStar) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 150, 0.6)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(255, 255, 150, 0.3)';
        
        ctx.moveTo(
          (fromStar.x / 100) * canvas.width,
          (fromStar.y / 100) * canvas.height
        );
        
        ctx.lineTo(
          activeLine.toPosition.x,
          activeLine.toPosition.y
        );
        
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }, [stars, constellations, selectedStars, activeLine]);
  
  // Handle window resize for canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Hide tutorial after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTutorial(false);
    }, 6000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Play sound effect
  const playSound = (type: 'click' | 'complete' | 'grow') => {
    if (!audioContext.current) return;
    const burstSound = new Audio(BurstS);
    burstSound.volume = type === 'complete' ? 1.0 : 0.6;
    burstSound.play();
  };
  
  // Handle star click
  const handleStarClick = (id: number) => {
    // Find the star
    const star = stars.find(s => s.id === id);
    if (!star) return;
    
    playSound('click');
    
    // If this is the first star in selection or continuing a valid constellation
    if (selectedStars.length === 0 || 
        (star.constellationId && selectedStars.length > 0 && 
         stars.find(s => s.id === selectedStars[0])?.constellationId === star.constellationId)) {
      
      // Add to selection if not already selected
      if (!selectedStars.includes(id)) {
        setSelectedStars([...selectedStars, id]);
        
        // Mark star as active
        setStars(stars.map(s => 
          s.id === id ? { ...s, isActive: true } : s
        ));
        
        // Check if constellation is complete
        const constellation = constellations.find(c => c.stars.includes(id));
        if (constellation) {
          const isComplete = constellation.stars.every(starId => 
            selectedStars.includes(starId) || starId === id
          );
          
          if (isComplete) {
            completeConstellation(constellation.id);
          }
        }
      }
    } else {
      // Reset selection if clicking a star from a different constellation
      setSelectedStars([id]);
      
      // Reset all stars except this one
      setStars(stars.map(s => 
        s.id === id ? { ...s, isActive: true } : { ...s, isActive: false }
      ));
    }
    
    // Add sparkle effect on click
    const sparkleId = `click-sparkle-${Date.now()}`;
    setSparkleEffects(prev => [...prev, { 
      id: sparkleId, 
      x: (star.x / 100) * window.innerWidth, 
      y: (star.y / 100) * window.innerHeight 
    }]);
    
    setTimeout(() => {
      setSparkleEffects(prev => prev.filter(effect => effect.id !== sparkleId));
    }, 1000);
  };
  
  // Handle mouse move for active line drawing
  const handleMouseMove = (e: React.MouseEvent) => {
    if (selectedStars.length > 0) {
      const lastSelectedId = selectedStars[selectedStars.length - 1];
      setActiveLine({
        fromId: lastSelectedId,
        toPosition: { x: e.clientX, y: e.clientY }
      });
    }
  };
  
  // Handle touch move for mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (selectedStars.length > 0 && e.touches.length > 0) {
      const lastSelectedId = selectedStars[selectedStars.length - 1];
      const touch = e.touches[0];
      setActiveLine({
        fromId: lastSelectedId,
        toPosition: { x: touch.clientX, y: touch.clientY }
      });
    }
  };
  
  // Handle mouse/touch leave for canvas
  const handlePointerLeave = () => {
    setActiveLine(null);
  };
  
  // Complete a constellation
  const completeConstellation = (constellationId: number) => {
    // Play celebration sound
    playSound('complete');
    
    // Mark constellation as complete
    setConstellations(constellations.map(c => 
      c.id === constellationId ? { ...c, isComplete: true } : c
    ));
    
    // Increment completed count
    setCompletedConstellations(prev => prev + 1);
    
    // Create sparkle effect
    const firstStar = stars.find(s => s.constellationId === constellationId);
    if (firstStar) {
      const sparkleId = `sparkle-${Date.now()}`;
      setSparkleEffects(prev => [...prev, { 
        id: sparkleId, 
        x: (firstStar.x / 100) * window.innerWidth, 
        y: (firstStar.y / 100) * window.innerHeight 
      }]);
      
      setTimeout(() => {
        setSparkleEffects(prev => prev.filter(effect => effect.id !== sparkleId));
      }, 2000);
      
      // Activate the portal
      activatePortal(constellationId);
    }
    
    // Create many sparkle effects throughout the screen
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const extraSparkleId = `extra-sparkle-${Date.now()}-${i}`;
        setSparkleEffects(prev => [...prev, { 
          id: extraSparkleId, 
          x: Math.random() * window.innerWidth, 
          y: Math.random() * (window.innerHeight * 0.7)
        }]);
        
        setTimeout(() => {
          setSparkleEffects(prev => prev.filter(effect => effect.id !== extraSparkleId));
        }, 2000);
      }, i * 200);
    }
    
    // Reset selection after a delay
    setTimeout(() => {
      setSelectedStars([]);
    }, 1000);
  };
  
  // Activate portal
  const activatePortal = (constellationId: number) => {
    // Update garden plot
    setGardenPlots(plots => 
      plots.map(plot => {
        if (plot.constellationId === constellationId) {
          return { ...plot, isActive: true };
        }
        return plot;
      })
    );
    
    playSound('grow');
  };

  return (
    <motion.div
      className="w-full h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        fontFamily: "Comic Neue, Comic Sans MS, cursive",
        cursor: selectedStars.length > 0 ? "pointer" : "default"
      }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseLeave={handlePointerLeave}
      onTouchEnd={handlePointerLeave}
    >
      {/* Tutorial overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div className="bg-black/70 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl text-center max-w-md">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 mx-auto mb-3 sm:mb-4 animate-spin-slow" />
            <p className="text-lg sm:text-xl mb-2 sm:mb-3 font-bold text-white">
              Find the Birthday Crown Constellation!
            </p>
            <p className="text-sm sm:text-md mb-2 text-white/90">
              Connect the stars in the right order to reveal a magical cosmic gift
            </p>
            <p className="text-xs sm:text-sm text-white/70">
              Hint: Look for 7 bright stars forming a crown shape
            </p>
          </div>
        </div>
      )}

      {/* Background canvas for constellation lines */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-10"
      />
      
      {/* Background stars */}
      <div className="fixed inset-0 z-0"> 
        {backgroundStars.map((star) => (
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
      
      {/* Shooting stars */}
      {shootingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute h-0.5 bg-white rounded-full z-5 overflow-visible"
          style={{
            width: star.width,
            boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.7), 0 0 20px 6px rgba(162, 155, 254, 0.5)',
            transformOrigin: 'left center',
            left: `${star.startX}%`,
            top: `${star.startY}%`,
          }}
          initial={{ 
            x: '0%',
            y: '0%',
            opacity: 0,
            rotate: Math.atan2(star.endY - star.startY, star.endX - star.startX) * (180 / Math.PI)
          }}
          animate={{
            x: [`0%`, `${star.endX - star.startX}%`],
            y: [`0%`, `${star.endY - star.startY}%`],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Celestial Bodies */}
      <div className="transition-all duration-1000 ease-in-out">
        {/* Moon with phases */}
        <div
          className={`absolute ${isMobile ? 'right-4 top-4 w-16 h-16' : 'right-10 top-10 w-24 h-24'} rounded-full flex items-center justify-center`}
          style={{
            background: 'white',
            boxShadow: '0 0 20px 5px rgba(255, 255, 255, 0.4)',
            zIndex: 5
          }}
        >
          {moonPhase > 0 && (
            <div 
              className="absolute transition-all duration-1000 rounded-full"
              style={{
                background: '#0f0c29',
                width: isMobile ? '16px' : '24px',
                height: isMobile ? '16px' : '24px',
                right: moonPhase === 1 ? '0' : moonPhase === 3 ? (isMobile ? '-16px' : '-24px') : '0',
                top: '0',
                boxShadow: moonPhase === 2 ? `inset 0 0 20px ${isMobile ? '16px' : '24px'} #0f0c29` : 'none',
                transform: moonPhase === 2 ? 'scale(4)' : 'scale(1)',
              }}
            />
          )}
        </div>
      </div>
      
      {/* Floating UFOs and Astronauts - only on larger screens */}
      {floatingObjects.map((obj) => (
        <motion.div
          key={obj.id}
          className="absolute z-20"
          style={{
            left: `${obj.x}%`,
            top: `${obj.y}%`,
            transform: `rotate(${obj.rotation}deg) scale(${obj.scale})`,
            transformOrigin: 'center center',
          }}
          whileHover={{ scale: obj.scale * 1.2 }}
        >
          {obj.type === 'ufo' ? (
            <UFO className="drop-shadow-2xl" />
          ) : (
            <Astronaut className="drop-shadow-2xl" />
          )}
          <motion.div
            className="absolute bottom-0 left-1/2 w-16 h-4 rounded-full bg-blue-400/20"
            style={{ transform: 'translateX(-50%)' }}
            animate={{
              width: ['100%', '140%', '100%'],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>
      ))}
      
      {/* Heading & Stats */}
      <div className="absolute top-2 sm:top-4 left-1/2 z-20 transform -translate-x-1/2 text-center w-full px-4">
        <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-indigo-100 drop-shadow-lg`}>
          <span className="text-yellow-300">★</span> Cosmic Constellation Quest <span className="text-yellow-300">★</span>
        </h1>
        <div className="flex items-center justify-center gap-4 mt-1 sm:mt-2">
          <p className="text-md sm:text-xl text-indigo-100">
            <span className="inline-flex items-center">
              <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 mr-1 sm:mr-2" fill="currentColor" />
              Constellations: {completedConstellations}/{REWARD_THRESHOLD}
            </span>
          </p>
        </div>
      </div>
      
      {/* Interactive stars */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {stars.map((star) => (
          <div 
            key={`interactive-star-${star.id}`}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => handleStarClick(star.id)}
          >
            <motion.div
              className="w-full h-full rounded-full"
              style={{
                background: star.isActive 
                  ? 'rgba(255, 255, 150, 0.9)' 
                  : 'rgba(255, 255, 255, 0.8)',
                boxShadow: star.isActive 
                  ? '0 0 15px 5px rgba(255, 255, 150, 0.7), 0 0 30px 10px rgba(255, 255, 150, 0.3)'
                  : '0 0 10px 2px white'
              }}
              animate={{
                scale: star.isActive ? [1, 1.3, 1] : [1, 1.1, 1]
              }}
              transition={{
                duration: star.isActive ? 1.5 : 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            {/* Star ID number - makes it easier to see the sequence */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8px] sm:text-[10px] font-bold text-gray-800">
              {star.id}
            </div>
          </div>
        ))}
      </div>
      
      {/* Portal Activation Area */}
      <div className="absolute left-0 right-0 bottom-0 h-1/3 z-20">
        {gardenPlots.map((plot) => (
          <motion.div
            key={plot.id}
            className="absolute bottom-0"
            style={{
              left: `${plot.x}%`,
              height: "100%",
              width: isMobile ? "160px" : "200px",
              transform: `translateX(-50%) rotate(${plot.rotation}deg)`,
              transformOrigin: "bottom center"
            }}
            initial={{ y: 20 }}
            animate={{ 
              y: 0,
              opacity: plot.isActive ? 1 : 0.7
            }}
            transition={{ duration: 1 }}
          >
            {/* Glowing platform/altar */}
            <motion.div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
              style={{
                width: isMobile ? "100px" : "130px",
                height: isMobile ? "30px" : "40px",
                background: "radial-gradient(circle at center, #463d7a, #2c284d)",
                borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
                zIndex: 2
              }}
              animate={{
                boxShadow: plot.isActive 
                  ? ['0 0 20px 5px rgba(120, 100, 255, 0.3)', '0 0 30px 10px rgba(120, 100, 255, 0.4)', '0 0 20px 5px rgba(120, 100, 255, 0.3)']
                  : 'none'
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            {/* Cosmic Portal */}
            {plot.isActive && (
              <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2">
                <motion.div
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1
                  }}
                  transition={{ duration: 1 }}
                >
                  <motion.div
                    animate={{
                      rotate: 360
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <CosmicPortal 
                      style={{
                        transform: `scale(${isMobile ? 0.7 : 1})`,
                        filter: `drop-shadow(0 0 15px ${plot.portalColor})`
                      }}
                    />
                  </motion.div>
                </motion.div>
              </div>
            )}
            
            {/* Show label for completed constellation */}
            {plot.isActive && (
              <motion.div 
                className="absolute bottom-32 sm:bottom-40 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-center font-medium text-indigo-100 bg-indigo-900/70 px-3 py-1 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm text-sm sm:text-lg border border-indigo-400/30">
                  {constellations.find(c => c.id === plot.constellationId)?.name}
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Sparkle effects */}
      {sparkleEffects.map((effect) => (
        <motion.div
          key={effect.id}
          className="absolute pointer-events-none z-30"
          style={{
            left: effect.x,
            top: effect.y,
            width: 0,
            height: 0
          }}
        >
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0.2, 1.5, 0.2],
              rotate: [0, 180]
            }}
            transition={{ duration: 2 }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <motion.div
                key={angle}
                className="absolute"
                style={{
                  width: '3px',
                  height: '24px',
                  left: '0px',
                  top: '0px',
                  transformOrigin: 'center',
                  transform: `rotate(${angle}deg)`,
                  background: `linear-gradient(to top, ${angle % 90 === 0 ? '#FFFF80' : '#70D6FF'}, transparent)`,
                  boxShadow: '0 0 10px 2px rgba(255, 255, 200, 0.8)'
                }}
                animate={{
                  height: [24, 32, 24]
                }}
                transition={{ duration: 2 }}
              />
            ))}
          </motion.div>
        </motion.div>
      ))}
      
      {/* Redesigned Reward Message */}
      {completedConstellations >= REWARD_THRESHOLD && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center px-4"
          initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
          animate={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative bg-gradient-to-br from-indigo-900/90 via-purple-900/95 to-indigo-900/90 p-4 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.3,
              type: "spring",
              stiffness: 100
            }}
          >
            {/* Animated border */}
            <motion.div 
              className="absolute inset-0 rounded-2xl"
              style={{
                border: '2px dashed rgba(255, 255, 255, 0.3)',
                zIndex: -1
              }}
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Stars background */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl" style={{ zIndex: -1 }}>
              {[...Array(20)].map((_, i) => {
                const size = Math.random() * 3 + 1;
                return (
                  <motion.div
                    key={`reward-star-${i}`}
                    className="absolute bg-white rounded-full"
                    style={{
                      width: size,
                      height: size,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      boxShadow: `0 0 ${size}px ${size/2}px white`
                    }}
                    animate={{
                      opacity: [0.1, 0.7, 0.1]
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                );
              })}
            </div>
            
            {/* Top award icon */}
            <div className="flex justify-center mb-4">
              <motion.div
                className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 10px 0px rgba(250, 204, 21, 0.7)',
                    '0 0 20px 5px rgba(250, 204, 21, 0.7)',
                    '0 0 10px 0px rgba(250, 204, 21, 0.7)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                
                {/* Circling zaps */}
                {[0, 90, 180, 270].map((angle, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      transformOrigin: 'center center',
                      transform: `rotate(${angle}deg) translateY(-30px)`
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5
                    }}
                  >
                    <Zap className="w-4 h-4 text-yellow-300" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            <motion.div
              className="text-center mb-5"
              animate={{
                y: [0, -4, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <h2 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-100 to-yellow-300 mb-1">
                Constellation Complete!
              </h2>
              <p className="text-sm sm:text-base text-indigo-100">
                The cosmic portal has been activated
              </p>
            </motion.div>
            
            <div className="relative flex justify-center my-6">
              <motion.div
                className="bg-gradient-to-br from-purple-400/30 to-indigo-600/30 p-4 rounded-2xl backdrop-blur-sm border border-white/20 w-full max-w-xs"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(147, 51, 234, 0.3)',
                    '0 0 30px rgba(147, 51, 234, 0.4)',
                    '0 0 15px rgba(147, 51, 234, 0.3)'
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <div className="text-center">
                  <p className="text-lg sm:text-xl font-medium text-white mb-3">
                    Your Cosmic Gift
                  </p>
                  
                  <motion.div
                    className="flex justify-center"
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <div className="relative">
                      <span className="text-4xl sm:text-5xl">🥟</span>
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      >
                        <span className="text-4xl sm:text-5xl">✨</span>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  <p className="text-base sm:text-lg text-indigo-100 mt-2">
                    Interstellar Fried Momos
                  </p>
                </div>
              </motion.div>
            </div>
            
            {/* Continue Button */}
            <div className="flex justify-center">
              <motion.button
                className="bg-gradient-to-r from-indigo-500 to-purple-700 text-white px-6 py-3 rounded-full text-sm sm:text-lg font-semibold shadow-lg flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 15px rgba(129, 140, 248, 0.8)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
              >
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                Continue to Cake Ceremony
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Instructions badge for constellation mechanics */}
      <motion.div 
        className={`absolute ${isMobile ? 'bottom-4 right-4 left-4' : 'top-32 right-4'} z-20 bg-indigo-900/60 p-3 rounded-lg ${isMobile ? 'max-w-full' : 'max-w-xs'} border border-indigo-500/40`}
        animate={{
          boxShadow: ["0 0 10px rgba(129, 140, 248, 0.2)", "0 0 15px rgba(129, 140, 248, 0.4)", "0 0 10px rgba(129, 140, 248, 0.2)"]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
      >
        <p className="text-indigo-200 text-xs sm:text-sm">
          <span className="block font-medium mb-1">How to play:</span>
          1. Find stars numbered 1-7 🌟<br />
          2. Connect them in sequence by clicking ✨<br />
          3. Complete the crown constellation 👑<br />
          4. Unlock your cosmic gift! 🎁
        </p>
      </motion.div>
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default Room;
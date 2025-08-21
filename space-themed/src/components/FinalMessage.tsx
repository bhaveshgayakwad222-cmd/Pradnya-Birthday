import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Rocket, ChevronRight, Heart, Moon, Sun, Sparkles, Zap, Music, Satellite, ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';

export const FinalMessage: React.FC = () => {
  const [phase, setPhase] = useState<"intro" | "game" | "final">("intro");
  const [score, setScore] = useState(0);
  const [shipPosition, setShipPosition] = useState(50); // percentage from left
  const [projectiles, setProjectiles] = useState<{id: number, x: number, y: number}[]>([]);
  const [targets, setTargets] = useState<{id: number, x: number, y: number, size: number, color: string, speed: number, health: number}[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [explosion, setExplosion] = useState<{x: number, y: number} | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const targetIdRef = useRef(0);
  const projectileIdRef = useRef(0);
  const targetScore = 10; // Targets needed to win
  const lastShotRef = useRef(0);
  const shootCooldown = 300; // ms between shots
  
  // Generate fixed background elements to prevent re-rendering issues
  const backgroundElements = useMemo(() => {
    return Array(8).fill(0).map((_, idx) => ({
      id: idx,
      left: Math.random() * 90 + 5,
      top: Math.random() * 90 + 5,
      moveY: Math.random() * 30 - 15,
      rotation: Math.random() * 40 - 20,
      duration: Math.random() * 10 + 10,
      size: Math.random() * 30 + 20,
      type: idx % 3 // 0: Moon, 1: Star, 2: Sun
    }));
  }, []);
  
  // Generate fixed background stars for game area with subtle movement
  const backgroundStars = useMemo(() => {
    return Array(50).fill(0).map((_, idx) => ({
      id: idx,
      width: Math.random() * 2 + 1,
      height: Math.random() * 2 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.7 + 0.3,
      animationDuration: Math.random() * 8 + 4,
      animationDelay: Math.random() * 5,
      moveX: (Math.random() - 0.5) * 6,
      moveY: (Math.random() - 0.5) * 6,
      twinkle: Math.random() > 0.7 // Some stars twinkle
    }));
  }, []);
  
  // Playful space creatures
  const spaceCreatures = useMemo(() => {
    return Array(3).fill(0).map((_, idx) => ({
      id: idx,
      left: Math.random() * 80 + 10,
      bottom: Math.random() * 20 + 5,
      size: Math.random() * 12 + 8,
      moveX: Math.random() * 40 - 20,
      moveY: Math.random() * 10 - 5,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 3,
      rotate: Math.random() * 30 - 15,
    }));
  }, []);
  
  const encouragements = [
    "Great shot! ✨",
    "Wonderful! ⭐",
    "Amazing! 🌟",
    "Keep going! 💫",
    "You're stellar! ✨",
    "Cosmic skills! 🚀",
    "Fantastic! 🌠",
  ];
  
  const targetColors = [
    "text-yellow-300",
    "text-blue-300",
    "text-pink-300",
    "text-purple-300",
    "text-green-300",
    "text-red-300",
  ];

  useEffect(() => {
    if (phase === "game" && gameActive && !gamePaused) {
      // Start the game loop
      requestRef.current = requestAnimationFrame(gameLoop);
      
      // Add new targets periodically
      const targetInterval = setInterval(() => {
        if (gameActive && !gamePaused) {
          addTarget();
        }
      }, 1800);
      
      return () => {
        cancelAnimationFrame(requestRef.current!);
        clearInterval(targetInterval);
      };
    } else if (gamePaused && requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, [phase, gameActive, gamePaused]);

  // Check for win condition
  useEffect(() => {
    if (score >= targetScore) {
      setGameActive(false);
      
      // Create celebration effect
      const celebrationTimer = setInterval(() => {
        if (gameAreaRef.current) {
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          setExplosion({x, y});
          setTimeout(() => setExplosion(null), 800);
        }
      }, 300);
      
      setTimeout(() => {
        clearInterval(celebrationTimer);
        setPhase("final");
      }, 3000);
    } else if (score > 0 && score % 1 === 0) { // Show message every point
      // Show encouraging message when target is hit
      const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
      setMessage(encouragement);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 1500);
    }
  }, [score]);

  const gameLoop = () => {
    // Update projectile positions
    setProjectiles(prevProjectiles => 
      prevProjectiles
        .map(projectile => ({
          ...projectile,
          y: projectile.y - 2 // Move projectiles up
        }))
        .filter(projectile => projectile.y > -10) // Remove projectiles that go off screen
    );
    
    // Update target positions
    setTargets(prevTargets => 
      prevTargets
        .map(target => ({
          ...target,
          y: target.y + target.speed // Move targets down
        }))
        .filter(target => {
          // Remove targets that go off screen
          if (target.y > 100) return false;
          return true;
        })
    );
    
    // Check for collisions between projectiles and targets
    setProjectiles(prevProjectiles => {
      const remainingProjectiles = [...prevProjectiles];
      
      setTargets(prevTargets => {
        return prevTargets.map(target => {
          // Check if any projectile hits this target
          const hitIndex = remainingProjectiles.findIndex(projectile => {
            const distance = Math.sqrt(
              Math.pow((projectile.x - target.x) * 3, 2) + 
              Math.pow((projectile.y - target.y) * 3, 2)
            );
            return distance < 10 + target.size * 5;
          });
          
          if (hitIndex >= 0) {
            // Remove the projectile that hit
            remainingProjectiles.splice(hitIndex, 1);
            
            // Reduce target health
            const updatedHealth = target.health - 1;
            
            // If target is destroyed
            if (updatedHealth <= 0) {
              // Create explosion effect
              setExplosion({x: target.x, y: target.y});
              setTimeout(() => setExplosion(null), 800);
              
              // Increment score
              setScore(prev => prev + 1);
              
              // Remove the target
              return null;
            }
            
            // Return target with reduced health
            return { ...target, health: updatedHealth };
          }
          
          return target;
        }).filter(Boolean) as typeof prevTargets;
      });
      
      return remainingProjectiles;
    });
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const addTarget = () => {
    const targetSize = Math.random() * 0.7 + 0.8; // Random size
    const newTarget = {
      id: targetIdRef.current++,
      x: Math.random() * 80 + 10, // Random position
      y: -10, // Start above the visible area
      speed: Math.random() * 0.3 + 0.15, // Random speed
      size: targetSize,
      color: targetColors[Math.floor(Math.random() * targetColors.length)],
      health: Math.ceil(targetSize * 1.5), // Health based on size
    };
    
    setTargets(prevTargets => [...prevTargets, newTarget]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gameAreaRef.current || !gameActive || gamePaused) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    // Limit ship position to within the game area
    setShipPosition(Math.max(12, Math.min(88, percentage)));
  };

  const handleClick = () => {
    if (!gameActive || gamePaused) return;
    shoot();
  };

  const shoot = () => {
    const now = Date.now();
    if (now - lastShotRef.current < shootCooldown) return;
    
    lastShotRef.current = now;
    
    // Create new projectile at ship position
    const newProjectile = {
      id: projectileIdRef.current++,
      x: shipPosition,
      y: 85 // Start at ship position
    };
    
    setProjectiles(prev => [...prev, newProjectile]);
  };

  const moveShip = (direction: 'left' | 'right') => {
    if (!gameActive || gamePaused) return;
    
    setShipPosition(prev => {
      const newPosition = direction === 'left' 
        ? Math.max(12, prev - 5) 
        : Math.min(88, prev + 5);
      return newPosition;
    });
  };

  const togglePause = () => {
    setGamePaused(prev => !prev);
  };

  const startGame = () => {
    setScore(0);
    setProjectiles([]);
    setTargets([]);
    setGameActive(true);
    setGamePaused(false);
    setPhase("game");
    lastShotRef.current = 0;
  };

  const getProgressBarWidth = () => {
    return `${Math.min(100, (score / targetScore) * 100)}%`;
  };

  // Generate celebration elements with fixed positions
  const celebrationElements = useMemo(() => {
    return Array(12).fill(0).map((_, idx) => ({
      id: idx,
      left: Math.random() * 100,
      top: Math.random() * 100,
      moveY: Math.random() * 100 + 50,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
      size: 10 + Math.random() * (idx % 3 === 0 ? 20 : 15),
      type: idx % 3 // 0: Heart, 1/2: Star
    }));
  }, []);

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying);
    // In a real implementation, you would play/pause the actual music here
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Music Toggle Button - Space Themed */}
      <motion.button
        className="fixed top-5 right-5 z-50 bg-gray-900/70 backdrop-blur rounded-full p-3 shadow-lg border border-indigo-500/30"
        whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(129, 140, 248, 0.5)' }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMusic}
        animate={{ 
          rotate: isMusicPlaying ? [0, 360] : 0,
          boxShadow: isMusicPlaying ? '0 0 10px rgba(129, 140, 248, 0.7)' : '0 0 5px rgba(129, 140, 248, 0.3)'
        }}
        transition={{ 
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          boxShadow: { duration: 1.5, repeat: Infinity, repeatType: "reverse" }
        }}
      >
        <div className="relative">
          <Satellite size={24} className={`${isMusicPlaying ? 'text-blue-300' : 'text-indigo-400'}`} />
          {isMusicPlaying && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-full h-full rounded-full bg-blue-500 opacity-50 blur-sm" />
            </motion.div>
          )}
        </div>
      </motion.button>

      {/* Floating space elements in background - fixed positions */}
      {backgroundElements.map((element) => (
        <motion.div
          key={`bg-element-${element.id}`}
          className="fixed opacity-20 pointer-events-none"
          style={{
            left: `${element.left}%`,
            top: `${element.top}%`,
            zIndex: 0,
          }}
          animate={{
            y: [0, element.moveY],
            rotate: [0, element.rotation],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          {element.type === 0 ? (
            <Moon className="text-blue-100" size={element.size} />
          ) : element.type === 1 ? (
            <Star className="text-yellow-100" size={element.size} />
          ) : (
            <Sun className="text-orange-100" size={element.size} />
          )}
        </motion.div>
      ))}

      {phase === "intro" && (
        <motion.div
          className="w-full max-w-md bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-indigo-500/30 overflow-hidden z-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-8 text-center">
            <motion.div
              className="flex justify-center mb-6"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="relative">
                <Rocket className="text-blue-400" size={60} />
                <motion.div 
                  className="absolute top-0 left-0 w-full h-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Rocket className="text-blue-200 opacity-50" size={60} />
                </motion.div>
              </div>
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Cosmic Guardian
            </h1>
            
            <p className="text-indigo-200 mb-8">
              Magical cosmic fragments are entering your space sector! Pilot your special 
              starship to shoot {targetScore} of these elements with starbeams, 
              revealing a special birthday message from across the galaxy!
            </p>
            
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg text-lg font-bold"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(139, 92, 246, 0.7)" }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>Launch Mission</span>
                <ChevronRight size={18} />
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

      {phase === "game" && (
        <motion.div
          className="relative w-full max-w-lg bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-indigo-500/30 overflow-hidden z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-4">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white">
                  Cosmic Guardian
                </h2>
                <div className="flex items-center bg-indigo-900/50 px-3 py-1 rounded-full">
                  <Star className="text-yellow-300 mr-2" size={16} fill="currentColor" />
                  <span className="text-white font-bold">{score} / {targetScore}</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  initial={{ width: "0%" }}
                  animate={{ width: getProgressBarWidth() }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
            <div 
              ref={gameAreaRef}
              className={`relative w-full h-[350px] bg-gray-900/90 rounded-xl mb-4 overflow-hidden ${gamePaused ? 'opacity-75' : ''}`}
              onMouseMove={handleMouseMove}
              onClick={handleClick}
            >
              {/* Nebula background effect */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-purple-500 rounded-full filter blur-3xl"></div>
                <div className="absolute top-1/2 right-1/4 w-1/2 h-1/2 bg-blue-500 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-pink-500 rounded-full filter blur-3xl"></div>
              </div>
              
              {/* Background stars - fixed positions with subtle movement */}
              {backgroundStars.map((star) => (
                <motion.div
                  key={`bg-star-${star.id}`}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: star.width,
                    height: star.height,
                    left: `${star.left}%`,
                    top: `${star.top}%`,
                    opacity: star.opacity
                  }}
                  animate={
                    star.twinkle 
                    ? {
                        opacity: [star.opacity, star.opacity + 0.3, star.opacity],
                        scale: [1, 1.3, 1]
                      }
                    : {
                        x: [0, star.moveX, 0],
                        y: [0, star.moveY, 0]
                      }
                  }
                  transition={{
                    duration: star.animationDuration,
                    delay: star.animationDelay,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              ))}
              
              {/* Playful space creatures */}
              {spaceCreatures.map(creature => (
                <motion.div
                  key={`creature-${creature.id}`}
                  className="absolute pointer-events-none"
                  style={{
                    bottom: `${creature.bottom}%`,
                    left: `${creature.left}%`,
                  }}
                  animate={{
                    x: [0, creature.moveX, 0],
                    y: [0, creature.moveY, 0],
                    rotate: [0, creature.rotate, 0]
                  }}
                  transition={{
                    duration: creature.duration,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: creature.delay
                  }}
                >
                  {creature.id % 3 === 0 ? (
                    <Rocket className="text-indigo-300 opacity-40" size={creature.size} />
                  ) : creature.id % 3 === 1 ? (
                    <Satellite className="text-green-300 opacity-40" size={creature.size} />
                  ) : (
                    <Moon className="text-blue-300 opacity-40" size={creature.size} />
                  )}
                </motion.div>
              ))}
              
              {/* Targets */}
              {targets.map(target => (
                <motion.div
                  key={`target-${target.id}`}
                  className="absolute"
                  style={{
                    left: `${target.x}%`,
                    top: `${target.y}%`,
                  }}
                  animate={gamePaused ? {} : { rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Star 
                    className={target.color} 
                    size={20 * target.size} 
                    fill="currentColor" 
                  />
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-full"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className={`w-full h-full rounded-full blur-md opacity-50 ${target.color.replace('text', 'bg')}`} />
                  </motion.div>
                </motion.div>
              ))}
              
              {/* Projectiles */}
              {projectiles.map(projectile => (
                <motion.div
                  key={`projectile-${projectile.id}`}
                  className="absolute w-1.5 h-6 bg-cyan-400 rounded-full"
                  style={{
                    left: `${projectile.x}%`,
                    top: `${projectile.y}%`,
                    transform: 'translateX(-50%)',
                  }}
                  initial={{ opacity: 0.7, height: 4 }}
                  animate={{ opacity: 1, height: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-full h-full bg-cyan-300 rounded-full blur-sm opacity-60" />
                </motion.div>
              ))}
              
              {/* Encouraging messages */}
              <AnimatePresence>
                {showMessage && (
                  <motion.div
                    className="absolute left-1/2 top-1/3 transform -translate-x-1/2 bg-indigo-900/80 px-4 py-2 rounded-lg text-white font-bold text-lg shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Explosion effect */}
              <AnimatePresence>
                {explosion && (
                  <motion.div
                    className="absolute"
                    style={{
                      left: `${explosion.x}%`,
                      top: `${explosion.y}%`,
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.5 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <Sparkles className="text-yellow-300" size={30} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Player's spaceship */}
              <motion.div
                className="absolute bottom-4"
                style={{
                  left: `${shipPosition}%`,
                  transform: 'translateX(-50%)',
                }}
                animate={{ y: gamePaused ? 0 : [0, -2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="relative">
                  {/* Spaceship with thrusters */}
                  <div className="relative">
                    <Rocket
                      className="text-blue-400"
                      size={36}
                      style={{ transform: 'rotate(-90deg)' }}
                    />
                    {!gamePaused && (
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-8"
                        animate={{
                          height: [8, 15, 8],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        style={{
                          background: "linear-gradient(to top, #f97316, transparent)",
                          borderRadius: "10px 10px 0 0",
                          transform: "rotate(90deg)",
                        }}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
              
              {/* Pause overlay */}
              {gamePaused && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <motion.div
                    className="text-white font-bold text-2xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    PAUSED
                  </motion.div>
                </div>
              )}
            </div>
            
            {/* Game controls */}
            <div className="flex justify-between items-center">
              <p className="text-indigo-200 text-center text-sm hidden sm:block">
                Move your mouse to pilot the ship and click to shoot starbeams!
              </p>
              
              <div className="flex space-x-3 mt-2 w-full sm:w-auto justify-center">
                {/* Controller buttons */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-full bg-indigo-700/70 flex items-center justify-center"
                  onClick={() => moveShip('left')}
                >
                  <ArrowLeft className="text-white" size={22} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-full bg-pink-700/70 flex items-center justify-center"
                  onClick={shoot}
                >
                  <Zap className="text-white" size={22} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-full bg-purple-700/70 flex items-center justify-center"
                  onClick={togglePause}
                >
                  {gamePaused ? 
                    <Play className="text-white" size={22} /> : 
                    <Pause className="text-white" size={22} />
                  }
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-full bg-indigo-700/70 flex items-center justify-center"
                  onClick={() => moveShip('right')}
                >
                  <ArrowRight className="text-white" size={22} />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {phase === "final" && (
        <motion.div
          className="w-full max-w-md bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-indigo-500/30 overflow-hidden z-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-8">
            {/* Celebration effects - fixed positions */}
            {celebrationElements.map((element) => (
              <motion.div
                key={`celebration-${element.id}`}
                className="absolute"
                style={{
                  left: `${element.left}%`,
                  top: `${element.top}%`,
                }}
                animate={{
                  y: [0, -element.moveY],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: element.duration,
                  repeat: Infinity,
                  delay: element.delay,
                }}
              >
                {element.type === 0 ? (
                  <Heart className="text-pink-400" size={element.size} fill="currentColor" />
                ) : (
                  <Star className={targetColors[element.id % targetColors.length]} size={element.size} fill="currentColor" />
                )}
              </motion.div>
            ))}
            
            <motion.div
              className="flex justify-center mb-8"
              animate={{ 
                y: [0, -10, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="relative">
                <Heart className="text-pink-400" size={60} fill="currentColor" />
                <motion.div
                  className="absolute top-0 left-0 w-full h-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart className="text-pink-200" size={60} fill="currentColor" />
                </motion.div>
                
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Star className="text-yellow-300" size={20} fill="currentColor" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.h1
              className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              HAPPY BIRTHDAY MADAM JI!
            </motion.h1>
            
            <p className="text-indigo-100 leading-relaxed text-center mb-6">
              Mission accomplished! You've protected the galaxy and unlocked
              this special message. Like the brilliant stars across the universe, you light up
              every day with your warmth and kindness. Thank you for bringing so much joy into my life.
              This birthday celebrates the amazing person you are!
            </p>
            
            <div className="mt-8 flex justify-center">
              <motion.div
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                ILYSM 💫✨💖
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
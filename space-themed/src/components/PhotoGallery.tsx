import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Music, Globe, Sparkles } from "lucide-react";

import Pic1 from "./img/pic1.jpg";
import Pic2 from "./img/pic2.jpg";
import Pic3 from "./img/pic3.jpg";

// Import local playlist music files
import songA from "./music/kinnasona.mp3";
import songB from "./music/huahain.mp3";
import songC from "./music/rangrez.mp3";

interface Photo {
  url: string;
  caption: string;
}

const photos: Photo[] = [
  {
    url: Pic1,
    caption: "Happy Birthday to the one who makes every moment a cosmic adventure!",
  },
  {
    url: Pic2,
    caption: "To the brightest star in my universe – keep shining your light!",
  },
  {
    url: Pic3,
    caption: "Here's to a day as stellar and extraordinary as you are – let's celebrate!",
  },
];

// Playlist song names and corresponding local music files
const playlist = ["Kinna Sona", "Hua Hain Aaj Pehli Bar", "O Rangrez"];
const songFiles = [songA, songB, songC];

interface PhotoGalleryProps {
  onComplete: () => void;
  stopBgMusic: () => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onComplete, stopBgMusic }) => {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [showStarTrail, setShowStarTrail] = useState<{ x: number, y: number } | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Detect device performance
  useEffect(() => {
    const isLowPerfDevice =
      window.navigator.userAgent.indexOf("Mobile") !== -1 || // Mobile device
      window.navigator.hardwareConcurrency <= 4; // Low CPU cores

    setReducedMotion(isLowPerfDevice);

    // Also respect user's system preference for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setReducedMotion(true);
    }
  }, []);

  // Generate background stars with improved variety
  const backgroundStars = useMemo(() => {
    return Array.from({ length: reducedMotion ? 30 : 60 }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 8 + 2;
      const delay = Math.random() * 5;
      const twinkleIntensity = Math.random() * 0.6 + 0.2;

      return { id: i, size, x, y, duration, delay, twinkleIntensity };
    });
  }, [reducedMotion]);

  // Generate nebula clouds with enhanced colors but reduced count
  const nebulaClouds = useMemo(() => {
    const colorPalettes = [
      [220, 280], // Blue to purple
      [260, 320], // Purple to pink
      [170, 230], // Teal to blue
      [0, 60], // Red to yellow (rare)
    ];

    return Array.from({ length: reducedMotion ? 2 : 4 }).map((_, i) => {
      const size = Math.random() * 40 + 20;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const opacity = Math.random() * 0.15 + 0.1;

      const palette = colorPalettes[Math.random() > 0.8 ? Math.floor(Math.random() * colorPalettes.length) : 0];
      const hue = Math.random() * (palette[1] - palette[0]) + palette[0];

      const duration = Math.random() * 120 + 60;

      return { id: i, size, x, y, opacity, hue, duration };
    });
  }, [reducedMotion]);

  // Generate connecting lines for constellation (improved pattern)
  const constellationLines = useMemo(() => {
    const lines = [];
    const centerX = 50;
    const centerY = 50;

    for (let i = 0; i < photos.length; i++) {
      const angle = (2 * Math.PI / photos.length) * i;
      const x = centerX + 25 * Math.cos(angle);
      const y = centerY + 25 * Math.sin(angle);

      lines.push({
        id: `center-${i}`,
        x1: centerX,
        y1: centerY,
        x2: x,
        y2: y,
        delay: i * 0.3,
      });

      const nextIdx = (i + 1) % photos.length;
      const nextAngle = (2 * Math.PI / photos.length) * nextIdx;
      const nextX = centerX + 25 * Math.cos(nextAngle);
      const nextY = centerY + 25 * Math.sin(nextAngle);

      lines.push({
        id: `circle-${i}`,
        x1: x,
        y1: y,
        x2: nextX,
        y2: nextY,
        delay: i * 0.3 + 1.5,
      });
    }

    return lines;
  }, []);

  // Cleanup any playing audio when the component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Debounce the song click handler to prevent rapid clicks
  const handleSongClick = useCallback(
    (index: number) => {
      if (currentSongIndex === index) return;

      setShowStarTrail({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight });
      setTimeout(() => setShowStarTrail(null), 800);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      stopBgMusic();
      setCurrentSongIndex(index);
      const newAudio = new Audio(songFiles[index]);
      audioRef.current = newAudio;
      newAudio.play().catch((error) => console.log("Playlist audio playback failed:", error));
    },
    [currentSongIndex, stopBgMusic]
  );

  // Position photos in a constellation pattern
  const photoPositions = useMemo(() => {
    return photos.map((_, index) => {
      const angle = (2 * Math.PI / photos.length) * index;
      const x = 50 + 25 * Math.cos(angle);
      const y = 45 + 25 * Math.sin(angle);

      return { x, y, angle };
    });
  }, []);

  return (
    <motion.div className="min-h-screen relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className="fixed inset-0 z-0 overflow-hidden bg-black"
        animate={
          reducedMotion
            ? {}
            : {
                background: [
                  "linear-gradient(135deg, #0a0a1a 0%, #121236 30%, #1e1e42 70%, #0a0a1a 100%)",
                  "linear-gradient(135deg, #080830 0%, #12123e 25%, #181845 50%, #0c0c30 75%, #080830 100%)",
                  "linear-gradient(135deg, #0a0a1a 0%, #121236 30%, #1e1e42 70%, #0a0a1a 100%)",
                ],
              }
        }
        transition={{
          duration: 60,
          times: [0, 0.5, 1],
          repeat: Infinity,
          repeatType: "mirror",
          ease: [0.2, 0.4, 0.6, 0.8],
        }}
      />

      {nebulaClouds.map((cloud) => (
        <motion.div
          key={`nebula-${cloud.id}`}
          className="fixed rounded-full blur-3xl mix-blend-screen"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            width: `${cloud.size}%`,
            height: `${cloud.size}%`,
            backgroundColor: `hsla(${cloud.hue}, 100%, 70%, ${cloud.opacity})`,
            zIndex: 1,
            willChange: "transform, opacity",
          }}
          animate={
            reducedMotion
              ? { opacity: [cloud.opacity, cloud.opacity * 1.2, cloud.opacity] }
              : {
                  scale: [1, 1.1, 1],
                  x: [0, 5, -5, 0],
                  y: [0, -5, 5, 0],
                  opacity: [cloud.opacity, cloud.opacity * 1.3, cloud.opacity],
                }
          }
          transition={{
            duration: reducedMotion ? cloud.duration * 1.5 : cloud.duration,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="fixed inset-0 z-1">
        {backgroundStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              width: star.size,
              height: star.size,
              left: `${star.x}%`,
              top: `${star.y}%`,
              boxShadow: `0 0 ${star.size + 1}px ${star.size / 2}px rgba(255, 255, 255, ${star.twinkleIntensity})`,
              willChange: "opacity, box-shadow",
            }}
            animate={
              reducedMotion
                ? { opacity: [0.5, 0.8, 0.5] }
                : {
                    opacity: [0.2, 0.8, 0.2],
                    boxShadow: [
                      `0 0 ${star.size}px ${star.size / 2}px rgba(255, 255, 255, ${star.twinkleIntensity * 0.3})`,
                      `0 0 ${star.size + 2}px ${star.size}px rgba(255, 255, 255, ${star.twinkleIntensity})`,
                      `0 0 ${star.size}px ${star.size / 2}px rgba(255, 255, 255, ${star.twinkleIntensity * 0.3})`,
                    ],
                  }
            }
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="fixed inset-0 z-1 opacity-60">
        {Array.from({ length: reducedMotion ? 15 : 30 }).map((_, i) => {
          const size = Math.random() * 1.5 + 0.5;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const duration = Math.random() * 180 + 120;
          const delay = Math.random() * 10;

          return (
            <motion.div
              key={`dust-${i}`}
              className="absolute bg-blue-100 rounded-full"
              style={{
                width: size,
                height: size,
                left: `${x}%`,
                top: `${y}%`,
                opacity: 0.4,
                willChange: "transform, opacity",
              }}
              animate={
                reducedMotion
                  ? { y: [`${y}%`, `${(y + 10) % 100}%`] }
                  : {
                      y: [`${y}%`, `${(y + 10) % 100}%`],
                      x: [`${x}%`, `${(x + 5) % 100}%`],
                      opacity: [0.3, 0.5],
                    }
              }
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "linear",
              }}
            />
          );
        })}
      </div>

      {showStarTrail && (
        <motion.div
          className="fixed z-50 pointer-events-none"
          style={{ left: showStarTrail.x, top: showStarTrail.y }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <motion.div
                key={angle}
                className="absolute"
                style={{
                  width: "20px",
                  height: "2px",
                  background: "linear-gradient(to right, #C4B5FD, white)",
                  transformOrigin: "center",
                  transform: `rotate(${angle}deg)`,
                  willChange: "transform, opacity",
                }}
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ duration: 0.8 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-10">
        <motion.div
          className="mb-8 text-center relative"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {!reducedMotion && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-full h-full overflow-visible pointer-events-none">
              {[1, 2].map((i) => (
                <motion.div
                  key={`orb-${i}`}
                  className="absolute rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, rgba(147, 197, 253, 0.1) 50%, transparent 70%)`,
                    width: `${i * 15}px`,
                    height: `${i * 15}px`,
                    left: `${50 + Math.cos(i * Math.PI / 4) * 120}px`,
                    top: `${30 + Math.sin(i * Math.PI / 3) * 20}px`,
                    willChange: "transform, opacity",
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0.3, 0.7],
                    x: [0, i * 5, 0],
                    y: [0, i * -3, 0],
                  }}
                  transition={{ duration: 3 + i, repeat: Infinity }}
                />
              ))}
            </div>
          )}

          {[1, 2].map((i) => (
            <motion.div
              key={`title-star-${i}`}
              className="absolute text-blue-300"
              style={{
                left: `${i * 25 - 10}%`,
                top: `${i % 2 === 0 ? -10 : 60}px`,
                willChange: "transform, opacity",
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 2 + i, repeat: Infinity }}
            >
              <Star size={i % 2 === 0 ? 16 : 12} fill="currentColor" />
            </motion.div>
          ))}

          <div className="relative">
            <motion.h1
              className="text-4xl sm:text-6xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-br from-blue-300 via-purple-300 to-indigo-200"
              style={{
                textShadow: reducedMotion
                  ? `0 0 10px rgba(165, 180, 252, 0.8)`
                  : `0 0 10px rgba(165, 180, 252, 0.8),
                   0 0 20px rgba(129, 140, 248, 0.6)`,
                letterSpacing: "0.5px",
                willChange: reducedMotion ? "auto" : "text-shadow",
              }}
              animate={
                reducedMotion
                  ? {}
                  : {
                      textShadow: [
                        `0 0 10px rgba(165, 180, 252, 0.8),
                   0 0 20px rgba(129, 140, 248, 0.6)`,
                        `0 0 12px rgba(165, 180, 252, 0.9),
                   0 0 25px rgba(129, 140, 248, 0.7)`,
                        `0 0 10px rgba(165, 180, 252, 0.8),
                   0 0 20px rgba(129, 140, 248, 0.6)`,
                      ],
                    }
              }
              transition={{ duration: 4, repeat: Infinity }}
            >
              Cosmic Memories Constellation
            </motion.h1>

            <motion.div
              className="h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent w-1/2 mx-auto mt-1"
              animate={{
                width: ["30%", "70%", "30%"],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <motion.p
            className="text-blue-200 text-lg mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Our story written in the stars
          </motion.p>
        </motion.div>

        <div className="w-full max-w-7xl mx-auto">
          <div className="relative h-[500px] mb-12">
            <motion.div
              className="absolute rounded-full bg-gradient-to-r from-indigo-600/30 to-purple-600/30 blur-xl"
              style={{
                left: "50%",
                top: "45%",
                width: "120px",
                height: "120px",
                transform: "translate(-50%, -50%)",
                willChange: "transform, opacity",
              }}
              animate={
                reducedMotion
                  ? {}
                  : {
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }
              }
              transition={{ duration: 5, repeat: Infinity }}
            />

            <motion.div
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: "45%",
                width: "30px",
                height: "30px",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, rgba(147,197,253,0.8) 0%, rgba(147,197,253,0.3) 50%, transparent 70%)",
                zIndex: 2,
                willChange: reducedMotion ? "auto" : "box-shadow",
              }}
              animate={
                reducedMotion
                  ? {}
                  : {
                      boxShadow: [
                        "0 0 10px 5px rgba(147,197,253,0.3)",
                        "0 0 20px 10px rgba(147,197,253,0.5)",
                        "0 0 10px 5px rgba(147,197,253,0.3)",
                      ],
                    }
              }
              transition={{ duration: 3, repeat: Infinity }}
            />

            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
              {constellationLines.map((line) => (
                <motion.line
                  key={line.id}
                  x1={`${line.x1}%`}
                  y1={`${line.y1}%`}
                  x2={`${line.x2}%`}
                  y2={`${line.y2}%`}
                  stroke="rgba(147, 197, 253, 0.4)"
                  strokeWidth="1"
                  strokeDasharray="5,3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{
                    duration: line.id.startsWith("center") ? 1.8 : 1.5,
                    delay: line.delay,
                    ease: "easeOut",
                  }}
                />
              ))}
            </svg>

            {reducedMotion
              ? constellationLines.filter((_, i) => i % 2 === 0).map((line) => (
                  <motion.div
                    key={`star-${line.id}`}
                    className="absolute rounded-full"
                    style={{
                      left: `${(line.x1 + line.x2) / 2}%`,
                      top: `${(line.y1 + line.y2) / 2}%`,
                      transform: "translate(-50%, -50%)",
                      background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(147,197,253,0.6) 40%, transparent 80%)",
                      width: "12px",
                      height: "12px",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: line.delay + 0.6 }}
                  />
                ))
              : constellationLines.map((line) => (
                  <React.Fragment key={`star-${line.id}`}>
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        left: `${(line.x1 + line.x2) / 2}%`,
                        top: `${(line.y1 + line.y2) / 2}%`,
                        transform: "translate(-50%, -50%)",
                        background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(147,197,253,0.6) 40%, transparent 80%)",
                        width: "12px",
                        height: "12px",
                        willChange: "transform, opacity",
                      }}
                      initial={{ opacity: 0 }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0, 0.9, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: line.delay + 0.6,
                      }}
                    />

                    {[1, 2].map((i) => {
                      const offsetX = Math.random() * 8 - 4;
                      const offsetY = Math.random() * 8 - 4;
                      const size = Math.random() * 3 + 1;
                      return (
                        <motion.div
                          key={`tiny-star-${line.id}-${i}`}
                          className="absolute bg-white rounded-full"
                          style={{
                            left: `${(line.x1 + line.x2) / 2 + offsetX}%`,
                            top: `${(line.y1 + line.y2) / 2 + offsetY}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            boxShadow: `0 0 ${size + 1}px ${size / 2}px rgba(255, 255, 255, 0.8)`,
                            willChange: "transform, opacity",
                          }}
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 0.8, 0.2],
                            scale: [0.8, 1.2, 0.8],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: line.delay + 0.8 + Math.random() * 0.5,
                          }}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}

            {photos.map((photo, index) => {
              const position = photoPositions[index];

              return (
                <div
                  key={index}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: activePhoto === index ? 10 : 2,
                    width: "130px",
                    height: "130px",
                  }}
                >
                  <motion.div
                    className="w-full h-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    style={{ transformOrigin: "center center", willChange: "transform" }}
                    onClick={() => setActivePhoto(activePhoto === index ? null : index)}
                  >
                    <motion.div
                      className="w-full h-full rounded-full overflow-hidden border-2 border-blue-400/50 relative"
                      animate={
                        reducedMotion
                          ? {}
                          : {
                              boxShadow: [
                                "0 0 10px rgba(59, 130, 246, 0.3)",
                                "0 0 20px rgba(59, 130, 246, 0.5)",
                                "0 0 10px rgba(59, 130, 246, 0.3)",
                              ],
                            }
                      }
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{ willChange: reducedMotion ? "auto" : "box-shadow" }}
                    >
                      <img src={photo.url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />

                      {!reducedMotion && (
                        <motion.div
                          className="absolute top-1 right-1 text-yellow-300"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          style={{ willChange: "transform" }}
                        >
                          <Star size={12} fill="currentColor" />
                        </motion.div>
                      )}

                      {!reducedMotion && (
                        <motion.div
                          className="absolute inset-0 rounded-full border border-blue-300/30"
                          style={{ transform: "scale(1.1)", willChange: "transform" }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </motion.div>
                  </motion.div>

                  <AnimatePresence>
                    {activePhoto === index && (
                      <motion.div
                        className="fixed left-1/2 transform -translate-x-1/2 z-30 w-full max-w-[280px] sm:max-w-xs px-3"
                        style={{
                          top: position.y > 50 ? "auto" : undefined,
                          bottom: position.y > 50 ? "20%" : "auto",
                          top: position.y <= 50 ? "60%" : undefined,
                          willChange: "transform, opacity",
                        }}
                        initial={{ opacity: 0, y: -10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-indigo-900/80 backdrop-blur-md rounded-xl p-3 shadow-lg border border-indigo-500/30">
                          <motion.p
                            className="text-blue-100 text-sm text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            {photo.caption}
                          </motion.p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {activePhoto === index && !reducedMotion && (
                    <motion.div
                      className="absolute inset-0 rounded-full -z-10"
                      style={{
                        left: "50%",
                        top: "50%",
                        width: "100%",
                        height: "100%",
                        transform: "translate(-50%, -50%)",
                        willChange: "box-shadow",
                      }}
                      animate={{
                        boxShadow: [
                          "0 0 15px 5px rgba(59, 130, 246, 0.3)",
                          "0 0 25px 10px rgba(59, 130, 246, 0.4)",
                          "0 0 15px 5px rgba(59, 130, 246, 0.3)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
            <motion.div
              className="backdrop-blur-lg bg-gradient-to-br from-indigo-900/40 to-purple-900/30 rounded-2xl border border-indigo-500/30 lg:col-span-2 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {!reducedMotion && (
                <div className="absolute inset-0 overflow-hidden opacity-20">
                  <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-blue-500/20 blur-xl"></div>
                  <div className="absolute bottom-0 right-0 w-60 h-60 rounded-full bg-purple-500/20 blur-xl"></div>

                  {[1, 2].map((i) => (
                    <motion.div
                      key={`playlist-star-${i}`}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        top: `${i * 30}%`,
                        left: `${i * 20 + 10}%`,
                        boxShadow: "0 0 3px 1px rgba(255,255,255,0.5)",
                      }}
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 2 + i, repeat: Infinity }}
                    />
                  ))}
                </div>
              )}

              <motion.div
                className="p-6 relative z-10"
                animate={
                  reducedMotion
                    ? {}
                    : {
                        boxShadow: [
                          "inset 0 0 20px rgba(79, 70, 229, 0.1), 0 0 15px rgba(79, 70, 229, 0.2)",
                          "inset 0 0 30px rgba(79, 70, 229, 0.15), 0 0 25px rgba(79, 70, 229, 0.4)",
                          "inset 0 0 20px rgba(79, 70, 229, 0.1), 0 0 15px rgba(79, 70, 229, 0.2)",
                        ],
                      }
                }
                transition={{ duration: 4, repeat: Infinity }}
              >
                <h3 className="text-2xl font-bold text-blue-100 mb-5 flex items-center">
                  <Music className="mr-3 text-blue-300" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
                    Interstellar Playlist
                  </span>
                </h3>

                <div className="space-y-3">
                  {playlist.map((song, i) => (
                    <motion.div
                      key={i}
                      onClick={() => handleSongClick(i)}
                      className={`flex items-center p-3 rounded-xl transition-all cursor-pointer ${
                        currentSongIndex === i
                          ? "bg-gradient-to-r from-indigo-700/60 to-purple-700/50 border border-blue-400/50"
                          : "hover:bg-indigo-800/40"
                      }`}
                      whileHover={
                        reducedMotion
                          ? {}
                          : {
                              scale: 1.02,
                              backgroundColor: "rgba(79, 70, 229, 0.4)",
                              boxShadow: "0 4px 12px rgba(30, 64, 175, 0.25)",
                            }
                      }
                      whileTap={reducedMotion ? {} : { scale: 0.98 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      style={{ willChange: currentSongIndex === i ? "transform, box-shadow" : "auto" }}
                    >
                      <motion.div
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                        style={{
                          background: "linear-gradient(135deg, #4F46E5, #818CF8)",
                          willChange: currentSongIndex === i ? "box-shadow" : "auto",
                        }}
                        animate={
                          currentSongIndex === i && !reducedMotion
                            ? {
                                boxShadow: [
                                  "0 0 0px rgba(129, 140, 248, 0)",
                                  "0 0 15px rgba(129, 140, 248, 0.8)",
                                  "0 0 0px rgba(129, 140, 248, 0)",
                                ],
                              }
                            : {}
                        }
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {currentSongIndex === i ? (
                          <motion.div className="flex space-x-0.5">
                            {[1, 2].map((bar) => (
                              <motion.div
                                key={bar}
                                className="w-1 h-4 bg-white rounded-sm"
                                animate={{ scaleY: [0.3, 1, 0.3] }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  delay: bar * 0.2,
                                }}
                                style={{ willChange: "transform" }}
                              />
                            ))}
                          </motion.div>
                        ) : (
                          <span className="text-white font-medium">{i + 1}</span>
                        )}
                      </motion.div>

                      <span className="text-blue-50 font-medium">{song}</span>

                      {currentSongIndex === i && (
                        <motion.div
                          className="ml-auto flex items-center text-blue-300"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          style={{ willChange: "opacity" }}
                        >
                          <span className="text-xs mr-1">PLAYING</span>
                          <Sparkles size={14} />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <div className="flex items-center justify-center">
              <div className="relative">
                {!reducedMotion && (
                  <motion.div
                    className="absolute rounded-full blur-3xl"
                    style={{
                      background: "radial-gradient(circle, rgba(129, 140, 248, 0.5) 0%, rgba(79, 70, 229, 0.3) 50%, transparent 80%)",
                      width: "200px",
                      height: "200px",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [0.8, 1, 0.8],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {!reducedMotion && (
                  <>
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        width: "150px",
                        height: "150px",
                        borderWidth: "1px",
                        borderColor: "rgba(147, 197, 253, 0.3)",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        willChange: "transform, opacity",
                      }}
                      animate={{
                        rotate: 360,
                        opacity: [0.2, 0.4, 0.2],
                      }}
                      transition={{
                        rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                        opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                      }}
                    />

                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        width: "120px",
                        height: "120px",
                        borderWidth: "1px",
                        borderColor: "rgba(147, 197, 253, 0.4)",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        willChange: "transform",
                      }}
                      animate={{
                        rotate: -360,
                        scale: [0.95, 1.05, 0.95],
                      }}
                      transition={{
                        rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                        scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                      }}
                    />
                  </>
                )}

                <motion.div
                  className="absolute rounded-full blur-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(167, 139, 250, 0.4))",
                    width: "100px",
                    height: "100px",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={
                    reducedMotion
                      ? {}
                      : {
                          opacity: [0.4, 0.7, 0.4],
                          scale: [0.9, 1.1, 0.9],
                        }
                  }
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <motion.button
                  className="relative rounded-full text-lg font-bold text-white shadow-2xl overflow-hidden"
                  style={{
                    width: "140px",
                    height: "140px",
                    willChange: "transform",
                  }}
                  whileHover={
                    reducedMotion
                      ? {}
                      : {
                          scale: 1.05,
                          boxShadow: "0 0 30px rgba(79, 70, 229, 0.7)",
                          textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
                        }
                  }
                  whileTap={{ scale: 0.98 }}
                  onClick={onComplete}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to right, rgba(79, 70, 229, 1), rgba(91, 33, 182, 1))",
                    }}
                    animate={
                      reducedMotion
                        ? {}
                        : {
                            background: [
                              "linear-gradient(to right, rgba(79, 70, 229, 1), rgba(91, 33, 182, 1))",
                              "linear-gradient(to right, rgba(67, 56, 202, 1), rgba(99, 102, 241, 1))",
                              "linear-gradient(to right, rgba(79, 70, 229, 1), rgba(91, 33, 182, 1))",
                            ],
                          }
                    }
                    transition={{ duration: 5, repeat: Infinity }}
                  />

                  {!reducedMotion && (
                    <motion.div
                      className="absolute inset-0 opacity-70"
                      style={{
                        background: "radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.3) 80%)",
                      }}
                      animate={{
                        opacity: [0.5, 0.7, 0.5],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  )}

                  {!reducedMotion &&
                    [1, 2, 3].map((i) => (
                      <motion.div
                        key={`btn-particle-${i}`}
                        className="absolute w-1 h-1 bg-blue-200 rounded-full"
                        style={{
                          top: `${30 + Math.random() * 40}%`,
                          left: `${30 + Math.random() * 40}%`,
                        }}
                        animate={{
                          y: [-10, 10, -10],
                          opacity: [0, 0.8, 0],
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Globe className="w-6 h-6 mb-2" />
                    <span>Continue</span>
                    <span>Journey</span>
                    {!reducedMotion && (
                      <motion.div
                        animate={{
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Sparkles className="w-4 h-4 mt-2" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PhotoGallery;
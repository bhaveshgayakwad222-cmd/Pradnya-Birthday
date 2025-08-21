import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Music2 } from 'lucide-react';
import { Room } from './components/Room';
import { CakeCeremony } from './components/CakeCeremony';
import { FinalMessage } from './components/FinalMessage';
import { PhotoGallery } from './components/PhotoGallery';
import Intro from './components/Intro';
import bgMusic from './components/music/huahain.mp3';

function App() {
  const audioRef = useRef(new Audio(bgMusic));
  const [stage, setStage] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);

  const stopBgMusic = () => {
    setIsMusicPlaying(false);
  };

  const toggleMusic = (e) => {
    e.stopPropagation();
    setIsMusicPlaying(prev => !prev);
  };

  // Background ambient music component
  const BgMusic = () => {
    React.useEffect(() => {
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
      }
      
      if (isMusicPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => console.error('Audio playback failed:', error));
        }
      } else {
        audioRef.current.pause();
      }
      
      return () => {
        audioRef.current.pause();
      };
    }, [isMusicPlaying]);
    
    return null;
  };

  const renderStage = () => {
    switch (stage) {
      case 0:
        return <Intro 
          onComplete={() => {
            setStage(1);
            setIsLightOn(true);
          }} 
          audioRef={audioRef}
          isMusicPlaying={isMusicPlaying}
          setIsMusicPlaying={setIsMusicPlaying}
        />;
      case 1:
        return <Room isLightOn={isLightOn} onComplete={() => setStage(2)} />;
      case 2:
        return <CakeCeremony onComplete={() => setStage(3)} />;
      case 3:
        return (
          <PhotoGallery 
            onComplete={() => setStage(4)} 
            stopBgMusic={stopBgMusic}
          />
        );
      case 4:
        return <FinalMessage />;
      default:
        return null;
    }
  };

  return (
    <div className="relative" style={{ fontFamily: 'Comic Neue, Comic Sans MS, cursive' }}>
      {/* Music Toggle Button */}
      <motion.button
        className="fixed top-5 right-5 z-50 bg-white/80 backdrop-blur rounded-full p-3 shadow-lg border border-gray-200"
        whileHover={{ 
          scale: 1.1,
          rotate: [0, 10, -10, 0],
          backgroundColor: isMusicPlaying ? '#FFEEAD' : '#FF6F69'
        }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleMusic}
        animate={{ 
          backgroundColor: isMusicPlaying ? '#FF6F69' : '#FFFFFF',
          color: isMusicPlaying ? '#FFFFFF' : '#FF6F69'
        }}
      >
        {isMusicPlaying ? <Music2 size={24} /> : <Music size={24} />}
      </motion.button>

      <BgMusic />
      <AnimatePresence mode="wait">{renderStage()}</AnimatePresence>
    </div>
  );
}

export default App;
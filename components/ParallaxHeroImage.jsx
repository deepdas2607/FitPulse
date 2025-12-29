import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';

const ParallaxHeroImage = ({ children, className = "" }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Small movement range (12px)
  const moveX = useTransform(x, [0, window.innerWidth], [-12, 12]);
  const moveY = useTransform(y, [0, window.innerHeight], [-12, 12]);

  useEffect(() => {
    const handleMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [x, y]);

  return (
    <motion.div style={{ x: moveX, y: moveY }} className={className}>
      {children}
    </motion.div>
  );
};

export default ParallaxHeroImage;
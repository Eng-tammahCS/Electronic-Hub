import React from 'react';
import { motion } from 'framer-motion';

// Animated Login Background Component
export const LoginBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Primary gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.5, 0.2],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
      />

      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -120],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Geometric shapes */}
      <motion.div
        className="absolute top-20 right-20 w-20 h-20 border border-purple-400/30 rotate-45"
        animate={{
          rotate: [45, 135, 45],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-32 left-16 w-16 h-16 border border-cyan-400/30 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </div>
  );
};

// Animated Logo Component
export const AnimatedLogo: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  showGlow?: boolean;
}> = ({ size = 'md', showGlow = true }) => {
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-24 w-24'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  return (
    <motion.div
      className="flex justify-center"
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="relative">
        {showGlow && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-xl opacity-50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        <div className={`relative flex ${sizeClasses[size]} items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 shadow-2xl`}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <svg
              className={`${iconSizes[size]} text-white`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Typing Animation Component
export const TypingAnimation: React.FC<{
  text: string;
  className?: string;
  speed?: number;
}> = ({ text, className = "", speed = 100 }) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-current ml-1"
      />
    </span>
  );
};

// Connection Status Component
export const ConnectionStatus: React.FC<{
  isOnline: boolean;
  className?: string;
}> = ({ isOnline, className = "" }) => {
  return (
    <motion.div
      className={`flex items-center justify-center gap-2 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{
          scale: isOnline ? [1, 1.2, 1] : 1,
          rotate: isOnline ? [0, 10, -10, 0] : 0
        }}
        transition={{
          duration: 2,
          repeat: isOnline ? Infinity : 0
        }}
      >
        {isOnline ? (
          <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg shadow-green-400/50" />
        ) : (
          <div className="w-3 h-3 bg-red-400 rounded-full shadow-lg shadow-red-400/50" />
        )}
      </motion.div>
      <span className={`text-sm font-medium ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
        {isOnline ? 'متصل بالإنترنت' : 'غير متصل'}
      </span>
    </motion.div>
  );
};

// Enhanced Form Field Component
export const AnimatedFormField: React.FC<{
  children: React.ReactNode;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}> = ({ children, delay = 0, direction = 'up' }) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -30, y: 0 };
      case 'right': return { x: 30, y: 0 };
      case 'up': return { x: 0, y: 20 };
      case 'down': return { x: 0, y: -20 };
      default: return { x: 0, y: 20 };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }}
    >
      {children}
    </motion.div>
  );
};

export default LoginBackground;

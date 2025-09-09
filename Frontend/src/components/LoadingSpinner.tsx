import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'pulse' | 'bounce' | 'gradient';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
  variant = 'default'
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'pulse':
        return (
          <motion.div
            className={cn(
              'rounded-full bg-primary',
              sizeClasses[size]
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        );

      case 'bounce':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  'rounded-full bg-primary',
                  size === 'sm' ? 'h-2 w-2' :
                  size === 'md' ? 'h-3 w-3' :
                  size === 'lg' ? 'h-4 w-4' : 'h-5 w-5'
                )}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        );

      case 'gradient':
        return (
          <motion.div
            className={cn(
              'rounded-full border-4 border-transparent bg-gradient-to-r from-primary via-secondary to-accent',
              sizeClasses[size]
            )}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)',
              backgroundClip: 'padding-box',
              borderRadius: '50%'
            }}
          />
        );

      default:
        return (
          <motion.div
            className={cn(
              'rounded-full border-2 border-muted border-t-primary',
              sizeClasses[size]
            )}
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        );
    }
  };

  return (
    <motion.div
      className={cn('flex flex-col items-center justify-center', className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {renderSpinner()}
      {text && (
        <motion.p
          className="mt-3 text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};

// Full screen loading spinner with backdrop blur
export const FullScreenLoading: React.FC<{ text?: string; variant?: LoadingSpinnerProps['variant'] }> = ({
  text,
  variant = 'gradient'
}) => {
  return (
    <motion.div
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <LoadingSpinner size="xl" text={text} variant={variant} />
      </motion.div>
    </motion.div>
  );
};

// Inline loading spinner
export const InlineLoading: React.FC<{ text?: string; variant?: LoadingSpinnerProps['variant'] }> = ({
  text,
  variant = 'default'
}) => {
  return <LoadingSpinner size="sm" text={text} variant={variant} />;
};

export default LoadingSpinner;

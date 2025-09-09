import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  whileHover?: any;
  initial?: any;
  animate?: any;
  transition?: any;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  delay = 0,
  hover = true,
  whileHover,
  initial,
  animate,
  transition,
  ...props
}) => {
  const defaultInitial = { opacity: 0, y: 20 };
  const defaultAnimate = { opacity: 1, y: 0 };
  const defaultTransition = {
    duration: 0.5,
    delay,
    ease: "easeOut"
  };

  const defaultHover = hover ? {
    scale: 1.02,
    y: -5,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  } : {};

  return (
    <motion.div
      className={cn("", className)}
      initial={initial || defaultInitial}
      animate={animate || defaultAnimate}
      transition={transition || defaultTransition}
      whileHover={whileHover || defaultHover}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated Card with built-in Card component
interface AnimatedCardWrapperProps extends AnimatedCardProps {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  cardClassName?: string;
}

export const AnimatedCardWrapper: React.FC<AnimatedCardWrapperProps> = ({
  children,
  title,
  description,
  footer,
  cardClassName,
  ...animatedProps
}) => {
  return (
    <AnimatedCard {...animatedProps}>
      <Card className={cn("h-full", cardClassName)}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className="flex-1">
          {children}
        </CardContent>
        {footer && <CardFooter>{footer}</CardFooter>}
      </Card>
    </AnimatedCard>
  );
};

// Staggered animation for lists
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className, staggerDelay = 0.1 }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * staggerDelay,
            ease: "easeOut"
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Page transition wrapper
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.6,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Floating animation for icons
export const FloatingIcon: React.FC<{
  children: React.ReactNode;
  className?: string;
  duration?: number;
}> = ({ children, className, duration = 3 }) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-5, 5, -5],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Pulse animation for notifications/badges
export const PulseBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
  color?: string;
}> = ({ children, className, color = "primary" }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full opacity-20",
          color === "primary" && "bg-primary",
          color === "secondary" && "bg-secondary",
          color === "destructive" && "bg-destructive"
        )}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      {children}
    </motion.div>
  );
};

export default AnimatedCard;

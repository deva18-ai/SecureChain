import { useState, useEffect, ReactNode, useRef } from 'react';
import { cn } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const pageTransition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const };

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={cn('animate-in', className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className, delay = 0.1 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { transition: { staggerChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, delay = 0, duration = 0.3, className }: { children: ReactNode; delay?: number; duration?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ children, delay = 0, distance = 20, duration = 0.4, className }: { children: ReactNode; delay?: number; distance?: number; duration?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({ children, direction = 'left', delay = 0, duration = 0.4, className }: { children: ReactNode; direction?: 'left' | 'right' | 'top' | 'bottom'; delay?: number; duration?: number; className?: string }) {
  const directions = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    top: { x: 0, y: -50 },
    bottom: { x: 0, y: 50 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, duration = 0.2, className }: { children: ReactNode; delay?: number; duration?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ListTransition({ children, className, stagger = 0.05 }: { children: ReactNode; className?: string; stagger?: number }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.ul
        initial="hidden"
        animate="show"
        exit="exit"
        variants={{
          hidden: { opacity: 0 },
          show: { transition: { staggerChildren: stagger } },
          exit: { transition: { staggerChildren: stagger, staggerDirection: -1 } },
        }}
        className={className}
      >
        {children}
      </motion.ul>
    </AnimatePresence>
  );
}

export function ListItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
      }}
      className={className}
    >
      {children}
    </motion.li>
  );
}

interface HoverLiftProps {
  children: ReactNode;
  height?: number;
  className?: string;
}

export function HoverLift({ children, height = 8, className }: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: -height, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={cn('transition-shadow duration-200', className)}
    >
      {children}
    </motion.div>
  );
}

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function HoverScale({ children, scale = 1.02, className }: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RippleProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function Ripple({ children, color = 'rgba(34, 211, 238, 0.3)', className }: RippleProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const id = Date.now();
    setRipples(prev => [...prev, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id,
    }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  };

  return (
    <div ref={containerRef} onClick={handleClick} className={cn('relative overflow-hidden', className)}>
      {children}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            borderRadius: '50%',
            backgroundColor: color,
            transformOrigin: 'center',
            pointerEvents: 'none',
          }}
        />
      ))}
    </div>
  );
}


interface ShimmerProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Shimmer({ className, width = '100%', height = '100%' }: ShimmerProps) {
  return (
    <div
      className={cn('relative overflow-hidden bg-cyber-elevated', className)}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-primary/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY - rect.top;
      setOffset(scrolled * speed);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <motion.div
        style={{ transform: `translateY(${offset}px)` }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

interface RevealOnScrollProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  className?: string;
}

export function RevealOnScroll({
  children,
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  className,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface CounterProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  onComplete?: () => void;
}

export function Counter({ end, start = 0, duration = 2, decimals = 0, prefix = '', suffix = '', className, onComplete }: CounterProps) {
  const [count, setCount] = useState(start);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(start + (end - start) * eased));
            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
              onComplete?.();
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, start, duration, hasAnimated, onComplete]);

  return (
    <div ref={ref} className={cn('font-heading font-bold tabular-nums', className)}>
      {prefix}{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </div>
  );
}

export function TabTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AnimatePresence mode="wait">
      <div className={className}>
        {children}
      </div>
    </AnimatePresence>
  );
}

export function ModalTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }}
      className={cn('fixed inset-0 z-50 flex items-center justify-center p-4', className)}
    >
      <motion.div
        className="bg-cyber-panel rounded-2xl shadow-2xl border border-cyber-border w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function TooltipTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.15 }}
      className={cn('absolute z-50', className)}
    >
      {children}
    </motion.div>
  );
}

export function DropdownTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className={cn('absolute z-50', className)}
    >
      {children}
    </motion.div>
  );
}

export function TabsTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function AccordionTransition({ children, isOpen, className }: { children: ReactNode; isOpen: boolean; className?: string }) {
  return (
    <motion.div
      initial={false}
      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }}
      className={cn('overflow-hidden', className)}
    >
      {children}
    </motion.div>
  );
}
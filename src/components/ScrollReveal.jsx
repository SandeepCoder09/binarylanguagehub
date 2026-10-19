import { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal — Efficient IntersectionObserver wrapper for scroll-triggered hacker entrance animations.
 *
 * Props:
 *  - children: ReactNode
 *  - className: additional classes
 *  - variant: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale'
 *  - delay: delay in ms (for staggered items)
 *  - threshold: IntersectionObserver threshold (default 0.12)
 *  - as: HTML element to render (default 'div')
 */
export default function ScrollReveal({
  children,
  className = '',
  variant = 'fade-up',
  delay = 0,
  threshold = 0.12,
  as: Component = 'div',
  ...props
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If user prefers reduced motion, reveal immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node); // Free resources once visible
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  const style = delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <Component
      ref={ref}
      className={`reveal-box reveal-${variant} ${isVisible ? 'revealed' : ''} ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}

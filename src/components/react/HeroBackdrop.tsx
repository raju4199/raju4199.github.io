import { useEffect, useRef, useState } from 'react';
import LetterGlitch from '@/components/reactbits/LetterGlitch';
import { useIsDark } from './useTheme';

const PALETTES = {
  dark: ['#123524', '#3ee08a', '#1f6f8b', '#0e2a1d'],
  light: ['#cfe8da', '#7fcca2', '#a6d9e6', '#e3efe8'],
};

/**
 * Animated glyph field behind the hero. Theme-aware, paused while off-screen,
 * and replaced by nothing for visitors who prefer reduced motion.
 */
export default function HeroBackdrop() {
  const isDark = useIsDark();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const onChange = () => setReduced(media.matches);
    media.addEventListener('change', onChange);

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (ref.current) observer.observe(ref.current);
    return () => {
      media.removeEventListener('change', onChange);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0" aria-hidden="true">
      {visible && !reduced && (
        <LetterGlitch
          key={isDark ? 'dark' : 'light'}
          glitchColors={isDark ? PALETTES.dark : PALETTES.light}
          glitchSpeed={70}
          centerVignette={false}
          outerVignette={false}
          smooth
          backgroundColor="transparent"
          characters="ABCDEF0123456789{}[]<>/\\$#%&*=+-_:;.01"
        />
      )}
    </div>
  );
}

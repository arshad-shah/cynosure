import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { cn } from '../../utils/cn.js';
import {
  carouselContainer,
  carouselDot,
  carouselDots,
  carouselNext,
  carouselPrev,
  carouselRoot,
  carouselSlide,
  carouselViewport,
} from './Carousel.css.js';

type EmblaApi = UseEmblaCarouselType[1];
type EmblaOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;
type EmblaPlugins = Parameters<typeof useEmblaCarousel>[1];

export type CarouselOrientation = 'horizontal' | 'vertical';

interface CarouselContextValue {
  carouselRef: UseEmblaCarouselType[0];
  api: EmblaApi;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  slideCount: number;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  orientation: CarouselOrientation;
  slidesPerView: number;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel(): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) {
    throw new Error('Carousel primitives must be rendered inside <Carousel>.');
  }
  return ctx;
}

/** Props for the {@link Carousel} root that configures the underlying Embla engine. */
export interface CarouselProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /**
   * How many slides fit in the viewport. `1` is a classic full-bleed carousel;
   * larger values create a "peek" layout for gallery/card decks.
   * Accepts a number or a responsive `{ base, sm, md, lg, xl }` object.
   * @default 1
   */
  slidesPerView?: number | ResponsiveSlides;
  /**
   * Scroll axis. `horizontal` maps to Embla's `x` axis, `vertical` to `y`.
   * @default "horizontal"
   */
  orientation?: CarouselOrientation;
  /**
   * Loop back to the first slide after the last (and vice versa).
   * @default false
   */
  loop?: boolean;
  /**
   * Where each slide snaps inside the viewport.
   * @default "start"
   */
  align?: 'start' | 'center' | 'end';
  /**
   * How many slides advance per next/prev. `auto` snaps a full viewport's
   * worth at a time.
   * @default 1
   */
  slidesToScroll?: number | 'auto';
  /**
   * Enable drag-to-scroll via pointer/touch.
   * @default true
   */
  draggable?: boolean;
  /** Full Embla options bag — overrides any of the convenience props above. */
  options?: EmblaOptions;
  /** Embla plugins (autoplay, auto-scroll, class-name toggle, etc.). */
  plugins?: EmblaPlugins;
  /** Fires once Embla initialises with the live API; use to drive external UI. */
  setApi?: (api: EmblaApi) => void;
  /** Fires whenever the selected slide index changes (initial + on user/programmatic scroll). */
  onSelect?: (index: number) => void;
  /** Carousel parts ({@link CarouselViewport}, controls, dots, …). */
  children?: ReactNode;
}

/** Responsive `slidesPerView` map — each key maps to the matching cynosure breakpoint. */
export type ResponsiveSlides = {
  /** Default slide count below the `sm` breakpoint. */
  base?: number;
  /** Override at the `sm` breakpoint. */
  sm?: number;
  /** Override at the `md` breakpoint. */
  md?: number;
  /** Override at the `lg` breakpoint. */
  lg?: number;
  /** Override at the `xl` breakpoint. */
  xl?: number;
};

/**
 * Carousel root. Wraps Embla and exposes the API (plus derived state like
 * "can scroll prev/next" and the active index) via context so subcomponents
 * stay declarative. Handles arrow-key navigation on the root section and
 * announces itself via `aria-roledescription="carousel"`. Compose with
 * `CarouselViewport`, `CarouselContainer`, `CarouselSlide`,
 * `CarouselPrevious`, `CarouselNext`, and `CarouselDots`.
 */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(function Carousel(
  {
    slidesPerView = 1,
    orientation = 'horizontal',
    loop = false,
    align = 'start',
    slidesToScroll = 1,
    draggable = true,
    options,
    plugins,
    setApi,
    onSelect,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      axis: orientation === 'vertical' ? 'y' : 'x',
      loop,
      align,
      slidesToScroll,
      watchDrag: draggable,
      ...options,
    },
    plugins,
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);
  const scrollTo = useCallback((i: number) => api?.scrollTo(i), [api]);

  useEffect(() => {
    if (!api) return;
    const onReselect = (): void => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setSelectedIndex(api.selectedScrollSnap());
      setSlideCount(api.scrollSnapList().length);
      onSelect?.(api.selectedScrollSnap());
    };
    onReselect();
    api.on('reInit', onReselect);
    api.on('select', onReselect);
    return () => {
      api.off('reInit', onReselect);
      api.off('select', onReselect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    if (!api) return;
    setApi?.(api);
  }, [api, setApi]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (orientation === 'horizontal') {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    } else {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        scrollNext();
      }
    }
  };

  const flexBasisVars = useMemo<CSSProperties>(() => {
    if (typeof slidesPerView === 'number') {
      return { ['--cynosure-carousel-slides' as string]: String(slidesPerView) };
    }
    const r = slidesPerView;
    return {
      ['--cynosure-carousel-slides' as string]: String(r.base ?? 1),
      ['--cynosure-carousel-slides-sm' as string]: r.sm != null ? String(r.sm) : undefined,
      ['--cynosure-carousel-slides-md' as string]: r.md != null ? String(r.md) : undefined,
      ['--cynosure-carousel-slides-lg' as string]: r.lg != null ? String(r.lg) : undefined,
      ['--cynosure-carousel-slides-xl' as string]: r.xl != null ? String(r.xl) : undefined,
    };
  }, [slidesPerView]);

  const context: CarouselContextValue = {
    carouselRef,
    api,
    canScrollPrev,
    canScrollNext,
    selectedIndex,
    slideCount,
    scrollPrev,
    scrollNext,
    scrollTo,
    orientation,
    slidesPerView: typeof slidesPerView === 'number' ? slidesPerView : 1,
  };

  return (
    <CarouselContext.Provider value={context}>
      <section
        ref={ref as React.Ref<HTMLElement>}
        className={cn(carouselRoot, className)}
        style={{ ...flexBasisVars, ...style }}
        data-orientation={orientation}
        aria-roledescription="carousel"
        onKeyDown={onKeyDown}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
});

/** Props for the {@link CarouselViewport} overflow-clip window. */
export interface CarouselViewportProps extends HTMLAttributes<HTMLDivElement> {}

/** Overflow-clip window. Parent of `CarouselContainer`. */
export const CarouselViewport = forwardRef<HTMLDivElement, CarouselViewportProps>(
  function CarouselViewport({ className, children, ...rest }, ref) {
    const { carouselRef } = useCarousel();
    return (
      <div
        ref={(node) => {
          carouselRef(node);
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(carouselViewport, className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

/** Props for the {@link CarouselContainer} flex track that holds slides. */
export interface CarouselContainerProps extends HTMLAttributes<HTMLDivElement> {}

/** Flex track that holds slides. */
export const CarouselContainer = forwardRef<HTMLDivElement, CarouselContainerProps>(
  function CarouselContainer({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(carouselContainer, className)} {...rest} />;
  },
);

/** Props for a single {@link CarouselSlide}; renders with `role="group"` / `aria-roledescription="slide"`. */
export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {}

/** One slide. Drop images, cards, or any content inside. */
export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(function CarouselSlide(
  { className, style, ...rest },
  ref,
) {
  const { slidesPerView } = useCarousel();
  const basis =
    slidesPerView > 1 ? `calc(100% / var(--cynosure-carousel-slides, ${slidesPerView}))` : '100%';
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(carouselSlide, className)}
      style={{ flex: `0 0 ${basis}`, ...style }}
      {...rest}
    />
  );
});

/** Shared props for {@link CarouselPrevious} and {@link CarouselNext} controls. */
export interface CarouselControlProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Override the default chevron icon (renders Lucide `ChevronLeft`/`ChevronRight` at 18px). */
  icon?: ReactNode;
}

/** Previous-slide button. Positioned on the left edge (top in vertical mode). */
export const CarouselPrevious = forwardRef<HTMLButtonElement, CarouselControlProps>(
  function CarouselPrevious({ className, icon, ...rest }, ref) {
    const { canScrollPrev, scrollPrev, orientation } = useCarousel();
    return (
      <button
        ref={ref}
        type="button"
        disabled={!canScrollPrev}
        className={cn(carouselPrev, className)}
        onClick={scrollPrev}
        aria-label={orientation === 'vertical' ? 'Previous slide (up)' : 'Previous slide'}
        {...rest}
      >
        {icon ?? <ChevronLeft size={18} strokeWidth={2.25} aria-hidden />}
      </button>
    );
  },
);

/** Next-slide button. Positioned on the right edge (bottom in vertical mode). */
export const CarouselNext = forwardRef<HTMLButtonElement, CarouselControlProps>(
  function CarouselNext({ className, icon, ...rest }, ref) {
    const { canScrollNext, scrollNext, orientation } = useCarousel();
    return (
      <button
        ref={ref}
        type="button"
        disabled={!canScrollNext}
        className={cn(carouselNext, className)}
        onClick={scrollNext}
        aria-label={orientation === 'vertical' ? 'Next slide (down)' : 'Next slide'}
        {...rest}
      >
        {icon ?? <ChevronRight size={18} strokeWidth={2.25} aria-hidden />}
      </button>
    );
  },
);

/** Props for the {@link CarouselDots} pagination strip. */
export interface CarouselDotsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Custom `aria-label` renderer per dot. Receives the 0-based index.
   * @default index => `Go to slide ${index + 1}`
   */
  dotLabel?: (index: number) => string;
}

/** Pagination dots — one per slide snap. Click a dot to jump. */
export const CarouselDots = forwardRef<HTMLDivElement, CarouselDotsProps>(function CarouselDots(
  { className, dotLabel, ...rest },
  ref,
) {
  const { slideCount, selectedIndex, scrollTo } = useCarousel();
  if (slideCount <= 1) return null;
  return (
    <div ref={ref} className={cn(carouselDots, className)} role="tablist" {...rest}>
      {Array.from({ length: slideCount }, (_, i) => i).map((i) => (
        <button
          key={`carousel-dot-${i}`}
          type="button"
          role="tab"
          aria-selected={i === selectedIndex}
          aria-label={dotLabel?.(i) ?? `Go to slide ${i + 1}`}
          data-active={i === selectedIndex || undefined}
          className={carouselDot}
          onClick={() => scrollTo(i)}
        />
      ))}
    </div>
  );
});

export { useCarousel };
export type { EmblaApi };

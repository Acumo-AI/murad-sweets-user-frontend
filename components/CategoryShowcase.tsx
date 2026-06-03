'use client';

import Image from 'next/image';

type ShowcaseItem = {
  id: string;
  num: string;
  title: string;
  feature: string;
  description: string;
  tags: string[];
  image: string;
  imageAlt: string;
  bgColor: string;
  textAccent: string;
};

const items: ShowcaseItem[] = [
  {
    id: 'dry-sweets',
    num: '01',
    title: 'Dry Sweets',
    feature: 'KALOJAM',
    description:
      'Classic dry sweets made with the finest ingredients and traditional Bangladeshi recipes.',
    tags: ['Kalojam', 'Cham Cham', 'Rasmalai', 'Sandesh'],
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'Assorted Bangladeshi dry sweets',
    bgColor: '#6B1A27',
    textAccent: '#c97d4e',
  },
  {
    id: 'specialty',
    num: '02',
    title: 'Specialty Items',
    feature: 'RASMALAI CAKE',
    description:
      'Unique creations and fusion delights crafted for special moments.',
    tags: ['Rasmalai Cake', 'Malai Roll', 'Chocolate Sandesh', 'Kheer Kadam'],
    image: 'https://images.unsplash.com/photo-1601356616077-695728ecf769?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'Rasmalai cake and specialty mithai',
    bgColor: '#8B3A22',
    textAccent: '#c97d4e',
  },
  {
    id: 'party-trays',
    num: '03',
    title: 'Party Trays',
    feature: 'FESTIVE ASSORTMENTS',
    description:
      'Perfect assortments for parties, events and celebrations.',
    tags: ['Mini Sweets Box', 'Mix Sweet Tray', 'Premium Platter', 'Gift Hampers'],
    image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'Festive party tray of assorted sweets',
    bgColor: '#9B4128',
    textAccent: '#c97d4e',
  },
  {
    id: 'pitha',
    num: '04',
    title: 'Traditional Pitha',
    feature: 'PATISAPTA & BHAPA',
    description:
      'Traditional Bangladeshi pitha made with heritage recipes.',
    tags: ['Patisapta', 'Bhapa Pitha', 'Chitoi Pitha', 'Dudh Puli'],
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
    imageAlt: 'Traditional Bengali pitha',
    bgColor: '#6B1A27',
    textAccent: '#c97d4e',
  },
];

const footerFeatures = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.5 3-5 4-5 8a5 5 0 0010 0c0-4-3.5-5-5-8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v2a3 3 0 006 0v-2" />
      </svg>
    ),
    label: 'Premium\nIngredients',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6 2 3 7 3 12s3 10 9 10 9-5 9-10S18 2 12 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12s1-2 4-2 4 2 4 2" />
      </svg>
    ),
    label: 'Freshly\nMade',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21C7 21 3 17 3 12S7 3 12 3s9 4 9 9-4 9-9 9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2 2 5-5" />
      </svg>
    ),
    label: 'Hygienically\nPrepared',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 8V6a4 4 0 018 0v2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 13v3" />
      </svg>
    ),
    label: 'Perfect for\nEvery Occasion',
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 shrink-0" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="8" r="6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8.5l2 2 4-4" />
    </svg>
  );
}

function ShowcaseCard({ item, index }: { item: ShowcaseItem; index: number }) {
  const imageLeft = index % 2 === 0;

  // Outer container radius
  const cardRadius = imageLeft
    ? 'rounded-[40px] md:rounded-[0px] md:[border-radius:60px_20px_20px_60px]'
    : 'rounded-[40px] md:rounded-[0px] md:[border-radius:20px_60px_60px_20px]';

  // Inner image container radius for the framed effect
  const innerImageRadius = imageLeft
    ? 'rounded-[32px] md:rounded-[0px] md:[border-radius:48px_12px_12px_48px]'
    : 'rounded-[32px] md:rounded-[0px] md:[border-radius:12px_48px_48px_12px]';

  // Inner text decorative frame radius
  const innerTextRadius = imageLeft
    ? 'rounded-[32px] md:rounded-[0px] md:[border-radius:12px_48px_48px_12px]'
    : 'rounded-[32px] md:rounded-[0px] md:[border-radius:48px_12px_12px_48px]';

  return (
    <article
      className={`group flex flex-col ${imageLeft ? 'md:flex-row' : 'md:flex-row-reverse'} shadow-xl ${cardRadius} p-2 sm:p-3 md:p-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative`}
      style={{
        backgroundColor: item.bgColor,
      }}
    >
      {/* Accent border overlay behind the card for a fun pop */}
      <div 
        className={`absolute inset-0 border-2 pointer-events-none ${cardRadius} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        style={{ borderColor: item.textAccent, transform: 'scale(1.02)' }}
      />

      {/* Image half */}
      <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[420px]">
        <div className={`absolute inset-0 overflow-hidden ${innerImageRadius}`}>
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-100 group-hover:opacity-50"
            style={{
              background: imageLeft
                ? 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.3) 100%)'
                : 'linear-gradient(to left, transparent 60%, rgba(0,0,0,0.3) 100%)',
            }}
          />
        </div>
      </div>

      {/* Text half */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-10 md:px-14 md:py-12 relative overflow-hidden">
        
        {/* Subtle decorative inner border */}
        <div 
          className={`absolute inset-3 md:inset-4 border border-white/15 pointer-events-none ${innerTextRadius} opacity-50 group-hover:opacity-100 group-hover:border-white/30 transition-all duration-500`}
        />

        {/* Traditional Corner Flourishes */}
        <div className="absolute top-6 right-6 opacity-[0.2] pointer-events-none select-none transition-transform duration-700 group-hover:rotate-90 group-hover:opacity-[0.4]" style={{ color: item.textAccent }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M40 0V40C40 17.9086 22.0914 0 0 0H40Z" fill="currentColor" />
            <circle cx="32" cy="8" r="3" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-6 left-6 opacity-[0.2] pointer-events-none select-none rotate-180 transition-transform duration-700 group-hover:-rotate-90 group-hover:opacity-[0.4]" style={{ color: item.textAccent }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M40 0V40C40 17.9086 22.0914 0 0 0H40Z" fill="currentColor" />
            <circle cx="32" cy="8" r="3" fill="currentColor" />
          </svg>
        </div>

        {/* Dynamic geometric/mandala watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none transition-all duration-1000 group-hover:opacity-[0.08] group-hover:rotate-12 group-hover:scale-110"
        >
          <svg viewBox="0 0 200 200" fill="white" className="w-[120%] h-[120%] max-w-none">
            <path d="M100 0 C120 40 160 20 160 50 C140 70 180 80 180 100 C180 120 140 130 160 150 C160 180 120 160 100 200 C80 160 40 180 40 150 C60 130 20 120 20 100 C20 80 60 70 40 50 C40 20 80 40 100 0 Z" />
            <circle cx="100" cy="100" r="35" stroke="white" strokeWidth="2" fill="none"/>
            <circle cx="100" cy="100" r="20" fill="white"/>
            <path d="M100 35 Q115 65 100 70 Q85 65 100 35" stroke="white" strokeWidth="1" fill="none" />
            <path d="M100 165 Q115 135 100 130 Q85 135 100 165" stroke="white" strokeWidth="1" fill="none" />
            <path d="M35 100 Q65 85 70 100 Q65 115 35 100" stroke="white" strokeWidth="1" fill="none" />
            <path d="M165 100 Q135 85 130 100 Q135 115 165 100" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </div>

        {/* Number */}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <span
            className="text-xl font-heading font-semibold tracking-widest"
            style={{ color: item.textAccent }}
          >
            {item.num}
          </span>
          <span className="w-20 h-px" style={{ backgroundColor: item.textAccent, opacity: 0.6 }} />
        </div>

        {/* Title */}
        <h3
          className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight text-white mb-2 relative z-10"
        >
          {item.title}
        </h3>

        {/* Feature subtitle */}
        <p
          className="text-sm font-subheading font-bold tracking-[0.15em] mb-5 uppercase relative z-10"
          style={{ color: item.textAccent }}
        >
          {item.feature}
        </p>

        {/* Description */}
        <p
          className="text-base md:text-lg leading-relaxed font-body text-white/85 mb-8 max-w-md relative z-10"
        >
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-3 mb-8 relative z-10">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-2 text-sm font-body font-medium text-white/90 border border-white/30 rounded-full px-4 py-1.5"
            >
              <CheckIcon />
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#"
          className="inline-flex items-center gap-2 text-base font-subheading font-semibold text-white/90 hover:text-white transition-colors group w-fit relative z-10"
        >
          Explore Collection
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/40 group-hover:border-white transition-colors text-sm">
            →
          </span>
        </a>
      </div>
    </article>
  );
}

export default function CategoryShowcase() {
  return (
    <section
      className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-transparent"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16 md:mb-20">
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold text-primary-deep leading-tight"
          >
            Our Sweet Collections
          </h2>
          <p
            className="mt-4 text-primary-deep/80 text-base md:text-lg font-body"
          >
            Handcrafted with love, made for every celebration.
          </p>
        </header>

        {/* Cards */}
        <div className="space-y-12 md:space-y-16">
          {items.map((item, index) => (
            <ShowcaseCard key={item.id} item={item} index={index} />
          ))}
        </div>

        {/* Footer feature strip */}
        <div
          className="mt-16 md:mt-20 rounded-3xl grid grid-cols-2 md:grid-cols-4 divide-x divide-primary/20 shadow-md"
          style={{ backgroundColor: 'var(--color-cream)', border: '1px solid var(--color-border)' }}
        >
          {footerFeatures.map((feat, i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-3 py-8 px-4 text-center">
              <span className="text-primary">{feat.icon}</span>
              <span
                className="text-sm font-subheading font-semibold text-primary-deep leading-relaxed whitespace-pre-line uppercase tracking-wide"
              >
                {feat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

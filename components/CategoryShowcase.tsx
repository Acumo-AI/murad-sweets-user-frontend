'use client';

import Link from 'next/link';
import Image from 'next/image';

const PASTRY_TRANSITION =
  'transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]';

type ShowcaseItem = {
  id: string;
  categoryTag: string;
  title: string;
  feature?: string;
  description: string;
  image: string;
  imageAlt: string;
  link: string;
  primaryCta: string;
  secondaryCta?: string;
};

const drySweetsHighlight: ShowcaseItem = {
  id: 'dry-sweets',
  categoryTag: 'Mix & Match',
  title: 'Dry Sweets',
  feature: 'ft. Kalojam & Chom Chom',
  description:
    'Build your custom box of traditional Kalojam, Chom Chom, Laddus, and Shandesh. Choose 3, 6, or 9 pieces — every box is assembled fresh to order.',
  image:
    'https://images.unsplash.com/photo-1605697040924-852290747ef4?w=800&auto=format&fit=crop&q=80',
  imageAlt: 'Assorted Bangladeshi dry sweets',
  link: '/products?category=dry-sweets',
  primaryCta: 'Build Your Box',
  secondaryCta: 'View All Dry Sweets',
};

const specialtyMinimal: ShowcaseItem = {
  id: 'specialty',
  categoryTag: 'Premium Mithai',
  title: 'Specialty Items',
  feature: 'ft. Rasmalai Cake',
  description:
    'Savor our signature Rasmalai Cake, warm Gulab Jamuns, and rich Mishti Doi — fusion desserts and classics prepared in small batches.',
  image:
    'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
  imageAlt: 'Rasmalai cake and specialty mithai',
  link: '/products?category=specialty',
  primaryCta: 'Shop Specialty',
};

const partyTraysHighlight: ShowcaseItem = {
  id: 'party-trays',
  categoryTag: 'Bestseller',
  title: 'Party Trays',
  feature: 'ft. Festive Assortments',
  description:
    'Assorted sweet platters perfect for weddings, Eid, family events, and gatherings. From intimate trays to grand 40-piece presentations.',
  image:
    'https://images.unsplash.com/photo-1601356616077-695728ecf769?w=800&auto=format&fit=crop&q=80',
  imageAlt: 'Festive party tray of assorted sweets',
  link: '/products?category=party-trays',
  primaryCta: 'Order a Tray',
  secondaryCta: 'Tray Sizes & Pricing',
};

const pithaMinimal: ShowcaseItem = {
  id: 'pitha',
  categoryTag: 'Pre-Order Only',
  title: 'Traditional Pitha',
  feature: 'ft. Patishapta & Bhapa',
  description:
    'Steamed and fried crepes, sweet and savory, stuffed with fresh coconut and date gur. Authentic winter cakes — minimum 10 pieces per variety.',
  image:
    'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&auto=format&fit=crop&q=80',
  imageAlt: 'Traditional Bengali pitha',
  link: '/products?category=pitha',
  primaryCta: 'Pre-Order Pitha',
};

function formatDatePillLabel() {
  const now = new Date();
  return now
    .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase();
}

function SweetImage({
  src,
  alt,
  priority = false,
  float = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  float?: boolean;
}) {
  return (
    <div
      className={`relative w-full md:w-1/2 flex items-center justify-center p-4 md:p-6 overflow-visible ${
        float ? 'md:-my-4' : ''
      }`}
    >
      <div
        className={`relative w-full max-w-[280px] sm:max-w-[320px] aspect-square ${PASTRY_TRANSITION} group-hover:scale-[1.08] group-hover:rotate-[4deg] drop-shadow-2xl ${
          float ? 'md:scale-105 md:-translate-y-2' : ''
        }`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-contain"
          sizes="(max-width: 768px) 280px, 320px"
        />
      </div>
    </div>
  );
}

function CategoryTag({
  label,
  variant,
  accentColor,
}: {
  label: string;
  variant: 'white' | 'color';
  accentColor?: string;
}) {
  if (variant === 'color' && accentColor) {
    return (
      <span
        className="inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white"
        style={{ color: accentColor }}
      >
        {label}
      </span>
    );
  }
  return (
    <span className="inline-block bg-[#ff8da1]/10 text-[#ff8da1] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
      {label}
    </span>
  );
}

function TextColumn({
  item,
  variant,
  accentColor,
}: {
  item: ShowcaseItem;
  variant: 'white' | 'color';
  accentColor?: string;
}) {
  const isColor = variant === 'color';

  return (
    <div className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-8 md:px-10 py-8 md:py-10">
      <CategoryTag
        label={item.categoryTag}
        variant={variant}
        accentColor={accentColor}
      />
      <h3
        className={`mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
          isColor ? 'text-white' : 'text-[#1A1A1A]'
        }`}
      >
        {item.title}
        {item.feature && (
          <span
            className={`block mt-1 text-lg sm:text-xl font-medium ${
              isColor ? 'text-white/70' : 'text-gray-400'
            }`}
          >
            {item.feature}
          </span>
        )}
      </h3>
      <p
        className={`text-sm font-medium leading-relaxed mt-4 ${
          isColor ? 'text-white/90' : 'text-gray-500'
        }`}
      >
        {item.description}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        {isColor && item.secondaryCta ? (
          <>
            <Link
              href={item.link}
              className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-white hover:opacity-90 transition-opacity"
              style={{ color: accentColor }}
            >
              {item.primaryCta}
            </Link>
            <Link
              href={item.link}
              className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-2 border-white text-white hover:bg-white/10 transition-colors"
            >
              {item.secondaryCta}
            </Link>
          </>
        ) : (
          <Link
            href={item.link}
            className="text-gray-700 hover:text-[#ff8da1] text-xs font-extrabold uppercase tracking-widest underline decoration-2 underline-offset-4 transition-colors"
          >
            {item.primaryCta}
          </Link>
        )}
      </div>
    </div>
  );
}

function HighlightBlock({
  item,
  bgColor,
  imageSide = 'left',
}: {
  item: ShowcaseItem;
  bgColor: string;
  imageSide?: 'left' | 'right';
}) {
  const image = (
    <SweetImage
      src={item.image}
      alt={item.imageAlt}
      float
      priority={item.id === 'dry-sweets'}
    />
  );
  const text = (
    <TextColumn item={item} variant="color" accentColor={bgColor} />
  );

  return (
    <article
      className={`group flex flex-col md:flex-row rounded-[32px] md:rounded-[40px] shadow-xl overflow-visible ${PASTRY_TRANSITION} hover:-translate-y-1 hover:shadow-2xl`}
      style={{ backgroundColor: bgColor }}
    >
      {imageSide === 'left' ? (
        <>
          {image}
          {text}
        </>
      ) : (
        <>
          {text}
          {image}
        </>
      )}
    </article>
  );
}

function MinimalCard({
  item,
  layout,
}: {
  item: ShowcaseItem;
  layout: 'text-left' | 'image-left';
}) {
  const image = <SweetImage src={item.image} alt={item.imageAlt} />;
  const text = <TextColumn item={item} variant="white" />;

  return (
    <article
      className={`group flex flex-col ${
        layout === 'text-left'
          ? 'flex-col-reverse md:flex-row'
          : 'flex-col md:flex-row'
      } items-center`}
    >
      {layout === 'text-left' ? (
        <>
          {text}
          {image}
        </>
      ) : (
        <>
          {image}
          {text}
        </>
      )}
    </article>
  );
}

export default function CategoryShowcase() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center flex flex-col items-center">
          <span className="bg-[#ff8da1] text-white font-extrabold text-xs uppercase tracking-widest rounded-full px-4 py-1.5">
            {formatDatePillLabel()}
          </span>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#1A1A1A] mt-4">
            Our Sweet Collections
          </h2>
          <p className="text-gray-500 italic text-sm sm:text-base font-medium max-w-md mx-auto mt-4">
            Artisanal Bangladeshi mithai and heritage pitha — scroll through our
            four signature categories and order what speaks to you.
          </p>
        </header>

        {/* Alternating card rhythm */}
        <div className="mt-16 md:mt-24 space-y-24">
          <HighlightBlock
            item={drySweetsHighlight}
            bgColor="#1bc1d9"
            imageSide="left"
          />
          <MinimalCard item={specialtyMinimal} layout="text-left" />
          <HighlightBlock
            item={partyTraysHighlight}
            bgColor="#7e5d8e"
            imageSide="left"
          />
          <MinimalCard item={pithaMinimal} layout="image-left" />
        </div>
      </div>
    </section>
  );
}

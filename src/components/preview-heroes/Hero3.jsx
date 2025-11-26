import { motion } from 'framer-motion'
import { ArrowRight, Play, Phone, Calculator } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import EnhancedStatsCard from '@/components/hero/EnhancedStatsCard'
import TrustBadges from '@/components/hero/TrustBadges'
import { getIconComponent } from '@/utils/iconMap'

const defaultContent = {
  badgeLabel: "UK's Leading Energy Broker",
  headline: 'Cut Your Energy Bills by',
  highlight: {
    value: '23%',
    prefix: '',
    suffix: '',
  },
  subheadline:
    'Join 5,000+ UK businesses saving millions on energy costs. Get a free quote in 2 minutes with no commitment.',
  primaryCta: {
    label: 'Get Free Quote',
    link: '/quote-calculator',
    icon: 'Calculator',
  },
  secondaryCta: {
    label: 'Speak to Expert',
    link: '/contact',
    icon: 'Phone',
  },
  reviewScore: '4.9/5',
  reviewCount: '2,500+',
  recentSignups: '50+',
  showTrustBadges: true,
  background: {
    accentColor: '#3b82f6',
  },
}

function Hero3({ content = {} }) {
  const mergedContent = {
    ...defaultContent,
    ...content,
    highlight: { ...defaultContent.highlight, ...(content?.highlight || {}) },
    primaryCta: { ...defaultContent.primaryCta, ...(content?.primaryCta || {}) },
    secondaryCta: { ...defaultContent.secondaryCta, ...(content?.secondaryCta || {}) },
    background: { ...defaultContent.background, ...(content?.background || {}) },
  }

  const {
    badgeLabel,
    headline,
    highlight,
    subheadline,
    primaryCta,
    secondaryCta,
    reviewScore,
    reviewCount,
    recentSignups,
    showTrustBadges,
    background,
  } = mergedContent

  const PrimaryIcon = getIconComponent(primaryCta.icon, Calculator)
  const SecondaryIcon = getIconComponent(secondaryCta.icon, Phone)

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center">
      {/* Subtle gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, var(--background) 0%, var(--primary-5) 50%, var(--background) 100%)',
        }}
      >
        {/* Decorative elements */}
        <motion.div
          className="absolute top-20 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: 'var(--primary)' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: '#3b82f6' }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-200px)]">
          {/* Left side - Content */}
          <div className="space-y-8">
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                backgroundColor: 'var(--primary-10)',
                color: 'var(--primary)',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
              </span>
              <span className="text-sm font-bold">{badgeLabel}</span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {headline}{' '}
              {highlight?.value && (
                <span
                  className="relative inline-block"
                  style={{ color: 'var(--primary)' }}
                >
                  {highlight?.prefix && <span>{highlight.prefix} </span>}
                  {highlight.value}
                  {highlight?.suffix && <span> {highlight.suffix}</span>}
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="12"
                    viewBox="0 0 200 12"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  >
                    <motion.path
                      d="M 0 8 Q 50 2, 100 8 T 200 8"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </span>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {subheadline}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {primaryCta && (
                <Button
                  asChild
                  size="lg"
                  className="group text-lg px-8 py-7 rounded-xl font-bold border-0 shadow-xl hover:shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-80) 100%)',
                    color: 'white',
                  }}
                >
                  <Link to={primaryCta.link || '#'} className="flex items-center gap-3">
                    <PrimaryIcon size={24} />
                    {primaryCta.label}
                    <ArrowRight
                      size={24}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </Button>
              )}

              {secondaryCta && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-7 rounded-xl font-bold group"
                  style={{
                    borderColor: 'var(--primary)',
                    color: 'var(--primary)',
                  }}
                >
                  <Link to={secondaryCta.link || '#'} className="flex items-center gap-3">
                    <SecondaryIcon size={24} />
                    {secondaryCta.label}
                  </Link>
                </Button>
              )}
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              {/* Reviews */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="text-yellow-400 text-xl"
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    {reviewScore}
                  </span>{' '}
                  from {reviewCount} reviews
                </span>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8" style={{ backgroundColor: 'var(--border)' }} />

              {/* Quick stat */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: 'var(--primary)',
                        borderColor: 'var(--background)',
                        color: 'white',
                      }}
                    >
                      {String.fromCharCode(65 + i)}
                    </motion.div>
                  ))}
                </div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    {recentSignups}
                  </span>{' '}
                  joined this week
                </span>
              </div>
            </motion.div>

            {/* Trust badges */}
            {showTrustBadges && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <TrustBadges />
              </motion.div>
            )}
          </div>

          {/* Right side - Enhanced stats with multiple graphs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <EnhancedStatsCard />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-6 h-10 rounded-full border-2 flex items-start justify-center p-2"
          style={{ borderColor: 'var(--primary)' }}
        >
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--primary)' }}
          />
        </motion.div>
        <span 
          className="text-xs font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          Scroll to explore
        </span>
      </motion.div>
    </section>
  )
}

export default Hero3


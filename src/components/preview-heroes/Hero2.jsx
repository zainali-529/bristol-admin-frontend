import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedBackground from '@/components/hero/AnimatedBackground'
import FloatingBenefitCard from '@/components/hero/FloatingBenefitCard'
import MorphingText from '@/components/hero/MorphingText'
import InstantSavingsCalculator from '@/components/hero/InstantSavingsCalculator'
import LivePriceTicker from '@/components/hero/LivePriceTicker'
import MouseFollower from '@/components/hero/MouseFollower'
import { getIconComponent } from '@/utils/iconMap'

const defaultContent = {
  morphingPhrases: [
    'Save Thousands on Energy',
    'Switch in 2 Minutes',
    'Join 5,000+ Businesses',
    'Cut Bills by 23%',
  ],
  subheadline:
    "Compare energy prices from UK's top suppliers and start saving today. Our expert brokers find you the best deals in minutes.",
  benefitCards: [
    {
      icon: 'TrendingUp',
      title: '23%',
      subtitle: 'Average Savings',
      color: '#10b981',
      delay: 0.2,
      floatOffset: 15,
    },
    {
      icon: 'Clock',
      title: '2 Min',
      subtitle: 'Quick Quote',
      color: '#3b82f6',
      delay: 0.4,
      floatOffset: 20,
    },
    {
      icon: 'Users',
      title: '5,000+',
      subtitle: 'Happy Clients',
      color: '#f97316',
      delay: 0.6,
      floatOffset: 25,
    },
    {
      icon: 'Shield',
      title: '£0',
      subtitle: 'Zero Fees',
      color: 'var(--primary)',
      delay: 0.8,
      floatOffset: 18,
    },
  ],
  stats: [
    { icon: 'TrendingUp', label: 'Average Savings', value: '23%' },
    { icon: 'Users', label: 'Businesses Guided', value: '5,000+' },
    { icon: 'Shield', label: 'Ofgem Guidance', value: 'Fully Compliant' },
  ],
  showLiveTicker: true,
  primaryCta: {
    label: 'Get Instant Quote',
    link: '/quote-calculator',
  },
  secondaryCta: {
    label: 'Talk to an Expert',
    link: '/contact',
  },
}

function Hero2({ content = {} }) {
  const mergedContent = {
    ...defaultContent,
    ...content,
    morphingPhrases: content?.morphingPhrases?.length ? content.morphingPhrases : defaultContent.morphingPhrases,
    benefitCards: content?.benefitCards?.length ? content.benefitCards : defaultContent.benefitCards,
    stats: content?.stats?.length ? content.stats : defaultContent.stats,
    primaryCta: { ...defaultContent.primaryCta, ...(content?.primaryCta || {}) },
    secondaryCta: { ...defaultContent.secondaryCta, ...(content?.secondaryCta || {}) },
  }

  const { morphingPhrases, subheadline, benefitCards, stats, showLiveTicker, primaryCta, secondaryCta } = mergedContent

  return (
    <section className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      <MouseFollower />

      <div className="relative z-10 min-h-screen flex flex-col">
        {showLiveTicker && (
          <div className="w-full border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <LivePriceTicker />
          </div>
        )}

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-8">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                  <MorphingText phrases={morphingPhrases} interval={4000} />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-xl md:text-2xl leading-relaxed max-w-2xl"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {subheadline}
                </motion.p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-12">
                  {benefitCards.map((card, index) => {
                    const Icon = getIconComponent(card.icon)
                    return (
                      <div key={index} className="transform perspective-1000">
                        <FloatingBenefitCard {...card} icon={Icon} />
                      </div>
                    )
                  })}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="flex flex-wrap items-center gap-6 mt-8"
                >
                  {stats.map((stat, index) => {
                    const Icon = getIconComponent(stat.icon)
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                          <Icon size={20} style={{ color: stat.color || 'var(--primary)' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/80">{stat.label}</p>
                          <p className="text-lg font-bold text-white">{stat.value}</p>
                        </div>
                      </div>
                    )
                  })}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 pt-6"
                >
                  {primaryCta && (
                    <Link
                      to={primaryCta.link || '#'}
                      className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-10 py-4 text-lg font-semibold text-white transition-all duration-300 bg-gradient-to-r from-primary-100 to-primary-80 hover:scale-105 hover:shadow-[0_10px_40px_rgba(174,97,58,0.4)]"
                    >
                      {primaryCta.label}
                      <ArrowDown size={18} className="transition-transform duration-300 group-hover:translate-y-1" />
                      <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </Link>
                  )}

                  {secondaryCta && (
                    <Link
                      to={secondaryCta.link || '#'}
                      className="relative inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm"
                    >
                      {secondaryCta.label}
                    </Link>
                  )}
                </motion.div>
              </div>

              <div className="lg:col-span-5">
                <InstantSavingsCalculator />
              </div>
            </div>
          </div>
        </div>

        {showLiveTicker && (
          <div className="mt-auto">
            <LivePriceTicker />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Scroll to explore
            </span>
            <ArrowDown size={24} style={{ color: 'var(--primary)' }} />
          </motion.div>
        </motion.div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--background))',
        }}
      />
    </section>
  )
}

export default Hero2


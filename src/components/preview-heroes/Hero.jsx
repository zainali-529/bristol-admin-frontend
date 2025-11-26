import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDown } from 'lucide-react'

const defaultContent = {
  badgeLabel: "Powering UK's Businesses",
  headline: 'We power your business with the best energy deals',
  subheadline:
    "Orca Business Solutions is a new name, but we're built on real experience. We work with UK businesses to help reduce costs, stay within rules, and plan for better outcomes.",
  primaryCta: {
    label: 'Explore Us',
    link: '/about',
  },
  secondaryCta: {
    label: 'Contact Us',
    link: '/contact',
  },
  background: {
    type: 'video',
    videoUrl: '/videos/hero-bg-video.mp4',
    overlay: false,
    particles: true,
  },
}

function Hero({ content = {} }) {
  const particlesContainerRef = useRef(null)

  const mergedContent = {
    ...defaultContent,
    ...content,
    primaryCta: { ...defaultContent.primaryCta, ...(content?.primaryCta || {}) },
    secondaryCta: { ...defaultContent.secondaryCta, ...(content?.secondaryCta || {}) },
    background: { ...defaultContent.background, ...(content?.background || {}) },
  }

  const { badgeLabel, headline, subheadline, primaryCta, secondaryCta, background } = mergedContent

  useEffect(() => {
    const initParticles = () => {
      if (typeof window !== 'undefined' && window.particlesJS && particlesContainerRef.current) {
        window.particlesJS('particles-js-hero', {
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
                value_area: 800,
          },
          },
            color: { value: '#ffffff' },
          shape: {
            type: 'circle',
              stroke: { width: 0, color: '#000000' },
          },
          opacity: {
            value: 0.7,
            random: false,
              anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false },
          },
          size: {
            value: 3,
            random: true,
              anim: { enable: false, speed: 40, size_min: 0.1, sync: false },
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.4,
              width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
              attract: { enable: false, rotateX: 600, rotateY: 1200 },
            },
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
              onhover: { enable: true, mode: 'repulse' },
              onclick: { enable: true, mode: 'push' },
              resize: true,
          },
          modes: {
              grab: { distance: 400, line_linked: { opacity: 1 } },
              bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
              repulse: { distance: 100 },
              push: { particles_nb: 4 },
              remove: { particles_nb: 2 },
            },
        },
          retina_detect: true,
        })
      }
    }

    if (background?.particles === false) {
      return undefined
    }

    if (typeof window !== 'undefined') {
      if (window.particlesJS) {
        initParticles()
      } else {
        const checkParticles = setInterval(() => {
          if (window.particlesJS) {
            clearInterval(checkParticles)
            initParticles()
          }
        }, 100)

        setTimeout(() => clearInterval(checkParticles), 5000)
      }
    }

    return () => {
      if (particlesContainerRef.current) {
        particlesContainerRef.current.innerHTML = ''
      }
    }
  }, [background?.particles])

  return (
    <section className="px-4 mb-4">
      <div className="relative w-full h-[calc(100vh-100px)] rounded-3xl overflow-hidden shadow-2xl bg-gray-900">
        {background?.type !== 'image' && background?.videoUrl && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1 }}
        >
            <source src={background.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        )}

        {background?.type === 'image' && background?.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ zIndex: 1, backgroundImage: `url(${background.imageUrl})` }}
          />
        )}

        {background?.particles !== false && (
        <div 
          id="particles-js-hero"
          ref={particlesContainerRef}
          className="absolute inset-0 w-full h-full"
          style={{ 
            zIndex: 10, 
            pointerEvents: 'auto',
          }}
        />
        )}

        {background?.overlay && (
          <div className="absolute inset-0 bg-black bg-opacity-40" style={{ zIndex: 2 }}></div>
        )}

        <div 
          className="relative h-full flex flex-col items-center justify-center text-center px-6 md:px-12" 
          style={{ zIndex: 20, pointerEvents: 'none' }}
        >
          {badgeLabel && (
            <div
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide mb-4 px-4 py-2 rounded-full"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: 'white',
              }}
            >
              {badgeLabel}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-black text-white mb-6 max-w-5xl leading-tight pointer-events-none">
            {headline}
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-white opacity-90 mb-10 max-w-3xl pointer-events-none">
            {subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center" style={{ pointerEvents: 'auto' }}>
            {primaryCta && (
              <Link
                to={primaryCta.link || '#'}
              className="relative overflow-hidden rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-0 pr-2 pl-6 py-2.5 group bg-white"
              style={{ color: 'var(--primary)' }}
            >
                <span className="relative z-10 font-semibold">{primaryCta.label}</span>
              <div
                className="ml-3 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:rotate-45"
                style={{ 
                  background: 'linear-gradient(to bottom, var(--primary-100), var(--primary-60))',
                    color: 'white',
                }}
              >
                <ArrowDown size={20} strokeWidth={2.5} />
              </div>
              </Link>
            )}

            {secondaryCta && (
              <Link
                to={secondaryCta.link || '#'}
              className="relative overflow-hidden rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center gap-0 pr-2 pl-6 py-2.5 group"
              style={{
                background: 'linear-gradient(to bottom, var(--primary-100), var(--primary-60))',
                color: 'white',
              }}
            >
                <span className="relative z-10">{secondaryCta.label}</span>
              <div
                className="ml-3 w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform duration-300 group-hover:rotate-45"
                style={{ color: 'var(--primary)' }}
              >
                <ArrowUpRight size={20} strokeWidth={2.5} />
              </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero


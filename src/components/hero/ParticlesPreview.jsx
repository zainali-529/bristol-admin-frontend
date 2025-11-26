import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * ParticlesPreview Component
 * Shows a live preview of particle settings
 * 
 * @param {Object} props
 * @param {Object} props.settings - Particle settings object
 * @param {boolean} props.settings.enabled - Whether particles are enabled
 * @param {number} props.settings.count - Number of particles
 * @param {string} props.settings.color - Particle color
 * @param {number} props.settings.size - Particle size
 * @param {number} props.settings.speed - Movement speed
 * @param {string} props.settings.lineColor - Line link color
 * @param {number} props.settings.lineOpacity - Line opacity
 * @param {boolean} props.settings.interactivity - Mouse interaction enabled
 */
const ParticlesPreview = ({ settings = {} }) => {
  const containerRef = useRef(null);

  const {
    enabled = true,
    count = 80,
    color = '#ffffff',
    size = 3,
    speed = 2,
    lineColor = '#ffffff',
    lineOpacity = 0.4,
    interactivity = true,
  } = settings;

  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return;
    }

    const initParticles = () => {
      if (typeof window !== 'undefined' && window.particlesJS) {
        // Clear any existing particles
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        window.particlesJS('particles-preview', {
          particles: {
            number: {
              value: Math.min(count, 50), // Limit for preview
              density: {
                enable: true,
                value_area: 400,
              },
            },
            color: { value: color },
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
              value: size,
              random: true,
              anim: { enable: false, speed: 40, size_min: 0.1, sync: false },
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: lineColor,
              opacity: lineOpacity,
              width: 1,
            },
            move: {
              enable: true,
              speed: speed,
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
              onhover: { enable: interactivity, mode: 'repulse' },
              onclick: { enable: interactivity, mode: 'push' },
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
        });
      }
    };

    // Wait for particlesJS to be available
    if (typeof window !== 'undefined') {
      if (window.particlesJS) {
        initParticles();
      } else {
        const checkParticles = setInterval(() => {
          if (window.particlesJS) {
            clearInterval(checkParticles);
            initParticles();
          }
        }, 100);

        setTimeout(() => clearInterval(checkParticles), 5000);
      }
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [enabled, count, color, size, speed, lineColor, lineOpacity, interactivity]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Particles Preview</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full h-64 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
          {enabled ? (
            <div
              id="particles-preview"
              ref={containerRef}
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/50">
              <p className="text-sm font-medium">Particles Disabled</p>
            </div>
          )}
          
          {/* Settings overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-3">
            <div className="grid grid-cols-2 gap-2 text-xs text-white/90">
              <div>
                <span className="font-medium">Count:</span> {count}
              </div>
              <div>
                <span className="font-medium">Speed:</span> {speed}
              </div>
              <div>
                <span className="font-medium">Size:</span> {size}
              </div>
              <div>
                <span className="font-medium">Interactive:</span> {interactivity ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticlesPreview;



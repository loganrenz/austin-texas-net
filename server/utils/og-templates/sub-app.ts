import React from 'react'

/**
 * OG image template: Sub-App
 *
 * Used for pages like /food/bbq/, /health/cedar-pollen/, /weather/radar/.
 * Category badge with dot indicator + dual accent circles.
 */
export function OgSubApp(props: {
  title: string
  description: string
  category?: string
  categoryColor?: string
  siteName?: string
}) {
  const {
    title,
    description,
    category = '',
    categoryColor = '#84cc16',
    siteName = 'austin-texas.net',
  } = props
  const fontSize = title.length > 50 ? '42px' : title.length > 35 ? '48px' : '54px'
  const h = React.createElement

  return h('div', {
    style: {
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '60px 64px',
      background: 'linear-gradient(145deg, #0a1004 0%, #1a2f0a 40%, #2d4a1a 100%)',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
    },
  },
  // Background accent circles
  h('div', {
    style: {
      position: 'absolute',
      top: '-80px',
      right: '-40px',
      width: '500px',
      height: '500px',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${categoryColor}25 0%, transparent 65%)`,
    },
  }),
  h('div', {
    style: {
      position: 'absolute',
      bottom: '-120px',
      left: '-80px',
      width: '350px',
      height: '350px',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${categoryColor}15 0%, transparent 70%)`,
    },
  }),

  // Top: Site name + Category badge
  h('div', {
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' },
  },
  h('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 20px',
      background: 'rgba(132, 204, 22, 0.15)',
      borderRadius: '999px',
      border: '1px solid rgba(132, 204, 22, 0.3)',
    },
  },
  h('div', {
    style: { width: '10px', height: '10px', borderRadius: '50%', background: '#84cc16' },
  }),
  h('span', {
    style: { fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px', color: '#84cc16' },
  }, siteName),
  ),
  // Category badge with dot
  category
    ? h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 24px',
          background: `${categoryColor}22`,
          borderRadius: '999px',
          border: `1px solid ${categoryColor}44`,
        },
      },
      h('div', {
        style: { width: '8px', height: '8px', borderRadius: '50%', background: categoryColor },
      }),
      h('span', {
        style: {
          fontSize: '16px',
          fontWeight: 600,
          color: categoryColor,
          letterSpacing: '1.5px',
        },
      }, category.toUpperCase()),
      )
    : null,
  ),

  // Center: Title + Description
  h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'relative',
      flex: '1',
      justifyContent: 'center',
    },
  },
  h('div', {
    style: { fontSize, fontWeight: 900, lineHeight: 1.1, color: '#ffffff', maxWidth: '950px' },
  }, title),
  description
    ? h('div', {
        style: {
          fontSize: '20px',
          fontWeight: 400,
          lineHeight: 1.5,
          color: 'rgba(255, 255, 255, 0.6)',
          maxWidth: '800px',
          overflow: 'hidden',
        },
      }, description)
    : null,
  ),

  // Bottom: Category-colored accent bar
  h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' } },
    h('div', {
      style: {
        height: '4px',
        width: '80px',
        background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}88)`,
        borderRadius: '2px',
      },
    }),
    h('span', {
      style: {
        fontSize: '15px',
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: '1px',
      },
    }, 'YOUR GUIDE TO AUSTIN, TEXAS'),
  ),
  )
}

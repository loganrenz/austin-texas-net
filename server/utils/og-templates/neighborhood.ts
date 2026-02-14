import React from 'react'

/**
 * OG image template: Neighborhood
 *
 * Orange accent, region/city/ZIP pills, "Neighborhoods" badge.
 */
export function OgNeighborhood(props: {
  title: string
  description: string
  region?: string
  city?: string
  zipCode?: string
  siteName?: string
}) {
  const {
    title,
    description,
    region = '',
    city = '',
    zipCode = '',
    siteName = 'austin-texas.net',
  } = props
  const fontSize = title.length > 25 ? '50px' : '60px'
  const h = React.createElement

  // Build pills array
  const pills: React.ReactElement[] = []
  if (region) {
    pills.push(h('div', {
      key: 'region',
      style: {
        padding: '6px 18px',
        background: 'rgba(234, 88, 12, 0.15)',
        borderRadius: '999px',
        border: '1px solid rgba(234, 88, 12, 0.3)',
        fontSize: '16px',
        fontWeight: 600,
        color: '#fb923c',
      },
    }, region))
  }
  if (city && city !== 'Austin') {
    pills.push(h('div', {
      key: 'city',
      style: {
        padding: '6px 18px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        fontSize: '16px',
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.7)',
      },
    }, city))
  }
  if (zipCode) {
    pills.push(h('div', {
      key: 'zip',
      style: {
        padding: '6px 18px',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        fontSize: '16px',
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.55)',
      },
    }, zipCode))
  }

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
  // Background accent circles — orange
  h('div', {
    style: {
      position: 'absolute',
      top: '-100px',
      right: '-50px',
      width: '480px',
      height: '480px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(234, 88, 12, 0.2) 0%, transparent 65%)',
    },
  }),
  h('div', {
    style: {
      position: 'absolute',
      bottom: '-100px',
      left: '-60px',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(234, 88, 12, 0.1) 0%, transparent 70%)',
    },
  }),

  // Top: Site name + Neighborhoods badge
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
  h('div', { style: { width: '10px', height: '10px', borderRadius: '50%', background: '#84cc16' } }),
  h('span', { style: { fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px', color: '#84cc16' } }, siteName),
  ),
  // Neighborhoods badge
  h('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 24px',
      background: 'rgba(234, 88, 12, 0.15)',
      borderRadius: '999px',
      border: '1px solid rgba(234, 88, 12, 0.35)',
    },
  },
  h('div', { style: { width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c' } }),
  h('span', {
    style: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#ea580c',
      letterSpacing: '1.5px',
    },
  }, 'NEIGHBORHOODS'),
  ),
  ),

  // Center: Neighborhood name + pills + description
  h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      position: 'relative',
      flex: '1',
      justifyContent: 'center',
    },
  },
  h('div', {
    style: { fontSize, fontWeight: 900, lineHeight: 1.1, color: '#ffffff', maxWidth: '900px' },
  }, title),
  pills.length > 0
    ? h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' } }, ...pills)
    : null,
  description
    ? h('div', {
        style: {
          fontSize: '20px',
          fontWeight: 400,
          lineHeight: 1.5,
          color: 'rgba(255, 255, 255, 0.55)',
          maxWidth: '780px',
          overflow: 'hidden',
        },
      }, description)
    : null,
  ),

  // Bottom: Orange accent bar
  h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' } },
    h('div', {
      style: {
        height: '4px',
        width: '80px',
        background: 'linear-gradient(90deg, #ea580c, #f97316)',
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
    }, 'AUSTIN NEIGHBORHOOD GUIDE'),
  ),
  )
}

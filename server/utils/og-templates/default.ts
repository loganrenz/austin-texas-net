import React from 'react'

/**
 * OG image template: Default
 *
 * Dark gradient background, green accent, site badge, title, description,
 * and "Your Guide to Austin, Texas" tagline bar.
 */
export function OgDefault(props: {
  title: string
  description: string
  siteName?: string
}) {
  const { title, description, siteName = 'austin-texas.net' } = props
  const fontSize = title.length > 40 ? '48px' : '56px'
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
      top: '-120px',
      right: '-80px',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(132, 204, 22, 0.15) 0%, transparent 70%)',
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
      background: 'radial-gradient(circle, rgba(132, 204, 22, 0.1) 0%, transparent 70%)',
    },
  }),

  // Top: Site name badge
  h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' } },
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
      style: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#84cc16',
      },
    }),
    h('span', {
      style: {
        fontSize: '18px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        color: '#84cc16',
      },
    }, siteName),
    ),
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
    style: {
      fontSize,
      fontWeight: 900,
      lineHeight: 1.1,
      color: '#ffffff',
      maxWidth: '900px',
    },
  }, title),
  description
    ? h('div', {
        style: {
          fontSize: '22px',
          fontWeight: 400,
          lineHeight: 1.5,
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '800px',
          overflow: 'hidden',
        },
      }, description)
    : null,
  ),

  // Bottom: Decorative bar
  h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' } },
    h('div', {
      style: {
        height: '4px',
        width: '80px',
        background: 'linear-gradient(90deg, #84cc16, #65a30d)',
        borderRadius: '2px',
      },
    }),
    h('span', {
      style: {
        fontSize: '15px',
        fontWeight: 500,
        color: 'rgba(255, 255, 255, 0.45)',
        letterSpacing: '1px',
      },
    }, 'YOUR GUIDE TO AUSTIN, TEXAS'),
  ),
  )
}

import React from 'react'

/**
 * OG image template: Category
 *
 * Category landing pages — site badge + category badge with dynamic accent color.
 */
export function OgCategory(props: {
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
  const fontSize = title.length > 40 ? '46px' : '54px'
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
  // Background accent
  h('div', {
    style: {
      position: 'absolute',
      top: '-100px',
      right: '-60px',
      width: '450px',
      height: '450px',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${categoryColor}22 0%, transparent 70%)`,
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
  // Category badge
  category
    ? h('div', {
        style: {
          padding: '8px 24px',
          background: `${categoryColor}22`,
          borderRadius: '999px',
          border: `1px solid ${categoryColor}44`,
        },
      },
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
    style: { fontSize, fontWeight: 900, lineHeight: 1.1, color: '#ffffff', maxWidth: '900px' },
  }, title),
  description
    ? h('div', {
        style: {
          fontSize: '21px',
          fontWeight: 400,
          lineHeight: 1.5,
          color: 'rgba(255, 255, 255, 0.65)',
          maxWidth: '780px',
          overflow: 'hidden',
        },
      }, description)
    : null,
  ),

  // Bottom: Color accent bar
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
    }, 'Your Guide to Austin, Texas'),
  ),
  )
}

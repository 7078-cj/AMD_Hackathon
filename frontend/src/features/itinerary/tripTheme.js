const NAMED_COLORS = {
  azure: '#3B82F6',
  turquoise: '#2DD4BF',
  teal: '#14B8A6',
  emerald: '#10B981',
  'emerald green': '#10B981',
  green: '#22C55E',

  'golden sand': '#E9B96E',
  gold: '#FBBF24',
  sand: '#E9B96E',

  'coral pink': '#FB7185',
  coral: '#FB923C',
  pink: '#EC4899',
  rose: '#F43F5E',

  blue: '#3B82F6',
  navy: '#60A5FA',
  indigo: '#6366F1',
  purple: '#8B5CF6',
  violet: '#A78BFA',

  orange: '#F97316',
  amber: '#FBBF24',
  yellow: '#FACC15',

  white: '#F8FAFC',
  cream: '#FFF7ED',
  beige: '#F5E6C8',

  brown: '#C08457',

  charcoal: '#64748B',
  slate: '#94A3B8',

  red: '#EF4444',
  crimson: '#E11D48',
}

function hashString(value) {
  let hash = 0

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }

  return Math.abs(hash)
}

function hslToHex(h, s, l) {
  const saturation = s / 100
  const lightness = l / 100

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const huePrime = h / 60
  const second = chroma * (1 - Math.abs((huePrime % 2) - 1))

  let r = 0
  let g = 0
  let b = 0

  if (huePrime >= 0 && huePrime < 1) [r, g, b] = [chroma, second, 0]
  else if (huePrime < 2) [r, g, b] = [second, chroma, 0]
  else if (huePrime < 3) [r, g, b] = [0, chroma, second]
  else if (huePrime < 4) [r, g, b] = [0, second, chroma]
  else if (huePrime < 5) [r, g, b] = [second, 0, chroma]
  else [r, g, b] = [chroma, 0, second]

  const adjust = lightness - chroma / 2

  const toHex = (channel) =>
    Math.round((channel + adjust) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  }
}

function normalizeColor(hex, minLightness = 55) {
  const { h, s, l } = hexToHsl(hex)

  return hslToHex(
    h,
    Math.max(s, 45),
    Math.max(l, minLightness)
  )
}

function toAccessibleTextColor(hex, minLightness = 65) {
  const { h, s, l } = hexToHsl(hex)

  if (l >= minLightness) {
    return hex
  }

  return hslToHex(h, s, minLightness)
}

export function resolvePaletteColor(name) {
  if (!name) {
    return null
  }

  const normalized = String(name).toLowerCase().trim()

  if (NAMED_COLORS[normalized]) {
    return normalizeColor(NAMED_COLORS[normalized])
  }

  const partialMatch = Object.entries(NAMED_COLORS).find(([key]) =>
    normalized.includes(key)
  )

  if (partialMatch) {
    return normalizeColor(partialMatch[1])
  }

  const hue = hashString(normalized) % 360

  return hslToHex(hue, 65, 58)
}

export function buildTripTheme(colorPalette = []) {
  const colors = (colorPalette || [])
    .map(resolvePaletteColor)
    .filter(Boolean)
    .map((color) => normalizeColor(color, 55))

  const primary = colors[0] || '#10B981'
  const secondary = colors[1] || '#14B8A6'
  const accent = colors[2] || '#38BDF8'
  const highlight = colors[3] || '#FBBF24'
  const soft = colors[4] || '#F0FDFA'

  return {
    colors,

    cssVariables: {
      '--trip-primary': primary,
      '--trip-secondary': secondary,
      '--trip-accent': accent,
      '--trip-highlight': highlight,
      '--trip-soft': soft,

      '--trip-primary-soft': `${primary}22`,
      '--trip-secondary-soft': `${secondary}22`,

      '--trip-primary-text': toAccessibleTextColor(primary),
      '--trip-highlight-text': toAccessibleTextColor(highlight),
    },

    headerGradient: `linear-gradient(
      135deg,
      ${primary} 0%,
      ${secondary} 45%,
      ${accent} 100%
    )`,

    routeActivityColor: primary,
    routeRestaurantColor: highlight,
  }
}
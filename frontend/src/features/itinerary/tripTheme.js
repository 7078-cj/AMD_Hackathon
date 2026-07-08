const NAMED_COLORS = {
  azure: '#007FFF',
  turquoise: '#40E0D0',
  teal: '#0D9488',
  emerald: '#059669',
  'emerald green': '#059669',
  green: '#16A34A',
  'golden sand': '#D4A574',
  gold: '#D4A574',
  sand: '#D4A574',
  'coral pink': '#F88379',
  coral: '#FF7F50',
  pink: '#EC4899',
  rose: '#F43F5E',
  blue: '#2563EB',
  navy: '#1E3A8A',
  indigo: '#4F46E5',
  purple: '#7C3AED',
  violet: '#8B5CF6',
  orange: '#F97316',
  amber: '#F59E0B',
  yellow: '#EAB308',
  white: '#F8FAFC',
  cream: '#F5F0E6',
  beige: '#E8DCC8',
  brown: '#92400E',
  charcoal: '#334155',
  slate: '#475569',
  red: '#DC2626',
  crimson: '#BE123C',
}

function hashString(value) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function hslToHex(h, s, l) {
  const saturation = s / 100
  const lightness = l / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const huePrime = h / 60
  const second = chroma * (1 - Math.abs((huePrime % 2) - 1))
  let red = 0
  let green = 0
  let blue = 0

  if (huePrime >= 0 && huePrime < 1) [red, green, blue] = [chroma, second, 0]
  else if (huePrime < 2) [red, green, blue] = [second, chroma, 0]
  else if (huePrime < 3) [red, green, blue] = [0, chroma, second]
  else if (huePrime < 4) [red, green, blue] = [0, second, chroma]
  else if (huePrime < 5) [red, green, blue] = [second, 0, chroma]
  else [red, green, blue] = [chroma, 0, second]

  const adjust = lightness - chroma / 2
  const toHex = (channel) =>
    Math.round((channel + adjust) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
}

export function resolvePaletteColor(name) {
  if (!name) {
    return null
  }

  const normalized = String(name).toLowerCase().trim()

  if (NAMED_COLORS[normalized]) {
    return NAMED_COLORS[normalized]
  }

  const partialMatch = Object.entries(NAMED_COLORS).find(([key]) => normalized.includes(key))
  if (partialMatch) {
    return partialMatch[1]
  }

  const hue = hashString(normalized) % 360
  return hslToHex(hue, 62, 48)
}

export function buildTripTheme(colorPalette = []) {
  const colors = (colorPalette || []).map(resolvePaletteColor).filter(Boolean)
  const primary = colors[0] || '#047857'
  const secondary = colors[1] || '#0F766E'
  const accent = colors[2] || '#14B8A6'
  const highlight = colors[3] || '#F59E0B'
  const soft = colors[4] || '#ECFEFF'

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
    },
    headerGradient: `linear-gradient(135deg, ${primary} 0%, ${secondary} 45%, ${accent} 100%)`,
    routeActivityColor: primary,
    routeRestaurantColor: highlight,
  }
}

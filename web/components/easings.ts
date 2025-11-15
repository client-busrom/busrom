export const easings: Record<string, { fn: (t: number) => number }> = {
  // Linear
  linear: { fn: (t) => t },

  // Quad
  easeInQuad: { fn: (t) => t * t },
  easeOutQuad: { fn: (t) => t * (2 - t) },
  easeInOutQuad: { fn: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t) },
  easeOutInQuad: { fn: (t) => (t < 0.5 ? t * (2 * t) : (2 * t - 1) * (2 - (2 * t - 1))) },

  // Cubic
  easeInCubic: { fn: (t) => t * t * t },
  easeOutCubic: { fn: (t) => 1 - Math.pow(1 - t, 3) },
  easeInOutCubic: { fn: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) },
  easeOutInCubic: { fn: (t) => (t < 0.5 ? 1 - Math.pow(1 - 2 * t, 3) / 2 : Math.pow(2 * t - 1, 3) / 2 + 0.5) },

  // Quart
  easeInQuart: { fn: (t) => t ** 4 },
  easeOutQuart: { fn: (t) => 1 - Math.pow(1 - t, 4) },
  easeInOutQuart: { fn: (t) => (t < 0.5 ? 8 * t ** 4 : 1 - Math.pow(-2 * t + 2, 4) / 2) },
  easeOutInQuart: { fn: (t) => (t < 0.5 ? 1 - Math.pow(1 - 2 * t, 4) / 2 : Math.pow(2 * t - 1, 4) / 2 + 0.5) },

  // Quint
  easeInQuint: { fn: (t) => t ** 5 },
  easeOutQuint: { fn: (t) => 1 - Math.pow(1 - t, 5) },
  easeInOutQuint: { fn: (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2) },
  easeOutInQuint: { fn: (t) => (t < 0.5 ? 1 - Math.pow(1 - 2 * t, 5) / 2 : Math.pow(2 * t - 1, 5) / 2 + 0.5) },

  // Expo
  easeInExpo: { fn: (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)) },
  easeOutExpo: { fn: (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t)) },
  easeInOutExpo: { fn: (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2 },
  easeOutInExpo: { fn: (t) => t < 0.5 ? 1 - 2 ** (-20 * t) / 2 : 2 ** (20 * (t - 0.5) - 10) / 2 + 0.5 },

  // Circ
  easeInCirc: { fn: (t) => 1 - Math.sqrt(1 - t * t) },
  easeOutCirc: { fn: (t) => Math.sqrt(1 - (t - 1) ** 2) },
  easeInOutCirc: { fn: (t) => t < 0.5 ? (1 - Math.sqrt(1 - 4 * t ** 2)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2 },
  easeOutInCirc: { fn: (t) => t < 0.5 ? Math.sqrt(1 - (2 * t - 1) ** 2) / 2 : 1 - Math.sqrt(1 - (2 * t - 1) ** 2) / 2 },

  // Back
  easeInBack: { fn: (t) => t * t * (2.70158 * t - 1.70158) },
  easeOutBack: { fn: (t) => 1 + (--t) * t * (2.70158 * t + 1.70158) },
  easeInOutBack: { fn: (t) => t < 0.5 ? 2 * t * t * (7.189819 * t - 2.5949095) : 1 + 2 * (--t) * t * (7.189819 * t + 2.5949095) },
  easeOutInBack: { fn: (t) => t < 0.5 ? 1 + 2 * (2 * t - 1) * (2 * t) * (7.189819 * 2 * t + 2.5949095) : 2 * ((2 * t - 1) ** 2 * (7.189819 * (2 * t - 1) - 2.5949095)) },

  // Elastic
  easeInElastic: { fn: (t) => t === 0 ? 0 : t === 1 ? 1 : (-2) ** (10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)) },
  easeOutElastic: { fn: (t) => t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1 },
  easeInOutElastic: { fn: (t) => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(2 ** (20 * t - 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 : (2 ** (-20 * t + 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2 + 1 },
  easeOutInElastic: { fn: (t) => t < 0.5 ? 2 ** (-20 * t) * Math.sin((20 * t - 0.75) * ((2 * Math.PI) / 3)) / 2 : (-2) ** (20 * (t - 0.5) - 10) * Math.sin((20 * (t - 0.5) - 10.75) * ((2 * Math.PI) / 3)) / 2 + 0.5 },

  // Bounce
  easeInBounce: { fn: (t) => 1 - easings.easeOutBounce.fn(1 - t) },
  easeOutBounce: { fn: (t) => {
    const n1 = 7.5625, d1 = 2.75
    if (t < 1 / d1) return n1 * t * t
    else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
    else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
    else return n1 * (t -= 2.625 / d1) * t + 0.984375
  }},
  easeInOutBounce: { fn: (t) => t < 0.5 ? (1 - easings.easeOutBounce.fn(1 - 2 * t)) / 2 : (1 + easings.easeOutBounce.fn(2 * t - 1)) / 2 },
  easeOutInBounce: { fn: (t) => t < 0.5 ? easings.easeOutBounce.fn(2 * t) / 2 : 0.5 + (1 - easings.easeOutBounce.fn(2 - 2 * t)) / 2 },
}

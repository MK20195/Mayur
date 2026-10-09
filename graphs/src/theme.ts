import {Easing, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// Font project ke andar bundled hai (public/fonts) — offline bhi chalega.
const fontFamily = 'Inter';
loadFont({
  family: fontFamily,
  url: staticFile('fonts/Inter-Variable.woff2'),
  weight: '100 900',
});

// Ek jagah se poora look badlo: reference channel ka style milte hi
// sirf ye values change karni hongi.
export const theme = {
  bg: '#0B0D12',
  grid: 'rgba(255,255,255,0.07)',
  axis: 'rgba(255,255,255,0.18)',
  text: '#F2F4F8',
  muted: '#8A93A6',
  accent: '#4F8CFF',
  accent2: '#22D3A6',
  negative: '#FF5C6C',
  palette: ['#4F8CFF', '#22D3A6', '#FFB547', '#FF5C6C', '#A78BFA', '#5EEAD4'],
  font: fontFamily,
};

// Smooth motion ke liye shared easing curves.
export const ease = {
  // Draw-on / reveal: dheere start, beech mein tez, dheere end.
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  // Elements ka andar aana: tez start, soft landing.
  out: Easing.bezier(0.16, 1, 0.3, 1),
};

// Spring bina bounce ke (damping 200) — premium, "settle" hone wala feel.
export const smoothSpring = {damping: 200, stiffness: 120, mass: 1};

export const formatNumber = (n: number, decimals = 0) =>
  n.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

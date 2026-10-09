import React, {useMemo} from 'react';
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {Title} from '../components/Title';
import {ease, formatNumber, smoothSpring, theme} from '../theme';

export type LineChartProps = {
  title: string;
  subtitle?: string;
  data: {label: string; value: number}[];
  prefix?: string;
  suffix?: string;
  color?: string;
  transparent?: boolean;
};

const CHART = {left: 220, right: 1760, top: 300, bottom: 900};

// Catmull-Rom -> cubic bezier: points ke beech smooth curve.
const smoothPath = (pts: {x: number; y: number}[]) => {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const t = 0.18;
    const c1x = p1.x + (p2.x - p0.x) * t;
    const c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t;
    const c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
};

const niceTicks = (max: number, count = 5) => {
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  const top = Math.ceil(max / step) * step;
  return Array.from({length: Math.round(top / step) + 1}, (_, i) => i * step);
};

export const LineChart: React.FC<LineChartProps> = ({
  title,
  subtitle,
  data,
  prefix = '',
  suffix = '',
  color = theme.accent,
  transparent = false,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const ticks = useMemo(
    () => niceTicks(Math.max(...data.map((d) => d.value))),
    [data],
  );
  const yMax = ticks[ticks.length - 1];
  const w = CHART.right - CHART.left;
  const h = CHART.bottom - CHART.top;

  const points = useMemo(
    () =>
      data.map((d, i) => ({
        x: CHART.left + (w * i) / (data.length - 1),
        y: CHART.bottom - (d.value / yMax) * h,
      })),
    [data, w, h, yMax],
  );
  const path = useMemo(() => smoothPath(points), [points]);
  const length = useMemo(() => getLength(path), [path]);

  // Timeline (60fps): grid 15-60, line draw 50-200, callout ~200.
  const drawStart = 50;
  const drawEnd = 200;
  const progress = interpolate(frame, [drawStart, drawEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.inOut,
  });
  const {strokeDasharray, strokeDashoffset} = evolvePath(progress, path);
  const head = getPointAtLength(path, Math.max(0.001, progress * length)) ?? points[0];

  // Head ki x position se live value nikalo (points ke beech linear).
  const seg = ((head.x - CHART.left) / w) * (data.length - 1);
  const i0 = Math.min(Math.floor(seg), data.length - 2);
  const liveValue =
    data[i0].value + (data[i0 + 1].value - data[i0].value) * (seg - i0);

  const headVisible = interpolate(frame, [drawStart, drawStart + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const callout = spring({frame: frame - drawEnd + 6, fps, config: smoothSpring});

  // Halka cinematic push-in poore shot pe.
  const camera = interpolate(frame, [0, durationInFrames], [1.06, 1], {
    easing: ease.out,
  });

  const last = points[points.length - 1];
  const areaPath = `${path} L ${last.x} ${CHART.bottom} L ${CHART.left} ${CHART.bottom} Z`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? 'transparent' : theme.bg,
        fontFamily: theme.font,
      }}
    >
      <AbsoluteFill style={{transform: `scale(${camera})`}}>
        <Title title={title} subtitle={subtitle} />

        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            <clipPath id="reveal">
              <rect x={0} y={0} width={head.x} height={1080} />
            </clipPath>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines + Y labels, neeche se upar stagger */}
          {ticks.map((t, i) => {
            const y = CHART.bottom - (t / yMax) * h;
            const p = interpolate(frame, [15 + i * 6, 45 + i * 6], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: ease.out,
            });
            return (
              <g key={t} opacity={p}>
                <line
                  x1={CHART.left}
                  x2={CHART.left + w * p}
                  y1={y}
                  y2={y}
                  stroke={i === 0 ? theme.axis : theme.grid}
                  strokeWidth={2}
                />
                <text
                  x={CHART.left - 24}
                  y={y + 10}
                  fill={theme.muted}
                  fontSize={26}
                  textAnchor="end"
                >
                  {prefix}
                  {formatNumber(t)}
                  {suffix}
                </text>
              </g>
            );
          })}

          {/* X labels: line jab us point tak pahunche tab aaye */}
          {data.map((d, i) => {
            const x = points[i].x;
            const p = interpolate(head.x, [x - 80, x], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <text
                key={d.label}
                x={x}
                y={CHART.bottom + 50 + (1 - p) * 16}
                fill={theme.muted}
                fontSize={26}
                textAnchor="middle"
                opacity={p}
              >
                {d.label}
              </text>
            );
          })}

          <path d={areaPath} fill="url(#area)" clipPath="url(#reveal)" />

          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            filter="url(#glow)"
          />

          {/* Data points pop jab line pass kare */}
          {points.map((pt, i) => {
            const s = interpolate(head.x, [pt.x - 30, pt.x], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: ease.out,
            });
            return (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={9 * s}
                fill={theme.bg}
                stroke={color}
                strokeWidth={4}
              />
            );
          })}

          {/* Chalta hua glowing head */}
          <g opacity={headVisible * (1 - callout)}>
            <circle cx={head.x} cy={head.y} r={26} fill={color} opacity={0.2} />
            <circle cx={head.x} cy={head.y} r={12} fill={color} />
          </g>
        </svg>

        {/* Live value tag jo head ke saath chalta hai */}
        <div
          style={{
            position: 'absolute',
            left: head.x,
            top: head.y - 90,
            transform: `translateX(-50%) scale(${0.9 + callout * 0.25})`,
            opacity: headVisible,
            padding: '10px 22px',
            borderRadius: 14,
            background: interpolateColors(callout, [0, 1], ['rgba(255,255,255,0.08)', color]),
            border: `2px solid ${color}`,
            color: theme.text,
            fontSize: 34,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {prefix}
          {formatNumber(Math.round(liveValue))}
          {suffix}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Title} from '../components/Title';
import {ease, formatNumber, smoothSpring, theme} from '../theme';

export type DonutChartProps = {
  title: string;
  subtitle?: string;
  data: {label: string; value: number}[];
  centerLabel?: string;
  suffix?: string;
  transparent?: boolean;
};

const CX = 640;
const CY = 610;
const R = 260;
const STROKE = 70;
const GAP = 0.012; // segments ke beech chhota gap (fraction of circle)

export const DonutChart: React.FC<DonutChartProps> = ({
  title,
  subtitle,
  data,
  centerLabel = 'Total',
  suffix = '',
  transparent = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const total = data.reduce((a, d) => a + d.value, 0);
  const circ = 2 * Math.PI * R;

  // Poora ring ek continuous sweep mein bharta hai.
  const sweep = interpolate(frame, [40, 160], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.inOut,
  });
  const ringIn = spring({frame: frame - 25, fps, config: smoothSpring});

  let acc = 0;
  const segments = data.map((d, i) => {
    const start = acc;
    const frac = d.value / total;
    acc += frac;
    const visible = Math.max(0, Math.min(sweep - start, frac) - GAP);
    return {...d, start, frac, visible, color: theme.palette[i % theme.palette.length]};
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? 'transparent' : theme.bg,
        fontFamily: theme.font,
      }}
    >
      <Title title={title} subtitle={subtitle} />

      <svg
        width={1920}
        height={1080}
        style={{
          position: 'absolute',
          transform: `scale(${0.85 + ringIn * 0.15})`,
          transformOrigin: `${CX}px ${CY}px`,
          opacity: ringIn,
        }}
      >
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={theme.grid}
          strokeWidth={STROKE}
        />
        {segments.map((s) => (
          <circle
            key={s.label}
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={STROKE}
            strokeDasharray={`${s.visible * circ} ${circ}`}
            transform={`rotate(${-90 + s.start * 360} ${CX} ${CY})`}
          />
        ))}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: CX - 200,
          top: CY - 70,
          width: 400,
          textAlign: 'center',
          opacity: ringIn,
        }}
      >
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: theme.text,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: -2,
          }}
        >
          {formatNumber(Math.round(total * sweep))}
          {suffix}
        </div>
        <div style={{fontSize: 30, color: theme.muted}}>{centerLabel}</div>
      </div>

      {/* Legend: har item tab aata hai jab uska segment draw hone lage */}
      <div style={{position: 'absolute', left: 1080, top: 380}}>
        {segments.map((s) => {
          const p = interpolate(sweep, [s.start, s.start + 0.08], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const pct = Math.round(Math.max(0, Math.min(sweep - s.start, s.frac)) * 100);
          return (
            <div
              key={s.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                marginBottom: 34,
                opacity: p,
                transform: `translateX(${(1 - ease.out(p)) * 40}px)`,
              }}
            >
              <div
                style={{width: 26, height: 26, borderRadius: 8, background: s.color}}
              />
              <div style={{fontSize: 36, color: theme.text, width: 360}}>
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: s.color,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {pct}%
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

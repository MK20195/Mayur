import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Title} from '../components/Title';
import {ease, formatNumber, smoothSpring, theme} from '../theme';

export type BarChartProps = {
  title: string;
  subtitle?: string;
  data: {label: string; value: number}[];
  prefix?: string;
  suffix?: string;
  color?: string;
  // Sabse badi bar ko highlight karo, baaki muted ho jaati hain.
  highlightMax?: boolean;
  transparent?: boolean;
};

const AREA = {left: 160, right: 1760, top: 300, bottom: 900};

export const BarChart: React.FC<BarChartProps> = ({
  title,
  subtitle,
  data,
  prefix = '',
  suffix = '',
  color = theme.accent,
  highlightMax = true,
  transparent = false,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const max = Math.max(...data.map((d) => d.value));
  const maxIndex = data.findIndex((d) => d.value === max);
  const slot = (AREA.right - AREA.left) / data.length;
  const barW = slot * 0.56;
  const h = AREA.bottom - AREA.top;

  const stagger = 7;
  const growStart = 40;
  const lastBarDone = growStart + stagger * (data.length - 1) + 50;

  // Saari bars aane ke baad focus max wali bar pe.
  const focus = highlightMax
    ? interpolate(frame, [lastBarDone, lastBarDone + 30], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: ease.inOut,
      })
    : 0;

  const camera = interpolate(frame, [0, durationInFrames], [1.05, 1], {
    easing: ease.out,
  });

  const baseline = interpolate(frame, [10, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease.out,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: transparent ? 'transparent' : theme.bg,
        fontFamily: theme.font,
      }}
    >
      <AbsoluteFill style={{transform: `scale(${camera})`}}>
        <Title title={title} subtitle={subtitle} />

        <div
          style={{
            position: 'absolute',
            left: AREA.left,
            top: AREA.bottom,
            width: (AREA.right - AREA.left) * baseline,
            height: 2,
            background: theme.axis,
          }}
        />

        {data.map((d, i) => {
          const grow = spring({
            frame: frame - growStart - i * stagger,
            fps,
            config: smoothSpring,
          });
          const barH = (d.value / max) * h * grow;
          const isMax = i === maxIndex;
          const fill = isMax
            ? color
            : interpolateColors(focus, [0, 1], [color, 'rgba(255,255,255,0.14)']);
          const x = AREA.left + slot * i + (slot - barW) / 2;
          const labelIn = interpolate(grow, [0, 0.4], [0, 1], {
            extrapolateRight: 'clamp',
          });

          return (
            <React.Fragment key={d.label}>
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: AREA.bottom - barH,
                  width: barW,
                  height: barH,
                  borderRadius: '14px 14px 4px 4px',
                  background: fill,
                  boxShadow: isMax
                    ? `0 0 ${60 * focus}px ${color}66`
                    : undefined,
                }}
              />
              {/* Value bar ke saath count-up karti hai */}
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  width: barW,
                  top: AREA.bottom - barH - 60,
                  textAlign: 'center',
                  color: theme.text,
                  fontSize: 34,
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  opacity: labelIn * (isMax ? 1 : 1 - focus * 0.5),
                  transform: `scale(${isMax ? 1 + focus * 0.2 : 1})`,
                }}
              >
                {prefix}
                {formatNumber(Math.round(d.value * grow))}
                {suffix}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: x - 20,
                  width: barW + 40,
                  top: AREA.bottom + 24 + (1 - labelIn) * 16,
                  textAlign: 'center',
                  color: isMax && focus > 0 ? theme.text : theme.muted,
                  fontSize: 28,
                  fontWeight: 600,
                  opacity: labelIn,
                }}
              >
                {d.label}
              </div>
            </React.Fragment>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

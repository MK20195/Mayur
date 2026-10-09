import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ease, theme} from '../theme';

export const Title: React.FC<{
  title: string;
  subtitle?: string;
  delay?: number;
}> = ({title, subtitle, delay = 0}) => {
  const frame = useCurrentFrame() - delay;

  const reveal = (start: number) => {
    const p = interpolate(frame, [start, start + 36], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: ease.out,
    });
    return {
      opacity: p,
      transform: `translateY(${(1 - p) * 24}px)`,
      filter: `blur(${(1 - p) * 8}px)`,
    };
  };

  return (
    <div style={{position: 'absolute', left: 140, top: 80, fontFamily: theme.font}}>
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: theme.text,
          letterSpacing: -1.5,
          ...reveal(0),
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: theme.muted,
            marginTop: 8,
            ...reveal(8),
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};

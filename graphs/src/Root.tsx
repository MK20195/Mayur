import React from 'react';
import {Composition} from 'remotion';
import {LineChart} from './compositions/LineChart';
import {BarChart} from './compositions/BarChart';
import {DonutChart} from './compositions/DonutChart';

// NOTE: neeche ka data sirf demo/placeholder hai — apne video ka data daalo.
const FPS = 60;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="LineChart"
      component={LineChart}
      durationInFrames={300}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{
        title: 'Monthly Revenue',
        subtitle: 'Demo data — Jan to Aug',
        prefix: '₹',
        suffix: 'K',
        data: [
          {label: 'Jan', value: 120},
          {label: 'Feb', value: 180},
          {label: 'Mar', value: 150},
          {label: 'Apr', value: 260},
          {label: 'May', value: 230},
          {label: 'Jun', value: 340},
          {label: 'Jul', value: 410},
          {label: 'Aug', value: 520},
        ],
      }}
    />
    <Composition
      id="BarChart"
      component={BarChart}
      durationInFrames={300}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{
        title: 'Users by Platform',
        subtitle: 'Demo data — in millions',
        suffix: 'M',
        data: [
          {label: 'YouTube', value: 462},
          {label: 'Instagram', value: 362},
          {label: 'Facebook', value: 314},
          {label: 'WhatsApp', value: 535},
          {label: 'Snapchat', value: 201},
          {label: 'X', value: 25},
        ],
      }}
    />
    <Composition
      id="DonutChart"
      component={DonutChart}
      durationInFrames={300}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{
        title: 'Where the Money Goes',
        subtitle: 'Demo data — monthly budget',
        centerLabel: 'Total spend (₹K)',
        data: [
          {label: 'Rent', value: 35},
          {label: 'Food', value: 22},
          {label: 'Travel', value: 15},
          {label: 'Savings', value: 18},
          {label: 'Other', value: 10},
        ],
      }}
    />
  </>
);

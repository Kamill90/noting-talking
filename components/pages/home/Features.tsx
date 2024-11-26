import React from 'react';
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Record voice messages',
    description: 'Keep a daily voice diary to look back on later.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Transcribe voice messages',
    description: 'Use AI to transcribe your voice messages into text.',
    icon: LockClosedIcon,
  },
  {
    name: 'Generate content',
    description: 'Generaty any custom content you want from your voice messages.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Share content',
    description: 'Share your content with your audience in a way that is easy and fast.',
    icon: FingerPrintIcon,
  },
];

const Features: React.FC = () => {
  return (
    <div id="features" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="font-montserrat text-base font-semibold leading-7 text-zinc-600">
            Fast and easy
          </h2>
          <p className="mt-2 font-montserrat text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Create content with ease
          </p>
          <p className="mt-6 font-open-sans text-lg leading-8 text-zinc-600">
            Focus on speaking and let the AI do the rest.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="font-montserrat text-base font-semibold leading-7 text-zinc-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900">
                    <feature.icon aria-hidden="true" className="h-6 w-6 text-white" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 font-open-sans text-base leading-7 text-gray-600">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Features;

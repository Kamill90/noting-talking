'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

const HeroSection: React.FC = () => {
    const { isSignedIn } = useAuth();

    const scrollToFeatures = () => {
        // Implement scrolling logic here
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-white">
            <div className="relative isolate pt-14">
                {/* ... Background decorations ... */}
                <div className="py-24 sm:py-32 lg:pb-40">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-6xl font-montserrat">
                                Voice to content
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-zinc-600 font-open-sans">
                                Record voice messages and turn them into any text content you want.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link
                                    href={isSignedIn ? "/dashboard" : "https://sharing-maggot-29.accounts.dev/sign-up?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fdashboard%3F__dev_session%3Ddvb_2iK0QbZ37c9l2hHvUlRb4zvRYR5%26__clerk_db_jwt%3Ddvb_2iK0QbZ37c9l2hHvUlRb4zvRYR5%23__clerk_db_jwt%5Bdvb_2iK0QbZ37c9l2hHvUlRb4zvRYR5%5D"}
                                    className="rounded-full bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 font-montserrat"
                                >
                                    {isSignedIn ? "Go to Dashboard" : "Get started"}
                                </Link>
                                <button onClick={scrollToFeatures} className="text-sm font-semibold leading-6 text-gray-900 font-montserrat">
                                    Learn more <span aria-hidden="true">→</span>
                                </button>
                            </div>
                        </div>
                        <div className="mt-16 flow-root sm:mt-24">
                            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                                <Image
                                    src="/public/images/app.jpg"
                                    alt="App screenshot"
                                    width={2432}
                                    height={1442}
                                    className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
'use client'

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HeroSection: React.FC = () => {
    return (
        <div className="bg-white">
            <div className="relative isolate pt-14">
                {/* ... Background decorations ... */}
                <div className="py-24 sm:py-32 lg:pb-40">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl font-montserrat">
                                Data to enrich your online business
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600 font-open-sans">
                                Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet
                                fugiat veniam occaecat fugiat aliqua.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <a
                                    href="https://sharing-maggot-29.accounts.dev/sign-up?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fdashboard%3F__dev_session%3Ddvb_2iK0QbZ37c9l2hHvUlRb4zvRYR5%26__clerk_db_jwt%3Ddvb_2iK0QbZ37c9l2hHvUlRb4zvRYR5%23__clerk_db_jwt%5Bdvb_2iK0QbZ37c9l2hHvUlRb4zvRYR5%5D"
                                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 font-montserrat"
                                >
                                    Get started
                                </a>
                                <Link href="#" className="text-sm font-semibold leading-6 text-gray-900 font-montserrat">
                                    Learn more <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                        <div className="mt-16 flow-root sm:mt-24">
                            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                                <Image
                                    src="https://tailwindui.com/img/component-images/project-app-screenshot.png"
                                    alt="App screenshot"
                                    width={2432}
                                    height={1442}
                                    className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* ... Background decorations ... */}
            </div>
        </div>
    );
};

export default HeroSection;
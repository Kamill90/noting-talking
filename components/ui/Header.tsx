'use client'

import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { UserNav } from './UserNav'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'History', href: '/history' },
  { name: 'Settings', href: '/settings' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useUser()

  return (
    <header className="bg-white">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/dashboard" className="-m-1.5 p-1.5">
            <span className="sr-only">NotesGPT</span>
            <img src="/logo.svg" width={150} height={150} alt="logo" className="h-15 w-15 md:h-15 md:w-15" />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-900">
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {user ? (
            <UserNav
              image={user.imageUrl}
              name={user.firstName + ' ' + user.lastName}
              email={
                user.emailAddresses.find(({ id }) => id === user.primaryEmailAddressId)!
                  .emailAddress
              }
            />
          ) : (
            <Link href="/dashboard">
              <button className="text-md primary-gradient primary-shadow rounded-lg px-5 py-1 text-center text-light md:px-10 md:py-2 md:text-xl">
                Sign in
              </button>
            </Link>
          )}
        </div>
      </nav>
      <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="-m-1.5 p-1.5">
              <span className="sr-only">NotesGPT</span>
              <img src="/logo.svg" width={150} height={150} alt="logo" className="h-15 w-15 md:h-15 md:w-15" />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {user ? (
                  <UserNav
                    image={user.imageUrl}
                    name={user.firstName + ' ' + user.lastName}
                    email={
                      user.emailAddresses.find(({ id }) => id === user.primaryEmailAddressId)!
                        .emailAddress
                    }
                  />
                ) : (
                  <Link href="/dashboard">
                    <button className="text-md primary-gradient primary-shadow rounded-lg px-5 py-1 text-center text-light md:px-10 md:py-2 md:text-xl">
                      Sign in
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}

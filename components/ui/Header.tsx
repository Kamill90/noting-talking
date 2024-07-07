import { currentUser } from '@clerk/nextjs';
import Link from 'next/link';
import { UserNav } from './UserNav';

export default async function Header() {
  const user = await currentUser();
  return (
    <div className="container relative m-0 mx-auto pb-10 md:px-10">
      <div className="max-width flex items-center justify-between">
        {/* logo */}
        <Link className="flex w-fit items-center gap-[2px]" href="/dashboard">
          <img
            src="/logo.svg"
            width={150}
            height={150}
            alt="logo"
            className="h-15 w-15 md:h-15 md:w-15"
          />
        </Link>
        {/* buttons */}
        <div className="flex w-fit items-center gap-[22px]">
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
  );
}

import { currentUser } from '@clerk/nextjs';
import Link from 'next/link';
import { UserNav } from './UserNav';
import { Button } from './shadcn/button';

export default async function Header() {
  const user = await currentUser();
  return (
    <div className="container relative m-0 mx-auto pb-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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
              <Button variant="default" className="rounded-lg">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

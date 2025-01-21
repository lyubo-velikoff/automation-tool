// apps/web/src/app/page.tsx
"use client";

import Link from "next/link";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { SignInForm } from "@/components/features/auth/SignInForm";
import { SocialSignIn } from "@/components/features/auth/SocialSignIn";
import { useAuthRedirect } from "@/hooks/auth/useAuthRedirect";

export default function Home() {
  useAuthRedirect();

  return (
    <AuthLayout>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>Welcome back</h1>
        <p className='text-sm text-muted-foreground'>
          Sign in to your account to continue
        </p>
      </div>

      <SignInForm />
      <SocialSignIn />

      <p className='px-8 text-center text-sm text-muted-foreground'>
        By clicking continue, you agree to our{" "}
        <Link
          href='/terms'
          className='underline underline-offset-4 hover:text-primary'
          tabIndex={0}
          aria-label='Terms of Service'
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href='/privacy'
          className='underline underline-offset-4 hover:text-primary'
          tabIndex={0}
          aria-label='Privacy Policy'
        >
          Privacy Policy
        </Link>
        .
      </p>
    </AuthLayout>
  );
}

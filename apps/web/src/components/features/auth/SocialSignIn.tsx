import { Button } from "@/components/ui/inputs/button";
import { Icons } from "@/components/ui/data-display/icons";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export const SocialSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn();
    } catch (err) {
      console.error("GitHub sign in failed:", err);
      setError("Failed to sign in with GitHub. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or continue with
          </span>
        </div>
      </div>

      <Button
        type='button'
        variant='outline'
        className='w-full'
        onClick={handleGithubSignIn}
        disabled={isLoading}
        aria-label='Sign in with GitHub'
      >
        {isLoading ? (
          <Icons.spinner
            className='mr-2 h-4 w-4 animate-spin'
            aria-hidden='true'
          />
        ) : (
          <Icons.gitHub className='mr-2 h-4 w-4' aria-hidden='true' />
        )}
        Sign in with GitHub
      </Button>

      {error && (
        <p className='text-sm text-red-500 text-center' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
};

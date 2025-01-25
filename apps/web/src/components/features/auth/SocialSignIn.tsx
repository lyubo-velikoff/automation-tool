import { Button } from "@/components/ui/inputs/button";
import { Icons } from "@/components/ui/data-display/icons";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export const SocialSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  // Listen for auth messages from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "AUTH_COMPLETE") {
        setIsLoading(false);
        toast({
          title: "Success",
          description: "Successfully signed in with GitHub"
        });
      } else if (event.data?.type === "AUTH_ERROR") {
        setIsLoading(false);
        toast({
          title: "Authentication Failed",
          description: event.data.error || "Failed to sign in with GitHub",
          variant: "destructive"
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn();
    } catch (err) {
      console.error("GitHub sign in failed:", err);
      toast({
        title: "Authentication Failed",
        description:
          "Failed to open sign in popup. Please allow popups for this site.",
        variant: "destructive"
      });
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
        {isLoading ? "Signing in..." : "Sign in with GitHub"}
      </Button>
    </div>
  );
};

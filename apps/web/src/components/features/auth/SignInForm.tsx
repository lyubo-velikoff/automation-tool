import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";
import { useSignInForm } from "@/hooks/auth/useSignInForm";
import { useAuth } from "@/hooks/useAuth";

export const SignInForm = () => {
  const {
    formData,
    isLoading,
    error,
    setIsLoading,
    handleInputChange,
    validateForm,
    resetForm
  } = useSignInForm();

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signIn();
      resetForm();
    } catch (err) {
      console.error("Sign in failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Input
          type='email'
          name='email'
          placeholder='name@example.com'
          value={formData.email}
          onChange={handleInputChange}
          className='bg-background'
          aria-label='Email address'
          disabled={isLoading}
          required
        />
      </div>
      <Button
        type='submit'
        className='w-full'
        disabled={isLoading}
        aria-label='Sign in with email'
      >
        {isLoading && (
          <Icons.spinner
            className='mr-2 h-4 w-4 animate-spin'
            aria-hidden='true'
          />
        )}
        Sign in with Email
      </Button>
      {error && (
        <p className='text-sm text-red-500 text-center' role='alert'>
          {error.message}
        </p>
      )}
    </form>
  );
};

import { useState } from 'react';
import { SignInFormData, AuthError } from '@/types/auth';

export const useSignInForm = () => {
  const [formData, setFormData] = useState<SignInFormData>({ email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email) {
      setError({ message: 'Email is required' });
      return false;
    }
    if (!formData.email.includes('@')) {
      setError({ message: 'Invalid email format' });
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({ email: '' });
    setError(null);
  };

  return {
    formData,
    isLoading,
    error,
    setIsLoading,
    setError,
    handleInputChange,
    validateForm,
    resetForm,
  };
}; 

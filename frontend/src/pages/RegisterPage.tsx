import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface RegisterForm {
  email: string;
  full_name: string;
  password: string;
  confirmPassword: string;
  wallet_address: string;
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, setError: setFormError, clearErrors } = useForm<RegisterForm>({
    mode: 'onBlur',
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    try {
      await registerUser({
        email: data.email,
        full_name: data.full_name,
        password: data.password,
        wallet_address: data.wallet_address || undefined,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-50 via-white to-primary-50 dark:from-dark-950 dark:via-dark-900 dark:to-primary-950/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-dark-900 dark:text-white">SecureChain</span>
          </Link>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-dark-600 dark:text-dark-400">Join the decentralized identity platform</p>
        </div>

        <Card variant="glass" className="p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400 animate-in" role="alert">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              {...register('full_name', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Name too long' },
              })}
              error={errors.full_name?.message}
              autoComplete="name"
              disabled={isLoading}
            />

            <Input
              label="Email"
              type="email"
              placeholder="john@company.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={errors.email?.message}
              autoComplete="email"
              disabled={isLoading}
            />

            <Input
              label="Wallet Address (Optional)"
              type="text"
              placeholder="0x1234...abcd"
              {...register('wallet_address', {
                pattern: {
                  value: /^0x[a-fA-F0-9]{40}$/,
                  message: 'Invalid Ethereum address format',
                },
              })}
              error={errors.wallet_address?.message}
              helperText="Leave blank to add later. Must be a valid Ethereum address."
              disabled={isLoading}
            />

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`
                    w-full px-4 py-2.5 rounded-lg bg-white dark:bg-dark-800 border text-dark-900 dark:text-dark-100 
                    placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 
                    focus:border-transparent transition-all duration-200 pr-12
                    ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-dark-300 dark:border-dark-600'}
                  `}
                  placeholder="At least 8 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'Must contain uppercase, lowercase, number, and special character',
                    },
                  })}
                  autoComplete="new-password"
                  disabled={isLoading}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-700 dark:hover:text-dark-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-500" role="alert">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`
                  w-full px-4 py-2.5 rounded-lg bg-white dark:bg-dark-800 border text-dark-900 dark:text-dark-100 
                  placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 
                  focus:border-transparent transition-all duration-200
                  ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-dark-300 dark:border-dark-600'}
                `}
                placeholder="Confirm your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match',
                })}
                autoComplete="new-password"
                disabled={isLoading}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-500" role="alert">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                {...register('terms', { required: 'You must accept the terms' })}
              />
              <label htmlFor="terms" className="text-sm text-dark-600 dark:text-dark-400">
                I agree to the{' '}
                <a href="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">Terms of Service</a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400">Privacy Policy</a>
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
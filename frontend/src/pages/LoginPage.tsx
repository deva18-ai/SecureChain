import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
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
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-dark-600 dark:text-dark-400">Sign in to your account to continue</p>
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
              label="Email"
              type="email"
              placeholder="admin@securechain.local"
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
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              error={errors.password?.message}
              autoComplete="current-password"
              disabled={isLoading}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-dark-600 dark:text-dark-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-dark-50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
            <p className="text-xs text-dark-500 dark:text-dark-400 mb-2 font-medium">Demo Credentials (Development Only)</p>
            <div className="space-y-1 text-xs font-mono text-dark-600 dark:text-dark-400">
              <div><span className="font-medium">Admin:</span> admin@securechain.local / Admin@123</div>
              <div><span className="font-medium">Manager:</span> manager@securechain.local / Manager@123</div>
              <div><span className="font-medium">Auditor:</span> auditor@securechain.local / Auditor@123</div>
              <div><span className="font-medium">User:</span> user@securechain.local / User@123</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
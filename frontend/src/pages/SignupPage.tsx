import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
const schema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include at least one uppercase letter')
    .regex(/[0-9]/, 'Must include at least one number')
    .regex(/[!@#$%^&*]/, 'Must include at least one special character (!@#$%^&*)'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  terms: z.boolean().refine(v => v === true, 'You must accept the terms'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-400', width: '20%' };
  if (score <= 2) return { label: 'Fair', color: 'bg-orange-400', width: '40%' };
  if (score <= 3) return { label: 'Good', color: 'bg-yellow-400', width: '65%' };
  if (score <= 4) return { label: 'Strong', color: 'bg-green-400', width: '85%' };
  return { label: 'Very strong', color: 'bg-green-500', width: '100%' };
}

export default function SignupPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [, setPasswordVal] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedPassword = watch('password', '');

  const onSubmit = async (data: FormData) => {
    const result = await registerUser(data.username, data.email, data.password, data.confirmPassword);
    if (result.success) {
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } else {
      toast.error(result.message || 'Registration failed. Please try again.');
    }
  };

  const strength = watchedPassword ? getPasswordStrength(watchedPassword) : null;

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-7">
            <Link to="/" className="inline-flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-[#E03535]" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Join thousands protecting each other from scams</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                autoComplete="username"
                {...register('username')}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E03535] transition ${errors.username ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                placeholder="your_username"
              />
              {errors.username && <p className="mt-1.5 text-xs text-red-600">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E03535] transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password', { onChange: e => setPasswordVal(e.target.value) })}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E03535] transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {watchedPassword && strength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Strength: <span className="font-medium text-gray-700">{strength.label}</span>
                  </p>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E03535] transition ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  placeholder="Repeat your password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            {/* Terms */}
            <div>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  {...register('terms')}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#E03535] focus:ring-[#E03535] shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="text-[#E03535] hover:underline font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-[#E03535] hover:underline font-medium">Privacy Policy</a>
                </label>
              </div>
              {errors.terms && <p className="mt-1.5 text-xs text-red-600">{errors.terms.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#E03535] text-white font-semibold py-3 rounded-xl hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-[#E03535] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

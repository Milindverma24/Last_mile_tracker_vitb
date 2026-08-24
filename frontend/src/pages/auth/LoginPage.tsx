import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, LoginFormData } from '../../schemas/authSchema';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Mail, Lock, ArrowRight, AlertCircle, User, Truck, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'customer@gatiman.com',
      password: 'password123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await login(data);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'DELIVERY_AGENT') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Invalid email or password. Please check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoRole = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  return (
    <div className="mx-auto w-full max-w-md">
      
      {/* Welcome Title & Subtitle */}
      <div className="mb-6 text-left">
        <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-slate-900">
          Welcome to GATIMAN
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your credentials to access your delivery and logistics portal
        </p>
      </div>

      {/* Demo Quick Logins Card */}
      <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/40 p-4 shadow-2xs">
        <p className="mb-3 text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
          <span className="text-amber-600">⚡</span>
          <span>DEMO QUICK LOGINS</span>
          <span className="text-[11px] font-normal text-amber-700/90 lowercase">(click to pre-fill)</span>
        </p>
        
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setDemoRole('customer@gatiman.com')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 px-2 text-xs font-bold text-slate-800 shadow-xs hover:border-orange-500 hover:text-orange-600 transition cursor-pointer"
          >
            <User className="h-5 w-5 text-orange-600" />
            <span>Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setDemoRole('agent@gatiman.com')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 px-2 text-xs font-bold text-slate-800 shadow-xs hover:border-emerald-500 hover:text-emerald-700 transition cursor-pointer"
          >
            <Truck className="h-5 w-5 text-emerald-600" />
            <span>Driver</span>
          </button>

          <button
            type="button"
            onClick={() => setDemoRole('admin@gatiman.com')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 px-2 text-xs font-bold text-slate-800 shadow-xs hover:border-slate-800 hover:text-slate-900 transition cursor-pointer"
          >
            <Shield className="h-5 w-5 text-slate-800" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              {...register('email')}
              placeholder="customer@gatiman.com"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <a href="#" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-orange-600 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/25 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer pt-3"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Log in to GATIMAN</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Google OAuth Section */}
      <div className="mt-5">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-3 text-slate-400 font-semibold tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleSignInButton
          text="Continue with Google"
          defaultCustomerType="B2C"
          onError={(msg) => setErrorMessage(msg)}
        />
      </div>

      {/* Single Minimal Sign Up Line */}
      <div className="mt-6 pt-4 border-t border-slate-200/80 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register/customer" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
          Register as Customer
        </Link>
        {' · '}
        <Link to="/register/driver" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
          Join as Driver
        </Link>
      </div>
    </div>
  );
};

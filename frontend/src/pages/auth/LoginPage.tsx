import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, LoginFormData } from '../../schemas/authSchema';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle, Shield, Truck, User } from 'lucide-react';

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
      email: 'customer@gatiman.local',
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
      {/* Mobile Branding */}
      <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
        <img src="/logo.png" alt="GATIMAN" className="h-9 w-9 object-contain" />
        <span className="text-2xl font-black tracking-tight text-slate-900">GATIMAN</span>
      </div>

      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome to GATIMAN
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your credentials to access your logistics command center
        </p>
      </div>

      {/* Quick Demo Persona Switcher */}
      <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-900">
          🚀 Instant Demo Login (Click to Fill)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setDemoRole('admin@gatiman.local')}
            className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-500 hover:text-indigo-600"
          >
            <Shield className="h-4 w-4 text-indigo-600" />
            Admin
          </button>
          <button
            type="button"
            onClick={() => setDemoRole('agent1@gatiman.local')}
            className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-500 hover:text-indigo-600"
          >
            <Truck className="h-4 w-4 text-emerald-600" />
            Agent
          </button>
          <button
            type="button"
            onClick={() => setDemoRole('customer@gatiman.local')}
            className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-500 hover:text-indigo-600"
          >
            <User className="h-4 w-4 text-blue-600" />
            Customer
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700">Email address</label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              {...register('email')}
              placeholder="user@gatiman.local"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-700">Password</label>
            <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </a>
          </div>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Sign in to GATIMAN <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Create account
        </Link>
      </p>
    </div>
  );
};

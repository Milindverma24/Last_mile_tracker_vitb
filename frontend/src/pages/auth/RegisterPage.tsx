import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, RegisterFormData } from '../../schemas/authSchema';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, Building2, Truck, MapPin } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CUSTOMER',
      customerType: 'B2C',
      vehicleType: 'BIKE',
    },
  });

  const selectedRole = watch('role');
  const selectedCustomerType = watch('customerType');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await registerAuth(data);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'DELIVERY_AGENT') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Registration failed. Please verify the entered details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Create GATIMAN Account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Join the high-speed urban delivery logistics network
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Select Account Role
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                selectedRole === 'CUSTOMER'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <input type="radio" value="CUSTOMER" {...register('role')} className="sr-only" />
              <User className="h-4 w-4 text-indigo-600" />
              Customer
            </label>
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
                selectedRole === 'DELIVERY_AGENT'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <input type="radio" value="DELIVERY_AGENT" {...register('role')} className="sr-only" />
              <Truck className="h-4 w-4 text-emerald-600" />
              Delivery Agent
            </label>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">First Name</label>
            <input
              type="text"
              {...register('firstName')}
              placeholder="Rahul"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            {errors.firstName && <p className="mt-1 text-xs text-rose-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">Last Name</label>
            <input
              type="text"
              {...register('lastName')}
              placeholder="Sharma"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Email Address</label>
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              {...register('email')}
              placeholder="rahul@example.com"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
          <div className="relative mt-1">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              {...register('phoneNumber')}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
          {errors.phoneNumber && <p className="mt-1 text-xs text-rose-600">{errors.phoneNumber.message}</p>}
        </div>

        {/* Personal Address Information */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            <MapPin className="h-4 w-4 text-indigo-600" />
            Delivery Address & Location
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Primary Street Address</label>
            <input
              type="text"
              {...register('address')}
              placeholder="Flat 402, Royal Residency, Outer Ring Road"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">City</label>
              <input
                type="text"
                {...register('city')}
                placeholder="New Delhi"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">State</label>
              <input
                type="text"
                {...register('state')}
                placeholder="Delhi"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Logistics Postal PIN Code</label>
            <input
              type="text"
              maxLength={6}
              {...register('pinCode')}
              placeholder="110016"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Customer Persona Fields */}
        {selectedRole === 'CUSTOMER' && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Customer Category</label>
              <div className="mt-1.5 flex gap-4 text-xs font-medium text-slate-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" value="B2C" {...register('customerType')} />
                  <span>Personal (B2C)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" value="B2B" {...register('customerType')} />
                  <span>Business / Enterprise (B2B)</span>
                </label>
              </div>
            </div>

            {selectedCustomerType === 'B2B' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Company Name</label>
                  <input
                    type="text"
                    {...register('companyName')}
                    placeholder="Acme Logistics Pvt Ltd"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">GSTIN Number (Optional)</label>
                  <input
                    type="text"
                    {...register('gstNumber')}
                    placeholder="07AAAAA0000A1Z5"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Delivery Agent Fields */}
        {selectedRole === 'DELIVERY_AGENT' && (
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Vehicle Type</label>
              <select
                {...register('vehicleType')}
                className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none"
              >
                <option value="EV_SCOOTER">EV Scooter (Electric)</option>
                <option value="BIKE">Motorbike (Standard)</option>
                <option value="VAN">Cargo Van</option>
                <option value="TRUCK">Light Commercial Truck</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Vehicle Reg Number</label>
              <input
                type="text"
                {...register('vehicleNumber')}
                placeholder="DL-01-AB-1234"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>
        )}

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700">Create Password</label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Register Account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Google OAuth Register Section */}
      <div className="mt-6">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 px-3 text-slate-400 font-bold tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleSignInButton
          text="Sign up with Google"
          defaultCustomerType="B2C"
          onError={(msg) => setErrorMessage(msg)}
        />
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Log in
        </Link>
      </p>
    </div>
  );
};

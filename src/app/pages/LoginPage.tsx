import { useState } from 'react';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import { signIn } from '../../lib/api';
import { supabase } from '../../lib/supabase';

import logoUrl from '../components/logo.jpg';

interface LoginPageProps {
  onLogin: () => void;
  onGoToRegister: () => void;
  onGoToForgot: () => void;
}

export function LoginPage({ onLogin, onGoToRegister, onGoToForgot }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #8b3a1a 0%, #b8652f 45%, #d4a574 100%)',
        }}
      >
        {/* Adinkra-inspired geometric overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="adinkra" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="24" fill="none" stroke="#fff" strokeWidth="1.5" />
                <circle cx="40" cy="40" r="12" fill="none" stroke="#fff" strokeWidth="1" />
                <line x1="40" y1="16" x2="40" y2="64" stroke="#fff" strokeWidth="1" />
                <line x1="16" y1="40" x2="64" y2="40" stroke="#fff" strokeWidth="1" />
                <line x1="23" y1="23" x2="57" y2="57" stroke="#fff" strokeWidth="0.7" />
                <line x1="57" y1="23" x2="23" y2="57" stroke="#fff" strokeWidth="0.7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#adinkra)" />
          </svg>
        </div>

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <img
            src={logoUrl}
            alt="Ubuntu Essence"
            className="w-9 h-9 object-contain invert mix-blend-screen"
          />
          <span className="text-2xl tracking-widest text-white font-medium">UBUNTU ESSENCE</span>
        </div>

        {/* Quote */}
        <div className="relative">
          <p className="text-4xl leading-snug text-white font-medium mb-6">
            "I am because<br />we are."
          </p>
          <p className="text-white/70 text-sm tracking-wide uppercase">
            Ubuntu — African philosophy of community
          </p>
          <div className="mt-10 flex gap-2">
            <span className="w-8 h-1 rounded-full bg-white/80" />
            <span className="w-3 h-1 rounded-full bg-white/40" />
            <span className="w-3 h-1 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-background">
        {/* Mobile brand */}
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <img
            src={logoUrl}
            alt="Ubuntu Essence"
            className="w-7 h-7 object-contain mix-blend-multiply dark:invert dark:mix-blend-screen"
          />
          <span className="text-xl tracking-widest text-primary font-medium">UBUNTU ESSENCE</span>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <h1 className="text-3xl text-foreground mb-1">Welcome back</h1>
          <p className="text-muted-foreground mb-10 text-sm">Sign in to continue your journey.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm text-foreground mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onGoToForgot}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social options */}
          <div className="space-y-3">
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="w-full py-3 rounded-lg border border-border bg-background hover:bg-muted/40 transition-colors flex items-center justify-center gap-3 text-sm text-foreground">
              <GoogleIcon />
              Continue with Google
            </button>
            <button className="w-full py-3 rounded-lg border border-border bg-background hover:bg-muted/40 transition-colors flex items-center justify-center gap-3 text-sm text-foreground">
              <FacebookIcon />
              Continue with Facebook
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            New to Ubuntu Essence?{' '}
            <button onClick={onGoToRegister} className="text-primary hover:underline">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

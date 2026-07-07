import { useState } from 'react';
import { BookOpen, Check } from 'lucide-react';
import { updatePassword } from '../../lib/api';
import logoUrl from '../components/logo.jpg';

interface UpdatePasswordPageProps {
  onDone: () => void;
}

export function UpdatePasswordPage({ onDone }: UpdatePasswordPageProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl text-foreground mb-2">Password updated</h2>
          <p className="text-muted-foreground text-sm mb-6">Your password has been changed successfully. Sign in with your new password.</p>
          <button onClick={onDone} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden" style={{ background: 'linear-gradient(160deg, #8b3a1a 0%, #b8652f 45%, #d4a574 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs><pattern id="pwd" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="24" fill="none" stroke="#fff" strokeWidth="1.5" />
              <circle cx="40" cy="40" r="12" fill="none" stroke="#fff" strokeWidth="1" />
              <line x1="40" y1="16" x2="40" y2="64" stroke="#fff" strokeWidth="1" />
              <line x1="16" y1="40" x2="64" y2="40" stroke="#fff" strokeWidth="1" />
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#pwd)" />
          </svg>
        </div>
        <div className="relative flex items-center gap-3">
          <img
            src={logoUrl}
            alt="Ubuntu Essence"
            className="w-9 h-9 object-contain invert mix-blend-screen"
          />
          <span className="text-2xl tracking-widest text-white font-medium">UBUNTU ESSENCE</span>
        </div>
        <div className="relative">
          <p className="text-4xl leading-snug text-white font-medium mb-6">&ldquo;A new beginning<br />starts with you.&rdquo;</p>
          <p className="text-white/70 text-sm tracking-wide uppercase">Set a strong password to continue</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-background">
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <img
            src={logoUrl}
            alt="Ubuntu Essence"
            className="w-7 h-7 object-contain mix-blend-multiply dark:invert dark:mix-blend-screen"
          />
          <span className="text-xl tracking-widest text-primary font-medium">UBUNTU ESSENCE</span>
        </div>
        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <h1 className="text-3xl text-foreground mb-1">Reset your password</h1>
          <p className="text-muted-foreground mb-10 text-sm">Choose a new password for your account.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="block text-sm text-foreground mb-1.5">New password</label>
              <input id="new-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" minLength={8} className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60" />
            </div>
            {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>}
            <button type="submit" disabled={loading || password.length < 8} className="w-full py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60">
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

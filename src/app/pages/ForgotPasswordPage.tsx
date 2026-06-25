import { useState } from 'react';
import { BookOpen, ArrowLeft, Mail } from 'lucide-react';
import { resetPassword } from '../../lib/api';

interface ForgotPasswordPageProps {
  onGoToLogin: () => void;
}

export function ForgotPasswordPage({ onGoToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
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
          background: 'linear-gradient(160deg, #cc7722 0%, #b8652f 50%, #8b3a1a 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="sankofa" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="35" fill="none" stroke="#fff" strokeWidth="1.2" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="#fff" strokeWidth="0.8" />
                <circle cx="50" cy="50" r="6" fill="none" stroke="#fff" strokeWidth="1" />
                <path d="M50 15 Q70 30 50 50 Q30 30 50 15" fill="none" stroke="#fff" strokeWidth="1" />
                <path d="M85 50 Q70 70 50 50 Q70 30 85 50" fill="none" stroke="#fff" strokeWidth="1" />
                <path d="M50 85 Q30 70 50 50 Q70 70 50 85" fill="none" stroke="#fff" strokeWidth="1" />
                <path d="M15 50 Q30 30 50 50 Q30 70 15 50" fill="none" stroke="#fff" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sankofa)" />
          </svg>
        </div>

        <div className="relative flex items-center gap-3">
          <BookOpen className="w-9 h-9 text-white" />
          <span className="text-2xl tracking-widest text-white font-medium">UBUNTU ESSENCE</span>
        </div>

        <div className="relative">
          <p className="text-white/60 text-xs tracking-widest uppercase mb-4">Sankofa</p>
          <p className="text-3xl leading-snug text-white font-medium mb-4">
            "It is not wrong<br />to go back and<br />retrieve what<br />you forgot."
          </p>
          <p className="text-white/60 text-sm">Akan proverb, Ghana</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-background">
        <div className="flex items-center gap-2 mb-10 lg:hidden">
          <BookOpen className="w-7 h-7 text-primary" />
          <span className="text-xl tracking-widest text-primary font-medium">UBUNTU ESSENCE</span>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <button
            onClick={onGoToLogin}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </button>

          {!sent ? (
            <>
              <h1 className="text-3xl text-foreground mb-1">Reset password</h1>
              <p className="text-muted-foreground mb-10 text-sm">
                Enter your email and we will send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="reset-email" className="block text-sm text-foreground mb-1.5">
                    Email address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
                  />
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
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl text-foreground mb-3">Check your inbox</h2>
              <p className="text-muted-foreground text-sm mb-2">
                We sent a password reset link to
              </p>
              <p className="text-foreground text-sm font-medium mb-8">{email}</p>
              <p className="text-xs text-muted-foreground mb-6">
                Didn't receive it? Check your spam folder, or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-primary hover:underline"
                >
                  try again
                </button>
                .
              </p>
              <button
                onClick={onGoToLogin}
                className="w-full py-3 rounded-lg border border-border text-foreground hover:bg-muted/40 transition-colors text-sm"
              >
                Return to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

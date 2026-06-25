import { useState } from 'react';
import { Eye, EyeOff, BookOpen, Check } from 'lucide-react';
import { signUp, subscribeToNewsletter } from '../../lib/api';

const interests = ['Culture', 'Fashion', 'Heritage', 'Arts', 'Travel', 'Lifestyle'];

interface RegisterPageProps {
  onRegister: () => void;
  onGoToLogin: () => void;
}

export function RegisterPage({ onRegister, onGoToLogin }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    newsletter: true,
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp(form.email, form.password, `${form.firstName} ${form.lastName}`);
      if (form.newsletter) {
        try { await subscribeToNewsletter(form.email); } catch {}
      }
      onRegister();
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-2/5 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #2d1810 0%, #8b3a1a 60%, #b8652f 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="kente" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="60" height="60" fill="none" />
                <rect x="5" y="5" width="50" height="50" fill="none" stroke="#fff" strokeWidth="0.8" />
                <rect x="15" y="15" width="30" height="30" fill="none" stroke="#fff" strokeWidth="0.8" />
                <line x1="5" y1="5" x2="55" y2="55" stroke="#fff" strokeWidth="0.5" />
                <line x1="55" y1="5" x2="5" y2="55" stroke="#fff" strokeWidth="0.5" />
                <circle cx="30" cy="30" r="6" fill="none" stroke="#fff" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#kente)" />
          </svg>
        </div>

        <div className="relative flex items-center gap-3">
          <BookOpen className="w-9 h-9 text-white" />
          <span className="text-2xl tracking-widest text-white font-medium">UBUNTU ESSENCE</span>
        </div>

        <div className="relative space-y-6">
          <div className="space-y-3">
            {['Stories that celebrate African heritage.', 'Culture that connects the diaspora.', 'A community rooted in togetherness.'].map((line, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{line}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-white/50 text-xs tracking-wide uppercase mb-3">Trusted by readers across</p>
            <div className="flex gap-3 flex-wrap">
              {['Lagos', 'Accra', 'Nairobi', 'Johannesburg', 'London', 'New York'].map((city) => (
                <span key={city} className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14 bg-background">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <BookOpen className="w-7 h-7 text-primary" />
          <span className="text-xl tracking-widest text-primary font-medium">UBUNTU ESSENCE</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <h1 className="text-3xl text-foreground mb-1">Join the community</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            Create your account and start reading stories that matter.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-foreground mb-1.5">First name</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Amara"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <div>
                <label className="block text-sm text-foreground mb-1.5">Last name</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Okafor"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-foreground mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  minLength={8}
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
              {/* Strength meter */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      form.password.length >= level * 2
                        ? level <= 2
                          ? 'bg-amber-500'
                          : 'bg-primary'
                        : 'bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm text-foreground mb-3">
                What are you interested in?{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => {
                  const active = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <input
                id="newsletter"
                type="checkbox"
                checked={form.newsletter}
                onChange={(e) => setForm({ ...form, newsletter: e.target.checked })}
                className="w-4 h-4 mt-0.5 rounded border-border accent-primary flex-shrink-0"
              />
              <label htmlFor="newsletter" className="text-sm text-foreground font-normal leading-relaxed">
                Send me the weekly Ubuntu Essence digest — curated stories celebrating African culture and heritage.
              </label>
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              By creating an account you agree to our{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button onClick={onGoToLogin} className="text-primary hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

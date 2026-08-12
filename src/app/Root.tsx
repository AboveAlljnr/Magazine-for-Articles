import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import App from './App';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { getCurrentSession, onAuthChange, signOut, getProfile } from '../lib/api';
import { ErrorBoundary } from '../lib/ErrorBoundary';
import { Analytics } from '@vercel/analytics/react';

export default function Root() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; name: string; isAdmin: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInPrompt, setSignInPrompt] = useState(true);

  /* ── Auth bootstrap ─────────────────────────────────────────────── */

  useEffect(() => {
    getCurrentSession()
      .then(({ data: { session } }) => {
        if (session?.user) resolveUser(session.user.id);
        else setLoading(false);
      })
      .catch(() => setLoading(false));

    const sub = onAuthChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session?.user) {
        setUser({ id: session.user.id, name: session.user.email?.split('@')[0] || 'User', isAdmin: false });
        navigate('/update-password');
      } else if (session?.user) {
        resolveUser(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => sub.unsubscribe();
  }, []);

  /* ── Sign-in prompt — reset timer on user activity ──────────────── */

  useEffect(() => {
    const seen = sessionStorage.getItem('signin-prompt-seen');
    if (seen) { setSignInPrompt(false); return; }

    let timer: ReturnType<typeof setTimeout>;

    function resetTimer() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSignInPrompt(false);
        sessionStorage.setItem('signin-prompt-seen', '1');
      }, 8000);
    }

    resetTimer();
    window.addEventListener('scroll', resetTimer, { passive: true });
    window.addEventListener('click', resetTimer);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, []);

  async function resolveUser(userId: string) {
    try {
      const profile = await getProfile(userId);
      setUser({ id: userId, name: profile.display_name, isAdmin: profile.is_admin });
    } catch {
      setUser({ id: userId, name: 'Reader', isAdmin: false });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
    navigate('/login');
  }

  /* ── Loading spinner ────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Routes ─────────────────────────────────────────────────────── */

  return (
    <ErrorBoundary>
      <Analytics />
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={() => navigate('/')}
              onGoToRegister={() => navigate('/register')}
              onGoToForgot={() => navigate('/forgot-password')}
            />
          }
        />
        <Route
          path="/register"
          element={
            <RegisterPage
              onRegister={() => navigate('/')}
              onGoToLogin={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage onGoToLogin={() => navigate('/login')} />}
        />
        <Route
          path="/update-password"
          element={<UpdatePasswordPage onDone={() => { setUser(null); navigate('/login'); }} />}
        />
        {/* Main app — handles all magazine routes */}
        <Route
          path="/*"
          element={
            <App
              user={user}
              onLogout={handleLogout}
              onGoToLogin={() => navigate('/login')}
              showSignInPrompt={signInPrompt && !user}
              onDismissSignInPrompt={() => setSignInPrompt(false)}
            />
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

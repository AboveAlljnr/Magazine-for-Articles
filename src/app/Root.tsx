import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import App from './App';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { getCurrentSession, onAuthChange, signOut, getProfile } from '../lib/api';
import { ErrorBoundary } from '../lib/ErrorBoundary';

type View = 'login' | 'register' | 'forgot' | 'update-password' | 'app';

const PAGE = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: 'easeOut' },
};

export default function Root() {
  const [view, setView] = useState<View>('app');
  const [user, setUser] = useState<{ id: string; name: string; isAdmin: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInPrompt, setSignInPrompt] = useState(true);

  useEffect(() => {
    getCurrentSession().then(({ data: { session } }) => {
      if (session?.user) {
        resolveUser(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));

    const sub = onAuthChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session?.user) {
        setUser({ id: session.user.id, name: session.user.email?.split('@')[0] || 'User', isAdmin: false });
        setView('update-password');
      } else if (session?.user) {
        resolveUser(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const seen = sessionStorage.getItem('signin-prompt-seen');
    if (seen) { setSignInPrompt(false); return; }
    const timer = setTimeout(() => {
      setSignInPrompt(false);
      sessionStorage.setItem('signin-prompt-seen', '1');
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  async function resolveUser(userId: string) {
    try {
      const profile = await getProfile(userId);
      setUser({ id: userId, name: profile.display_name, isAdmin: profile.is_admin });
      setView('app');
    } catch {
      setUser({ id: userId, name: 'Reader', isAdmin: false });
      setView('app');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    try {
      const { data: { session } } = await getCurrentSession();
      if (session?.user) resolveUser(session.user.id);
    } catch {}
  }

  async function handleRegister() {
    try {
      const { data: { session } } = await getCurrentSession();
      if (session?.user) resolveUser(session.user.id);
    } catch {}
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
    setView('login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {view === 'login' ? (
        <motion.div key="login" {...PAGE}>
          <LoginPage
            onLogin={handleLogin}
            onGoToRegister={() => setView('register')}
            onGoToForgot={() => setView('forgot')}
          />
        </motion.div>
      ) : view === 'register' ? (
        <motion.div key="register" {...PAGE}>
          <RegisterPage
            onRegister={handleRegister}
            onGoToLogin={() => setView('login')}
          />
        </motion.div>
      ) : view === 'forgot' ? (
        <motion.div key="forgot" {...PAGE}>
          <ForgotPasswordPage
            onGoToLogin={() => setView('login')}
          />
        </motion.div>
      ) : view === 'update-password' ? (
        <motion.div key="update-password" {...PAGE}>
          <UpdatePasswordPage
            onDone={() => { setUser(null); setView('login'); }}
          />
        </motion.div>
      ) : (
        <App user={user} onLogout={handleLogout} onGoToLogin={() => setView('login')} showSignInPrompt={signInPrompt && !user} onDismissSignInPrompt={() => setSignInPrompt(false)} />
      )}
    </ErrorBoundary>
  );
}

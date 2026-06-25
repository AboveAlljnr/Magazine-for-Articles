import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import App from './App';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { getCurrentSession, onAuthChange, signOut, getProfile } from '../lib/api';
import { ErrorBoundary } from '../lib/ErrorBoundary';

type View = 'login' | 'register' | 'forgot' | 'app';

const PAGE = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: 'easeOut' },
};

export default function Root() {
  const [view, setView] = useState<View>('login');
  const [user, setUser] = useState<{ id: string; name: string; isAdmin: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentSession().then(({ data: { session } }) => {
      if (session?.user) {
        resolveUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const sub = onAuthChange((session) => {
      if (session?.user) {
        resolveUser(session.user.id);
      } else {
        setUser(null);
        setView('login');
      }
    });

    return () => sub.unsubscribe();
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
    const { data: { session } } = await getCurrentSession();
    if (session?.user) resolveUser(session.user.id);
  }

  async function handleRegister() {
    const { data: { session } } = await getCurrentSession();
    if (session?.user) resolveUser(session.user.id);
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

  if (view === 'login') {
    return (
      <motion.div key="login" {...PAGE}>
        <LoginPage
          onLogin={handleLogin}
          onGoToRegister={() => setView('register')}
          onGoToForgot={() => setView('forgot')}
        />
      </motion.div>
    );
  }

  if (view === 'register') {
    return (
      <motion.div key="register" {...PAGE}>
        <RegisterPage
          onRegister={handleRegister}
          onGoToLogin={() => setView('login')}
        />
      </motion.div>
    );
  }

  if (view === 'forgot') {
    return (
      <motion.div key="forgot" {...PAGE}>
        <ForgotPasswordPage
          onGoToLogin={() => setView('login')}
        />
      </motion.div>
    );
  }

  return <ErrorBoundary><App user={user} onLogout={handleLogout} onGoToLogin={() => setView('login')} /></ErrorBoundary>;
}

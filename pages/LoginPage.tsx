import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const DxnLogo = () => (
    <img 
        src="https://lh3.googleusercontent.com/d/1JVW882aiQIHcc91tEhn9_fOjRSOJFkS8"
        alt="DXN App Logo"
        className="h-16 w-auto mx-auto"
    />
);

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, t } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (success) {
      navigate('/admin');
    } else {
      setError(t('invalidCredentials'));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-2xl">
        <div className="text-center">
            <DxnLogo />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary">
            {t('merchantArea')}
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">{t('username')}</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-border bg-input-bg placeholder-text-secondary text-text-primary rounded-t-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder={t('username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{t('password')}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-border bg-input-bg placeholder-text-secondary text-text-primary rounded-b-md focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {t('login')}
            </button>
          </div>
        </form>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-xs text-text-secondary uppercase">{t('orSeparator')}</span>
            <div className="flex-grow border-t border-border"></div>
        </div>
        
        <div>
            <Link
              to="/"
              className="group relative w-full flex justify-center py-3 px-4 border border-border text-sm font-medium rounded-md text-text-primary bg-input-bg hover:bg-card-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-accent"
            >
              {t('backToCustomerView')}
            </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
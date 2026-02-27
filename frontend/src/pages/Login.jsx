import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError('');

      try {
        await login(value);
        navigate({ to: '/profile' });
      } catch {
        setError('Invalid credentials.');
      }
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <div className="bg-cusens-bg font-display min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto bg-cusens-surface rounded-3xl shadow-xl overflow-hidden border border-cusens-border relative">
        <div className="px-8 pt-8 pb-10 flex flex-col h-full min-h-[600px]">
          <div className="flex flex-col items-center justify-center mt-4 mb-10">
            <div className="w-20 h-20 bg-cusens-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <span className="material-icons text-5xl text-cusens-primary">account_balance</span>
            </div>
            <h1 className="text-3xl font-bold text-cusens-text-primary tracking-tight">CUSENS</h1>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <form.Field name="email">
              {(field) => (
                <div className="group">
                  <label className="block text-sm font-medium text-cusens-text-primary mb-1.5 ml-1" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-icons text-cusens-text-secondary text-xl group-focus-within:text-cusens-primary transition-colors">
                        mail_outline
                      </span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-3 py-3 border border-cusens-border rounded-xl leading-5 bg-cusens-bg text-cusens-text-primary placeholder-cusens-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-cusens-primary focus:border-cusens-primary sm:text-sm transition duration-200 ease-in-out"
                      id="email"
                      name="email"
                      type="email"
                      placeholder="citizen@example.eu"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div className="group">
                  <label className="block text-sm font-medium text-cusens-text-primary mb-1.5 ml-1" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-icons text-cusens-text-secondary text-xl group-focus-within:text-cusens-primary transition-colors">
                        lock_outline
                      </span>
                    </div>
                    <input
                      className="block w-full pl-10 pr-10 py-3 border border-cusens-border rounded-xl leading-5 bg-cusens-bg text-cusens-text-primary placeholder-cusens-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-cusens-primary focus:border-cusens-primary sm:text-sm transition duration-200 ease-in-out"
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-icons text-cusens-text-secondary hover:text-cusens-text-primary text-xl transition-colors">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </form.Field>

            <div className="flex items-center justify-between">
              {error ? (
                <div className="text-red-600 text-xs font-medium" id="error-message">
                  {error}
                </div>
              ) : (
                <div />
              )}
              <button
                className="text-sm font-semibold text-cusens-text-secondary hover:text-cusens-primary ml-auto transition-colors"
                type="button"
              >
                Forgot password?
              </button>
            </div>

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <button
                  className="w-full flex justify-center py-3.5 px-4 border border-cusens-primary rounded-xl shadow-md text-sm font-bold text-cusens-text-primary bg-cusens-primary hover:bg-cusens-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cusens-primary transition-all duration-200 transform hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Log In'}
                </button>
              )}
            </form.Subscribe>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cusens-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-cusens-surface text-cusens-text-secondary text-xs uppercase tracking-wide">Or</span>
              </div>
            </div>

            <button
              className="w-full flex justify-center py-3.5 px-4 border border-cusens-border rounded-xl shadow-sm text-sm font-semibold text-cusens-text-primary bg-cusens-surface hover:bg-cusens-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cusens-border transition-all duration-200"
              type="button"
            >
              Continue as Guest
            </button>
          </form>

          <div className="mt-auto pt-8 text-center">
            <p className="text-sm text-cusens-text-secondary">
              New to CUSENS?
              <Link
                className="font-bold text-cusens-primary hover:text-cusens-primary-hover transition-colors ml-1"
                to="/register"
              >
                Create Account
              </Link>
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <span className="w-1 h-1 rounded-full bg-cusens-border"></span>
              <span className="w-1 h-1 rounded-full bg-cusens-border"></span>
              <span className="w-1 h-1 rounded-full bg-cusens-border"></span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 left-0 right-0 flex justify-center pb-2 pointer-events-none">
          <div className="w-32 h-1.5 bg-cusens-dark/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;

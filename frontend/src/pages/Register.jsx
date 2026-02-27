import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from '@tanstack/react-router';
import InputField from '../components/InputField';
import Button from '../components/Button';
import getFieldError from '../forms/getFieldError';
import useFormSubmitHandler from '../forms/useFormSubmitHandler';
import { registerUser } from '../requests';

const Register = () => {
  const router = useRouter();
  const [error, setError] = useState(null);

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: 'Belgium',
      language: 'English',
      agreePrivacy: false,
      subscribeNewsletter: false,
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        await registerUser({
          email: value.email,
          password: value.password,
        });

        router.navigate({
          to: '/login',
          search: { message: 'Registration successful! Please log in.' },
        });
      } catch (submitError) {
        console.error('Registration failed:', submitError);
        console.error('Error response:', submitError.response);
        console.error('Error message:', submitError.message);
        console.error('Error code:', submitError.code);

        setError(
          submitError.response?.data?.message ||
            submitError.message ||
            'Registration failed. Please try again.',
        );
      }
    },
  });

  const handleSubmit = useFormSubmitHandler(form);

  const handleGoBack = () => {
    router.history.back();
  };

  return (
    <div className="w-full max-w-md bg-cusens-bg min-h-screen flex flex-col relative shadow-2xl overflow-hidden">
      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-cusens-bg/95 backdrop-blur-md">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-cusens-surface-muted transition-colors text-cusens-primary"
          onClick={handleGoBack}
        >
          <span className="material-icons">chevron_left</span>
        </button>
        <div className="font-display font-bold text-lg tracking-tight text-cusens-primary">CUSENS</div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        <div className="mt-2 mb-8">
          <h1 className="text-2xl font-bold mb-2 text-cusens-text-primary">Create your Account</h1>
          <p className="text-sm text-cusens-text-secondary">Join the movement for a transparent Europe.</p>
        </div>

        <form className="space-y-6" id="register-form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <form.Field name="fullName">
              {(field) => (
                <InputField
                  label="Full Name"
                  id="fullname"
                  name="fullname"
                  type="text"
                  placeholder="Full Name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <InputField
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  required
                />
              )}
            </form.Field>

            <div className="flex gap-4">
              <div className="w-1/2">
                <form.Field name="password">
                  {(field) => (
                    <InputField
                      label="Password"
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      required
                    />
                  )}
                </form.Field>
              </div>
              <div className="w-1/2">
                <form.Field
                  name="confirmPassword"
                  validators={{
                    onChangeListenTo: ['password'],
                    onChange: ({ value, fieldApi }) => {
                      const passwordValue = fieldApi.form.getFieldValue('password');
                      if (value && passwordValue && value !== passwordValue) {
                        return 'Passwords do not match.';
                      }
                      return undefined;
                    },
                    onSubmit: ({ value, fieldApi }) => {
                      const passwordValue = fieldApi.form.getFieldValue('password');
                      if (passwordValue !== value) {
                        return 'Passwords do not match.';
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <InputField
                      label="Confirm"
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      placeholder="Confirm Password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      error={getFieldError(field.state.meta.errors)}
                      required
                    />
                  )}
                </form.Field>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-cusens-border my-6"></div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cusens-text-secondary mb-2">
              Preferences
            </h2>
            <form.Field name="country">
              {(field) => (
                <div className="relative">
                  <select
                    className="appearance-none block w-full px-4 py-3.5 bg-cusens-surface border border-cusens-border rounded-xl text-cusens-text-primary focus:outline-none focus:ring-2 focus:ring-cusens-primary focus:border-transparent transition-all"
                    id="country"
                    name="country"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  >
                    <option>Belgium</option>
                    <option>France</option>
                    <option>Germany</option>
                    <option>Netherlands</option>
                    <option>Spain</option>
                    <option>Italy</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cusens-text-secondary">
                    <span className="material-icons">expand_more</span>
                  </div>
                  <label
                    className="absolute -top-2.5 left-3 px-1 bg-cusens-bg text-xs text-cusens-text-secondary"
                    htmlFor="country"
                  >
                    Country
                  </label>
                </div>
              )}
            </form.Field>

            <form.Field name="language">
              {(field) => (
                <div className="relative">
                  <select
                    className="appearance-none block w-full px-4 py-3.5 bg-cusens-surface border border-cusens-border rounded-xl text-cusens-text-primary focus:outline-none focus:ring-2 focus:ring-cusens-primary focus:border-transparent transition-all"
                    id="language"
                    name="language"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  >
                    <option>English</option>
                    <option>Français</option>
                    <option>Deutsch</option>
                    <option>Nederlands</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cusens-text-secondary">
                    <span className="material-icons">expand_more</span>
                  </div>
                  <label
                    className="absolute -top-2.5 left-3 px-1 bg-cusens-bg text-xs text-cusens-text-secondary"
                    htmlFor="language"
                  >
                    Language
                  </label>
                </div>
              )}
            </form.Field>
          </div>

          <div className="bg-cusens-green-light border border-cusens-green/20 p-4 rounded-xl flex gap-3 items-start mt-6">
            <span className="material-icons text-cusens-green text-xl mt-0.5">verified_user</span>
            <div>
              <h3 className="text-xs font-bold text-cusens-green mb-1">Why we ask</h3>
              <p className="text-xs text-cusens-text-secondary leading-relaxed">
                We collect your country and language preferences to connect you with relevant local
                initiatives and community discussions. We do not sell your data.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <form.Field
              name="agreePrivacy"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) {
                    return 'You must agree to the Privacy Policy.';
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label className="flex items-start gap-3 group cursor-pointer">
                    <div className="relative flex items-center pt-0.5">
                      <input
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-cusens-border checked:bg-cusens-primary checked:border-cusens-primary focus:ring-2 focus:ring-cusens-primary/30 transition-all"
                        type="checkbox"
                        checked={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.checked)}
                      />
                      <span className="material-icons absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none">
                        check
                      </span>
                    </div>
                    <div className="text-sm text-cusens-text-secondary select-none">
                      I agree to the{' '}
                      <Link
                        to="/privacy-policy"
                        className="text-cusens-primary font-medium hover:underline underline-offset-2"
                      >
                        Privacy Policy
                      </Link>{' '}
                      <span className="text-red-500">*</span>
                    </div>
                  </label>

                  {getFieldError(field.state.meta.errors) && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError(field.state.meta.errors)}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="subscribeNewsletter">
              {(field) => (
                <label className="flex items-start gap-3 group cursor-pointer">
                  <div className="relative flex items-center pt-0.5">
                    <input
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-cusens-border checked:bg-cusens-primary checked:border-cusens-primary focus:ring-2 focus:ring-cusens-primary/30 transition-all"
                      type="checkbox"
                      checked={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.checked)}
                    />
                    <span className="material-icons absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none">
                      check
                    </span>
                  </div>
                  <div className="text-sm text-cusens-text-secondary select-none">
                    Subscribe to the newsletter for updates on civic initiatives.
                  </div>
                </label>
              )}
            </form.Field>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}
      </main>

      <div className="absolute bottom-0 left-0 w-full bg-cusens-bg border-t border-cusens-border p-6 safe-pb z-20">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" form="register-form" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
              <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Button>
          )}
        </form.Subscribe>

        <div className="mt-4 text-center">
          <p className="text-sm text-cusens-text-secondary">
            Already have an account?
            <Link to="/login" className="text-cusens-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, useRouter } from '@tanstack/react-router';
import InputField from '../components/InputField';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import getFieldError from '../forms/getFieldError';
import useFormSubmitHandler from '../forms/useFormSubmitHandler';
import { registerUser } from '../requests';

const requiredTrimmedValidator = (fieldName) => ({
  onChange: ({ value }) => {
    if (!value.trim()) {
      return `${fieldName} is required.`;
    }
    return undefined;
  },
  onSubmit: ({ value }) => {
    if (!value.trim()) {
      return `${fieldName} is required.`;
    }
    return undefined;
  },
});

const Register = () => {
  const router = useRouter();
  const [error, setError] = useState(null);

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      referralCode: '',
      agreePrivacy: false,
      subscribeNewsletter: false,
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const firstName = value.firstName.trim();
        const lastName = value.lastName.trim();
        const payload = {
          email: value.email,
          password: value.password,
          userProfile: {
            firstName,
            lastName,
          },
        };
        if (value.referralCode.trim()) {
          payload.referralCode = value.referralCode.trim().toUpperCase();
        }
        await registerUser(payload);

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
        <BrandLogo size="xs" />
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        <div className="mt-2 mb-8">
          <h1 className="text-2xl font-bold mb-2 text-cusens-text-primary">Create your Account</h1>
          <p className="text-sm text-cusens-text-secondary">Join the movement for a transparent Europe.</p>
        </div>

        <form className="space-y-6" id="register-form" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <form.Field name="firstName" validators={requiredTrimmedValidator('First name')}>
                  {(field) => (
                    <InputField
                      label="First Name"
                      id="first-name"
                      name="first-name"
                      type="text"
                      placeholder="First Name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      error={getFieldError(field.state.meta.errors)}
                      required
                    />
                  )}
                </form.Field>
              </div>
              <div className="w-1/2">
                <form.Field name="lastName" validators={requiredTrimmedValidator('Last name')}>
                  {(field) => (
                    <InputField
                      label="Last Name"
                      id="last-name"
                      name="last-name"
                      type="text"
                      placeholder="Last Name"
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

            <form.Field name="referralCode">
              {(field) => (
                <InputField
                  label="Referral Code (Optional)"
                  id="referral-code"
                  name="referral-code"
                  type="text"
                  placeholder="Enter 4-character code"
                  maxLength={4}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value.toUpperCase())}
                />
              )}
            </form.Field>
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

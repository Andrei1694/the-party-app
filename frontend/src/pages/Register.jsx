import React, { useState } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { registerUser } from '../requests';

const Register = () => {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [country, setCountry] = useState('Belgium');
    const [language, setLanguage] = useState('English');
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [passwordMismatchError, setPasswordMismatchError] = useState(null);

    React.useEffect(() => {
        if (password && confirmPassword && password !== confirmPassword) {
            setPasswordMismatchError("Passwords do not match.");
        } else {
            setPasswordMismatchError(null);
        }
    }, [password, confirmPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (passwordMismatchError) {
            setError(passwordMismatchError); // Set general error for submission attempt
            return;
        }

        if (!agreePrivacy) {
            setError("You must agree to the Privacy Policy.");
            return;
        }

        setIsLoading(true);

        try {
            const userData = {
                email,
                password,
            };
            await registerUser(userData);
            // Optionally, show a success message before navigating
            router.navigate({ to: '/login', search: { message: 'Registration successful! Please log in.' } });
        } catch (err) {
            console.error('Registration failed:', err);
            // Log full error details for debugging
            console.error('Error response:', err.response);
            console.error('Error message:', err.message);
            console.error('Error code:', err.code);

            // Display a more user-friendly error message based on the API response
            setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = () => {
        router.history.back(); // Go back to the previous page
    };

    return (
        <div className="w-full max-w-md bg-cusens-bg min-h-screen flex flex-col relative shadow-2xl overflow-hidden">
            {/* Removed static time and battery indicators as they are typically part of a global layout or OS */}

            <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-cusens-bg/95 backdrop-blur-md">
                <button className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-200 transition-colors text-cusens-blue" onClick={handleGoBack}>
                    <span className="material-icons">chevron_left</span>
                </button>
                <div className="font-bold text-lg tracking-tight text-cusens-blue">CUSENS</div>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
                <div className="mt-2 mb-8">
                    <h1 className="text-2xl font-bold mb-2 text-cusens-text-primary">Create your Account</h1>
                    <p className="text-sm text-cusens-text-secondary">Join the movement for a transparent Europe.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <InputField
                            label="Full Name"
                            id="fullname"
                            name="fullname"
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        <InputField
                            label="Email Address"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <InputField
                                    label="Password"
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    // showVisibilityToggle={true} // Can be enabled if needed
                                />
                            </div>
                            <div className="w-1/2">
                                <InputField
                                    label="Confirm" // Changed from "Confirm Password" for brevity in label
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    error={passwordMismatchError}
                                    // showVisibilityToggle={true} // Can be enabled if needed
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-gray-200 my-6"></div>

                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-cusens-text-secondary mb-2">Preferences</h2>
                        <div className="relative">
                            <select
                                className="appearance-none block w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-cusens-text-primary focus:outline-none focus:ring-2 focus:ring-cusens-blue focus:border-transparent transition-all"
                                id="country"
                                name="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
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
                            <label className="absolute -top-2.5 left-3 px-1 bg-cusens-bg text-xs text-cusens-text-secondary" htmlFor="country">Country</label>
                        </div>
                        <div className="relative">
                            <select
                                className="appearance-none block w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl text-cusens-text-primary focus:outline-none focus:ring-2 focus:ring-cusens-blue focus:border-transparent transition-all"
                                id="language"
                                name="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                            >
                                <option>English</option>
                                <option>Français</option>
                                <option>Deutsch</option>
                                <option>Nederlands</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cusens-text-secondary">
                                <span className="material-icons">expand_more</span>
                            </div>
                            <label className="absolute -top-2.5 left-3 px-1 bg-cusens-bg text-xs text-cusens-text-secondary" htmlFor="language">Language</label>
                        </div>
                    </div>

                    <div className="bg-cusens-green-light border border-cusens-green/20 p-4 rounded-xl flex gap-3 items-start mt-6">
                        <span className="material-icons text-cusens-green text-xl mt-0.5">verified_user</span>
                        <div>
                            <h3 className="text-xs font-bold text-cusens-green mb-1">Why we ask</h3>
                            <p className="text-xs text-cusens-text-secondary leading-relaxed">
                                We collect your country and language preferences to connect you with relevant local initiatives and community discussions. We do not sell your data.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <label className="flex items-start gap-3 group cursor-pointer">
                            <div className="relative flex items-center pt-0.5">
                                <input
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 checked:bg-cusens-blue checked:border-cusens-blue focus:ring-2 focus:ring-cusens-blue/30 transition-all"
                                    required
                                    type="checkbox"
                                    checked={agreePrivacy}
                                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                                />
                                <span className="material-icons absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
                            </div>
                            <div className="text-sm text-cusens-text-secondary select-none">
                                I agree to the <Link to="/privacy-policy" className="text-cusens-blue font-medium hover:underline underline-offset-2">Privacy Policy</Link> <span className="text-red-500">*</span>
                            </div>
                        </label>
                        <label className="flex items-start gap-3 group cursor-pointer">
                            <div className="relative flex items-center pt-0.5">
                                <input
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 checked:bg-cusens-blue checked:border-cusens-blue focus:ring-2 focus:ring-cusens-blue/30 transition-all"
                                    type="checkbox"
                                    checked={subscribeNewsletter}
                                    onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                                />
                                <span className="material-icons absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
                            </div>
                            <div className="text-sm text-cusens-text-secondary select-none">
                                Subscribe to the newsletter for updates on civic initiatives.
                            </div>
                        </label>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                        {error}
                    </div>
                )}
            </main>

            <div className="absolute bottom-0 left-0 w-full bg-cusens-bg border-t border-gray-200 p-6 safe-pb z-20">
                <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                    <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                    <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Button>
                <div className="mt-4 text-center">
                    <p className="text-sm text-cusens-text-secondary">
                        Already have an account?
                        <Link to="/login" className="text-cusens-blue font-medium hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

import React from 'react';
import { useRouter } from '@tanstack/react-router';

const Profile = () => {
    const router = useRouter();
    const handleGoBack = () => {
        router.history.back();
    };

    return (
        <div className="bg-cusens-bg font-display min-h-screen flex items-start justify-center p-4">
            <div className="w-full max-w-md bg-cusens-surface rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative flex flex-col">
                {/* Top App Bar */}
                <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-cusens-surface/95 backdrop-blur-md">
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-200 transition-colors text-cusens-primary"
                        onClick={handleGoBack}
                    >
                        <span className="material-icons">chevron_left</span>
                    </button>
                    <h1 className="text-base font-bold leading-tight tracking-tight flex-1 text-center text-gray-900">
                        Profile &amp; Achievements
                    </h1>
                    <div className="w-10"></div>
                </header>

                <main className="flex-1 overflow-y-auto px-6 pb-24">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center gap-4 pt-2">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-28 w-28 shadow-md border-4 border-cusens-primary/15"
                            data-alt="User avatar of Jane Doe"
                            style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuD7cbnwFcAoyOb5pOj744xfX7_cAy6Ugq1YRcDnUrEVaKSYqKlk4ZzDZw9sBVYTIHe_EBpEwhbBrT7l2rAcru-k3g_b8YkjAPWe_T42Hju-7OT_JINXzdE-jt0zyjKnnAIes_8YKHehNzLb-FExOKEGuhtu_gYOd2tjcvniKNxYzKjtTk9GWEessHgFR879XlRoXkoNIs0pzZMTSpRV7oIH5dogZfvbD8FEGA4CpkaLtBbAAyufOoeBrCe1-yxJfqJkycLR5BBaro8f")` }}
                        ></div>
                        <div className="flex flex-col items-center justify-center">
                            <p className="text-gray-900 text-xl font-bold leading-tight text-center">Jane Doe</p>
                            <p className="text-cusens-text-secondary text-sm font-medium text-center">Level 5 - Active Citizen</p>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="flex flex-col gap-2 pt-6">
                        <div className="flex justify-between items-center">
                            <p className="text-cusens-text-secondary text-xs font-semibold uppercase tracking-wide">Next Level</p>
                            <p className="text-gray-900 text-sm font-bold">1200 / 2000 XP</p>
                        </div>
                        <div className="rounded-full bg-gray-200 h-2.5 shadow-inner">
                            <div className="h-full rounded-full bg-cusens-primary" style={{ width: '60%' }}></div>
                        </div>
                    </div>

                    {/* Impact Stats Section */}
                    <div className="pt-6">
                        <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-tight mb-4">Impact Stats</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                                <span className="material-icons text-cusens-primary text-3xl mb-2">how_to_vote</span>
                                <p className="text-xl font-bold text-gray-900">1,250</p>
                                <p className="text-xs text-cusens-text-secondary">Voters Reached</p>
                            </div>
                            <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                                <span className="material-icons text-cusens-primary text-3xl mb-2">edit_document</span>
                                <p className="text-xl font-bold text-gray-900">82</p>
                                <p className="text-xs text-cusens-text-secondary">Petitions Signed</p>
                            </div>
                            <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                                <span className="material-icons text-cusens-primary text-3xl mb-2">door_front</span>
                                <p className="text-xl font-bold text-gray-900">58</p>
                                <p className="text-xs text-cusens-text-secondary">Doors Knocked</p>
                            </div>
                            <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                                <span className="material-icons text-cusens-primary text-3xl mb-2">call</span>
                                <p className="text-xl font-bold text-gray-900">312</p>
                                <p className="text-xs text-cusens-text-secondary">Calls Made</p>
                            </div>
                        </div>
                    </div>

                    {/* Achievements Section */}
                    <div className="pt-6">
                        <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-tight mb-4">Achievements</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-3 text-center items-center">
                                <div className="p-2 bg-gray-50 rounded-full">
                                    <div
                                        className="w-20 h-20 bg-center bg-no-repeat aspect-square bg-cover rounded-full border-4 border-cusens-primary/20"
                                        data-alt="Gold medal icon for Phone Bank Pro achievement"
                                        style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCS2aSZ9sFkCqGyhHaBHebyCZ3--Fuul0H3pZsjlnlolg8YdfICQ9a5_ZXEvjmMN5Z2pC-tidmN2C6orNa2tBmBsiCr76CIOv-QMycUv7iTKvBHmoO_LllWjJDGguNoEa5h7wHSYPwBbaZldQy0zD4QilOzF-cbRsiH53plnFuvU26wXRLsw36olZYM7WTbQ9_Nni_bmeEJ084Vp7x061kulDrhxxmJkl0QXAKrWw2BCVY6X7Ef03gXHhpZHiiR3VrNtCXU46lA0qpk")` }}
                                    ></div>
                                </div>
                                <div>
                                    <p className="text-gray-900 text-sm font-bold leading-normal">Phone Bank Pro</p>
                                    <p className="text-cusens-text-secondary text-xs font-normal leading-normal">Made 100 calls</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 text-center items-center">
                                <div className="p-2 bg-gray-50 rounded-full">
                                    <div
                                        className="w-20 h-20 bg-center bg-no-repeat aspect-square bg-cover rounded-full border-4 border-cusens-primary/20"
                                        data-alt="Gold medal icon for Community Canvasser achievement"
                                        style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuA0DKnFxSviQk0z2Z3TgB2KXp19gCzHmKuaIcJRv9gFyNXVqkFejuAkNBsdi_yuN_yqBgxOUAV-k1Gv8dnBn17ZNuulNCAtkK1xYxKgBzxiat0fGeBCF6KkrP3TJHnMORWnPhK4xYjzwcloLx4DqtIs5UnchmvkrqwR3Ji31D_6qiPQisKUkwZIXQYNbGINzYayPv6zRgQurF7Wxm5RZ-6DodGeBxbIpYP32sCJnx4DgfvFGZxyMMvXXcZaOMqlfRqlQ9j4ouqNr-nN")` }}
                                    ></div>
                                </div>
                                <div>
                                    <p className="text-gray-900 text-sm font-bold leading-normal">Community Canvasser</p>
                                    <p className="text-cusens-text-secondary text-xs font-normal leading-normal">Knocked on 50 doors</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 text-center items-center">
                                <div className="p-2 bg-gray-50 rounded-full">
                                    <div
                                        className="w-20 h-20 bg-center bg-no-repeat aspect-square bg-cover rounded-full border-4 border-cusens-primary/20"
                                        data-alt="Gold medal icon for Voter Registration Champion achievement"
                                        style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCHdVIWdWOEQhs5kfOFsh_bomMn05BSyDX94H3jxVbOuU0gXj7p1L66qPAmAKeZxY5VEc35E9N0TTFmkPmwW2M-znSyDA8gcp95focHAk1HG_QSVVEVTIr3Nd_QXQN8h0cPOi4VLe16WHSEIRYGUsc0_NYcHUKzoANz2ciGRW8g3ZST_9KpUrX4ELJLpjs9EEIG5QWD_pA-fO2Peu-IxceuOS09B6jV0P9jsxH5X3rE3o1EdX-BSJPy6DRslKLkuuIreYy6rPp0nt8-")` }}
                                    ></div>
                                </div>
                                <div>
                                    <p className="text-gray-900 text-sm font-bold leading-normal">Voter Champion</p>
                                    <p className="text-cusens-text-secondary text-xs font-normal leading-normal">Registered 10 voters</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 text-center items-center opacity-60">
                                <div className="p-2 bg-gray-50 rounded-full">
                                    <div
                                        className="w-20 h-20 bg-center bg-no-repeat aspect-square bg-cover rounded-full border-4 border-gray-200"
                                        data-alt="Locked achievement icon"
                                        style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDxUVj0hkk7DDtREAUKXpIYj5MV8h3pLc_v77oWBjPwecxzIsuWM4i9jJayYTy4YOkXrLh1bnjI5tUT1bZ2br2ICyyzS6bAK-2P2Ys4_Xo7bR9qpVfbKsJ2OyD1vWPS4KHkBYEGOYsWfNLHiOnrV22ygsT9ioftCjD65mcq1jugOuOF0ndNAyWQdG_OkxCWHcNDLWOxpDZRo9sbGdssQB_nyoO-IxCylfoPhQEY4Co3MA057DVORwISywL3OuUsU1Ks3f2IWnyxpaWf")` }}
                                    ></div>
                                </div>
                                <div>
                                    <p className="text-gray-900 text-sm font-bold leading-normal">First Donation</p>
                                    <p className="text-cusens-text-secondary text-xs font-normal leading-normal">Make a donation</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Milestone Cards Section */}
                    <div className="pt-6">
                        <h2 className="text-gray-900 text-lg font-bold leading-tight tracking-tight mb-4">Shareable Milestones</h2>
                        <div className="space-y-4">
                            <div className="bg-cusens-primary text-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center">
                                <span className="material-icons text-4xl mb-3">celebration</span>
                                <h3 className="text-xl font-bold">First 100 Calls!</h3>
                                <p className="mt-1 mb-4 opacity-90 text-sm">
                                    You're a true advocate for change. Keep up the amazing work!
                                </p>
                                <button className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-white text-cusens-primary text-sm font-bold leading-normal shadow-md hover:bg-gray-100 transition-colors">
                                    <span className="material-icons mr-2 text-base">share</span>
                                    <span className="truncate">Share</span>
                                </button>
                            </div>
                            <div className="bg-white border border-cusens-border p-6 rounded-2xl shadow-sm flex flex-col items-center text-center">
                                <span className="material-icons text-4xl mb-3 text-cusens-primary">rocket_launch</span>
                                <h3 className="text-xl font-bold text-gray-900">Reached Level 5!</h3>
                                <p className="mt-1 mb-4 text-cusens-text-secondary text-sm">
                                    Your dedication is inspiring. You've become an Active Citizen!
                                </p>
                                <button className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-cusens-primary text-white text-sm font-bold leading-normal shadow-md hover:bg-cusens-primary-hover transition-colors">
                                    <span className="material-icons mr-2 text-base">share</span>
                                    <span className="truncate">Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;

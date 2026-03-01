import { memo, useEffect, useRef, useState } from 'react';

const ACHIEVEMENTS = [
  {
    title: 'Phone Bank Pro',
    description: 'Made 100 calls',
    alt: 'Gold medal icon for Phone Bank Pro achievement',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS2aSZ9sFkCqGyhHaBHebyCZ3--Fuul0H3pZsjlnlolg8YdfICQ9a5_ZXEvjmMN5Z2pC-tidmN2C6orNa2tBmBsiCr76CIOv-QMycUv7iTKvBHmoO_LllWjJDGguNoEa5h7wHSYPwBbaZldQy0zD4QilOzF-cbRsiH53plnFuvU26wXRLsw36olZYM7WTbQ9_Nni_bmeEJ084Vp7x061kulDrhxxmJkl0QXAKrWw2BCVY6X7Ef03gXHhpZHiiR3VrNtCXU46lA0qpk',
    locked: false,
  },
  {
    title: 'Community Canvasser',
    description: 'Knocked on 50 doors',
    alt: 'Gold medal icon for Community Canvasser achievement',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0DKnFxSviQk0z2Z3TgB2KXp19gCzHmKuaIcJRv9gFyNXVqkFejuAkNBsdi_yuN_yqBgxOUAV-k1Gv8dnBn17ZNuulNCAtkK1xYxKgBzxiat0fGeBCF6KkrP3TJHnMORWnPhK4xYjzwcloLx4DqtIs5UnchmvkrqwR3Ji31D_6qiPQisKUkwZIXQYNbGINzYayPv6zRgQurF7Wxm5RZ-6DodGeBxbIpYP32sCJnx4DgfvFGZxyMMvXXcZaOMqlfRqlQ9j4ouqNr-nN',
    locked: false,
  },
  {
    title: 'Voter Champion',
    description: 'Registered 10 voters',
    alt: 'Gold medal icon for Voter Registration Champion achievement',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHdVIWdWOEQhs5kfOFsh_bomMn05BSyDX94H3jxVbOuU0gXj7p1L66qPAmAKeZxY5VEc35E9N0TTFmkPmwW2M-znSyDA8gcp95focHAk1HG_QSVVEVTIr3Nd_QXQN8h0cPOi4VLe16WHSEIRYGUsc0_NYcHUKzoANz2ciGRW8g3ZST_9KpUrX4ELJLpjs9EEIG5QWD_pA-fO2Peu-IxceuOS09B6jV0P9jsxH5X3rE3o1EdX-BSJPy6DRslKLkuuIreYy6rPp0nt8-',
    locked: false,
  },
  {
    title: 'First Donation',
    description: 'Make a donation',
    alt: 'Locked achievement icon',
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxUVj0hkk7DDtREAUKXpIYj5MV8h3pLc_v77oWBjPwecxzIsuWM4i9jJayYTy4YOkXrLh1bnjI5tUT1bZ2br2ICyyzS6bAK-2P2Ys4_Xo7bR9qpVfbKsJ2OyD1vWPS4KHkBYEGOYsWfNLHiOnrV22ygsT9ioftCjD65mcq1jugOuOF0ndNAyWQdG_OkxCWHcNDLWOxpDZRo9sbGdssQB_nyoO-IxCylfoPhQEY4Co3MA057DVORwISywL3OuUsU1Ks3f2IWnyxpaWf',
    locked: true,
  },
];

const LazyAchievementImage = memo(({ src, alt }) => {
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    if (!wrapperElement) {
      return undefined;
    }

    if (typeof IntersectionObserver !== 'function') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px 0px' },
    );

    observer.observe(wrapperElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="h-full w-full rounded-full bg-cusens-surface-muted">
      {isVisible ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
          width={80}
          height={80}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
        />
      ) : (
        <div aria-hidden className="h-full w-full rounded-full bg-cusens-surface-muted" />
      )}
    </div>
  );
});

LazyAchievementImage.displayName = 'LazyAchievementImage';

const ProfileImpactTab = () => {
  return (
    <section
      className="pt-6 space-y-6"
      role="tabpanel"
      id="profile-panel-impact"
      aria-labelledby="profile-tab-impact"
    >
      <div>
        <h2 className="text-cusens-text-primary text-lg font-bold leading-tight tracking-tight mb-4">Impact Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
            <span className="material-icons text-cusens-primary text-3xl mb-2">how_to_vote</span>
            <p className="text-xl font-bold text-cusens-text-primary">1,250</p>
            <p className="text-xs text-cusens-text-secondary">Voters Reached</p>
          </div>
          <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
            <span className="material-icons text-cusens-primary text-3xl mb-2">edit_document</span>
            <p className="text-xl font-bold text-cusens-text-primary">82</p>
            <p className="text-xs text-cusens-text-secondary">Petitions Signed</p>
          </div>
          <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
            <span className="material-icons text-cusens-primary text-3xl mb-2">door_front</span>
            <p className="text-xl font-bold text-cusens-text-primary">58</p>
            <p className="text-xs text-cusens-text-secondary">Doors Knocked</p>
          </div>
          <div className="bg-white border border-cusens-border p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
            <span className="material-icons text-cusens-primary text-3xl mb-2">call</span>
            <p className="text-xl font-bold text-cusens-text-primary">312</p>
            <p className="text-xs text-cusens-text-secondary">Calls Made</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-cusens-text-primary text-lg font-bold leading-tight tracking-tight mb-4">Achievements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map((achievement) => (
            <div
              key={achievement.title}
              className={`flex flex-col gap-3 text-center items-center ${achievement.locked ? 'opacity-60' : ''}`}
            >
              <div className="p-2 bg-cusens-bg rounded-full">
                <div
                  className={`w-20 h-20 rounded-full border-4 bg-white overflow-hidden ${
                    achievement.locked ? 'border-gray-200' : 'border-cusens-primary/20'
                  }`}
                >
                  <LazyAchievementImage src={achievement.src} alt={achievement.alt} />
                </div>
              </div>
              <div>
                <p className="text-cusens-text-primary text-sm font-bold leading-normal">{achievement.title}</p>
                <p className="text-cusens-text-secondary text-xs font-normal leading-normal">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-cusens-text-primary text-lg font-bold leading-tight tracking-tight mb-4">Shareable Milestones</h2>
        <div className="space-y-4">
          <div className="bg-cusens-primary text-cusens-text-primary p-6 rounded-2xl shadow-md flex flex-col items-center text-center">
            <span className="material-icons text-4xl mb-3">celebration</span>
            <h3 className="text-xl font-bold">First 100 Calls!</h3>
            <p className="mt-1 mb-4 opacity-90 text-sm">
              You&apos;re a true advocate for change. Keep up the amazing work!
            </p>
            <button className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-white text-cusens-primary text-sm font-bold leading-normal shadow-md hover:bg-cusens-bg transition-colors">
              <span className="material-icons mr-2 text-base">share</span>
              <span className="truncate">Share</span>
            </button>
          </div>
          <div className="bg-white border border-cusens-border p-6 rounded-2xl shadow-sm flex flex-col items-center text-center">
            <span className="material-icons text-4xl mb-3 text-cusens-primary">rocket_launch</span>
            <h3 className="text-xl font-bold text-cusens-text-primary">Reached Level 5!</h3>
            <p className="mt-1 mb-4 text-cusens-text-secondary text-sm">
              Your dedication is inspiring. You&apos;ve become an Active Citizen!
            </p>
            <button className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-cusens-primary text-cusens-text-primary text-sm font-bold leading-normal shadow-md hover:bg-cusens-primary-hover transition-colors">
              <span className="material-icons mr-2 text-base">share</span>
              <span className="truncate">Share</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(ProfileImpactTab);

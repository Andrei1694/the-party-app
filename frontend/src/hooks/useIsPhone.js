import { useEffect, useState } from 'react';

const PHONE_MEDIA_QUERY = '(max-width: 767px)';

const getPhoneMatch = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia(PHONE_MEDIA_QUERY).matches;
};

const useIsPhone = () => {
  const [isPhone, setIsPhone] = useState(getPhoneMatch);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(PHONE_MEDIA_QUERY);

    const updatePhoneState = (event) => {
      setIsPhone(event.matches);
    };

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', updatePhoneState);
      return () => mediaQueryList.removeEventListener('change', updatePhoneState);
    }

    mediaQueryList.addListener(updatePhoneState);
    return () => mediaQueryList.removeListener(updatePhoneState);
  }, []);

  return isPhone;
};

export default useIsPhone;

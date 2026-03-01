// src/components/AuthCard.jsx
import React from 'react';

const AuthCard = ({ children }) => {
  return (
    <div className="w-full max-w-sm mx-auto bg-cusens-surface rounded-3xl shadow-xl overflow-hidden border border-cusens-border relative">
      <div className="h-12 w-full flex justify-between items-center px-6 pt-2">
        <span className="text-sm font-semibold text-cusens-text-primary">9:41</span>
        <div className="flex space-x-2 text-cusens-text-primary">
          <span className="material-icons text-sm">signal_cellular_alt</span>
          <span className="material-icons text-sm">wifi</span>
          <span className="material-icons text-sm">battery_full</span>
        </div>
      </div>
      <div className="px-8 pt-8 pb-10 flex flex-col h-full min-h-[600px]">
        {children}
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center pb-2 pointer-events-none">
        <div className="w-32 h-1.5 bg-gray-900/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default AuthCard;

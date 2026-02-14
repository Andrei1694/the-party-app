import React from 'react';

const Chat = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-900 shadow-md p-4 flex items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Chat</h1>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Chat messages will go here */}
      </div>
      <div className="bg-white dark:bg-gray-900 p-4 flex items-center">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <button className="ml-4 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chat;
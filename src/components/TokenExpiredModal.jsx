// components/TokenExpiredModal.jsx
import React from "react";
import { Button } from "./ui/button";

const TokenExpiredModal = ({ isOpen, onClose, onLogin }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="
          w-96 rounded-lg p-6 text-center shadow-lg
          bg-white dark:bg-gray-900
          text-gray-900 dark:text-gray-100
          border border-gray-200 dark:border-gray-800
        "
      >
        <h2 className="text-xl font-bold mb-4">Session Expired</h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          Your session has expired. Please log in again.
        </p>

        <div className="flex justify-center space-x-4">
          <Button onClick={onLogin} className="cursor-pointer">
            Login
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TokenExpiredModal;

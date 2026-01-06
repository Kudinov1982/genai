import React, { useEffect, useRef } from 'react';
import { User } from '../types';
import { Send } from 'lucide-react';

interface TelegramLoginButtonProps {
  botName: string;
  onAuth: (user: User) => void;
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  requestAccess?: boolean;
  usePic?: boolean;
}

declare global {
  interface Window {
    TelegramLoginWidget: {
      dataOnauth: (user: User) => void;
    };
  }
}

const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  botName,
  onAuth,
  buttonSize = 'large',
  cornerRadius = 12,
  requestAccess = true,
  usePic = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define the global callback
    window.TelegramLoginWidget = {
      dataOnauth: (user: User) => onAuth(user),
    };

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botName);
      script.setAttribute('data-size', buttonSize);
      script.setAttribute('data-radius', cornerRadius.toString());
      script.setAttribute('data-request-access', requestAccess ? 'write' : 'read');
      script.setAttribute('data-userpic', usePic ? 'true' : 'false');
      script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
      script.async = true;

      containerRef.current.appendChild(script);
    }
  }, [botName, buttonSize, cornerRadius, requestAccess, usePic, onAuth]);

  // --- DEMO / SIMULATION MODE ---
  // Since we cannot use a real bot name on localhost/preview without setup, 
  // we provide a fallback button to simulate login for the UI.
  const handleSimulateLogin = () => {
      const mockUser: User = {
          id: 123456789,
          first_name: "Genealogy",
          last_name: "Expert",
          username: "gen_expert",
          photo_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
          auth_date: Date.now(),
          hash: "mock_hash"
      };
      onAuth(mockUser);
  };

  return (
    <div className="flex flex-col items-center gap-2">
        <div ref={containerRef} className="min-h-[40px]" />
        
        {/* Fallback for Demo purposes if Bot Name is invalid or on localhost */}
        <button 
            type="button"
            onClick={handleSimulateLogin}
            className="text-[10px] text-ink-400 underline hover:text-accent-600 transition-colors"
        >
            (Демо: Войти как Тест-Юзер)
        </button>
    </div>
  );
};

export default TelegramLoginButton;
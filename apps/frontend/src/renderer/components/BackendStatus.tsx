import { useEffect, useState } from 'react';
import { useSessionStore } from '../lib/stores/sessionStore';
import { translations } from '../lib/i18n';

enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

const MAX_RETRY_TIME = 90000; // 90 seconds

export function BackendStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.CONNECTING);
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:8080');
  const [startTime] = useState(Date.now());
  const [dots, setDots] = useState('.');
  const { language } = useSessionStore();
  const t = translations[language];

  useEffect(() => {
    if (status !== ConnectionStatus.CONNECTING) return;
    
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);
    
    return () => clearInterval(dotsInterval);
  }, [status]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await window.electron.config.get();
        if (config?.api?.baseUrl) {
          setApiBaseUrl(config.api.baseUrl);
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };
    
    loadConfig();
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/actuator/health`);
        if (response.ok) {
          setStatus(ConnectionStatus.CONNECTED);
        } else {
          handleConnectionFailure();
        }
      } catch {
        handleConnectionFailure();
      }
    };

    const handleConnectionFailure = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > MAX_RETRY_TIME) {
        setStatus(ConnectionStatus.DISCONNECTED);
      }
    };

    checkConnection();
    const intervalId = setInterval(checkConnection, 2000);

    return () => clearInterval(intervalId);
  }, [apiBaseUrl, startTime]);

  const statusColor = {
    [ConnectionStatus.CONNECTING]: 'bg-yellow-500',
    [ConnectionStatus.CONNECTED]: 'bg-green-500',
    [ConnectionStatus.DISCONNECTED]: 'bg-red-500',
  }[status];

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${statusColor}`}
        title={t[status]}
      />
      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre">
        {status === ConnectionStatus.CONNECTING 
          ? `${t[status].replace('...', '')}${dots.padEnd(3, '\u00A0')}`
          : t[status]
        }
      </span>
    </div>
  );
}

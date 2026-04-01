import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AppContext } from '../app.context';
import './header.scss';

export const Header: React.FC = () => {
  const { config } = useContext(AppContext);
  const [logoLoaded, setLogoLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Try to load logo image
    const img = new Image();
    img.onload = () => {
      setLogoLoaded(true);
    };
    img.onerror = () => {
      setLogoLoaded(false);
    };
    img.src = '/assets/images/logo.png';
  }, []);

  // Only show header if logo loaded successfully
  if (!logoLoaded) {
    return null;
  }

  return (
    <header className="restool-header">
      <div className="header-content">
        <div className="logo-container">
          <img src="/assets/images/logo.png" alt={config?.name} className="logo" />
        </div>
      </div>
    </header>
  );
};
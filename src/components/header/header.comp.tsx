import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AppContext } from '../app.context';
import './header.scss';

export const Header: React.FC = () => {
  const { config } = useContext(AppContext);
  const [logoImage, setLogoImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Try to load logo from public directory
    const loadLogo = async () => {
      try {
        // Try to fetch logo from public directory
        const response = await fetch('/assets/images/logo.png');
        if (response.ok) {
          setLogoImage('/assets/images/logo.png');
        } else {
          setLogoImage(undefined);
        }
      } catch (e) {
        // Logo doesn't exist, keep undefined
        setLogoImage(undefined);
      }
    };

    loadLogo();
  }, []);

  // Only show header if logo exists
  if (!logoImage) {
    return null;
  }

  return (
    <header className="restool-header">
      <div className="header-content">
        <div className="logo-container">
          <img src={logoImage} alt={config?.name} className="logo" />
        </div>
      </div>
    </header>
  );
};
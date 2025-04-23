import React from 'react';
import { useContext } from 'react';
import { AppContext } from '../app.context';
import './header.scss';

// Logo will be imported when it exists
let logoImage: string | undefined;
try {
  // Dynamic import for logo - will throw if file doesn't exist
  logoImage = require('../../assets/images/logo.png');
} catch (e) {
  logoImage = undefined;
}

export const Header: React.FC = () => {
  const { config } = useContext(AppContext);

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
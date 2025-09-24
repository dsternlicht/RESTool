import React from 'react';
import { useContext } from 'react';
import { AppContext } from '../app.context';
import './header.scss';

// Logo will be automatically imported if it exists at src/assets/images/logo.png
import logoImage from '../../assets/images/logo.png';

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
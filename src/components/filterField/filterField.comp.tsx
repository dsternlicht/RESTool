import React from 'react';
import { useTranslation } from 'react-i18next';

import './filterField.scss';

interface IProps {
  onChange: (filter: string) => void
}

export const FilterField = ({ onChange }: IProps) => {
  const { t } = useTranslation();

  return (
    <section className="filter-wrapper">
      <h5>{t('filter.title')}</h5>
      <div className="form-row">
        <input 
          type="text" 
          placeholder={t('filter.searchPlaceholder')} 
          onChange={(e) => onChange(e.target.value.toLowerCase())} 
        />
      </div>
    </section>
  );
};

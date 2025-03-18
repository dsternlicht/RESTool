import React from 'react';
import { usePageTranslation } from '../../hooks/usePageTranslation';
import { withAppContext } from '../withContext/withContext.comp';
import { IAppContext } from '../app.context';

import './filterField.scss';

interface IProps {
  context: IAppContext;
  onChange: (filter: string) => void
}

const FilterFieldComp = ({ context, onChange }: IProps) => {
  const { translatePage } = usePageTranslation(context.activePage?.id);

  return (
    <section className="filter-wrapper">
      <h5>{translatePage('filter.title')}</h5>
      <div className="form-row">
        <input 
          type="text" 
          placeholder={translatePage('filter.searchPlaceholder')} 
          onChange={(e) => onChange(e.target.value.toLowerCase())} 
        />
      </div>
    </section>
  );
};

export const FilterField = withAppContext(FilterFieldComp);

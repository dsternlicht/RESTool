import React from 'react';

import './filterField.scss';

interface IProps {
  onChange: (filter: string) => void
}

export const FilterField = ({ onChange }: IProps) => {
  return (
    <section className="filter-wrapper">
      <h5>Filter:</h5>
      <div className="form-row">
        <input type="text" placeholder="Search..." onChange={(e) => onChange(e.target.value.toLowerCase())} />
      </div>
    </section>
  );
};
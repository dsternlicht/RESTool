import React from 'react';
import { ICustomStyles } from '../../common/models/config.model';

interface IProps {
  styles: ICustomStyles
}

export const CustomStyles = ({ styles }: IProps) => {
  const cssVars = styles.vars || {};
  const arr = [];
  
  for (const key in cssVars) {
    arr.push(`--${key}: ${(cssVars as any)[key]}`);
  }

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      :root {
        ${arr.join(';')}
      }
    ` }}>
    </style>
  );
};
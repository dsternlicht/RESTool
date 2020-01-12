import React from 'react';

interface IProps {
  styles: any
}

export const CustomStyles = ({ styles }: IProps) => {
  const arr = [];
  
  for (const key in styles) {
    arr.push(`--${key}: ${styles[key]}`);
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
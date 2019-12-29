import React from 'react';

import './button.scss';

interface IProps {
  children: any
  onClick: (e: any) => void
  color?: 'gray' | 'blue' | 'green' | 'red'
}

export const Button = (props: IProps) => {
  return (
    <button className={`button ${props.color || ''}`} {...props}>{props.children}</button>
  );
};
import React from 'react';

import './button.scss';

interface IProps {
  children: any
  type?: 'submit' | 'button' | 'reset'
  title?: string
  className?: string
  onClick?: (e: any) => void
  color?: 'gray' | 'blue' | 'green' | 'red'
  disabled?: boolean
}

export const Button = (props: IProps) => {
  return (
    <button {...props} className={`button ${props.className || ''} ${props.color || ''}`}>{props.children}</button>
  );
};
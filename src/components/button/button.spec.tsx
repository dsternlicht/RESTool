import React from 'react';
import { create } from 'react-test-renderer';

import { Button } from './button.comp';

describe('Button', () => {

  test('should render', () => {
    create(<Button
      children={null}
    />);
  });

  test('should render a button type', () => {
    const component = create(<Button
      children={null}
    />);

    expect(component.toJSON()?.type).toBe('button');
  });

  test('should have button as class name, even if another className is given', () => {
    let component = create(<Button
      children={null}
    />);

    expect(
      component
        .toJSON()?.props.className
        .split(' ')
        .filter((name: string) => !!name)
    ).toStrictEqual(['button']);


    component = create(<Button
      children={null}
      className={'foo'}
    />);

    expect(
      component
        .toJSON()?.props.className
        .split(' ')
        .filter((name: string) => !!name)
    ).toStrictEqual(['button', 'foo']);
  });

  test('should have its color property added as class name', () => {
    let component = create(<Button
      children={null}
      color={'blue'}
    />);

    expect(
      component
        .toJSON()?.props.className
        .split(' ')
        .filter((name: string) => !!name)
    ).toStrictEqual(['button', 'blue']);


    component = create(<Button
      children={null}
      color={'blue'}
      className={'foo'}
    />);

    expect(
      component
        .toJSON()?.props.className
        .split(' ')
        .filter((name: string) => !!name)
    ).toStrictEqual(['button', 'foo', 'blue']);
  });
});

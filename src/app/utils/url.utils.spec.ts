import { UrlUtils } from './url.utils';
import { DataPathUtils } from './dataPath.utils';

describe('UrlUtils', () => {
  const urlUtils = new UrlUtils(new DataPathUtils());

  describe('for an input with :potato', () => {
    for (const input of [
      'http://mywebsite.foo/:potato',
      'https://mywebsite.foo/:potato',
      '//mywebsite.foo/:potato',
      '/rootdir/:potato',
      'dir/:potato',
      'http://mywebsite.foo/:potato/tomato',
      'https://mywebsite.foo/:potato/tomato',
      '//mywebsite.foo/:potato/tomato',
      '/dir/:potato/tomato',
      '/dir/search:potato?vegetable=tomato',
      '/dir/search?vegetable=:potato&color=brown',
      '/dir/search?vegetable=:potato#color=brown',
    ]) {
      describe(input, () => {
        it(`extractIdFieldName() returns 'potato'`, () => {
          expect(urlUtils.extractIdFieldName(input)).toBe('potato');
        });

        it('urlIsClearOfParams() returns false', () => {
          expect(urlUtils.urlIsClearOfParams(input)).toBe(false);
        });
      });
    }
  });

  describe('for an input with no parameters', () => {
    for (const input of [
      'http://mywebsite.foo/potato',
      'https://mywebsite.foo/potato',
      '//mywebsite.foo/potato',
      '/rootdir/potato',
      'dir/potato',
    ]) {
      describe(input, () => {
        it (`extractIdFieldName() returns null`, () => {
          expect(urlUtils.extractIdFieldName(input)).toBeNull();
        });

        it('urlIsClearOfParams() returns true', () => {
          expect(urlUtils.urlIsClearOfParams(input)).toBe(true);
        });
      });
    }
  });
});

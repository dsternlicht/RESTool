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
      'http://mywebsite.foo:1234/dir/:potato?color=brown',
      '//mywebsite.foo:1234/vegetable=:potato',
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
      'http://mywebsite.foo:1234/potato',
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

  describe('extractIdFieldName()', () => {
    it('returns _id for http://localhost:3000/admin/profiles/:_id', () => {
      expect(urlUtils.extractIdFieldName('http://localhost:3000/admin/profiles/:_id')).toBe('_id');
    });
  });
});

import { RestoolPage } from './app.po';

describe('restool App', function() {
  let page: RestoolPage;

  beforeEach(() => {
    page = new RestoolPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

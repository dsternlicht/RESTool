import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { IAppContext } from '../app.context';
import { IConfigResource, IConfigMethods, IConfigPostMethod, IConfigPutMethod, IConfigGetSingleMethod, ICustomLabels } from '../../common/models/config.model';
import { withAppContext } from '../withContext/withContext.comp';
import { ResourceItems } from '../resourceItems/resourceItems.comp';
import { Button } from '../button/button.comp';
import { matchPath, useLocation } from 'react-router';

import './page.scss';

interface IProps {
  context: IAppContext
}

interface IPopupProps {
  type: 'add' | 'update' | 'action'
  title: string
  config: IConfigPostMethod | IConfigPutMethod
  submitCallback: (body: any, containFiles: boolean) => void
  getSingleConfig?: IConfigGetSingleMethod
  rawData?: {}
}

const PageComp = ({ context }: IProps) => {
  const { page } = useParams();
  let { pathname } = useLocation();
  if (pathname[0] === '/') {
    pathname = pathname.slice(1);
  }
  const { activePage, httpService, config } = context;
  const resources = config?.resources;
  const pageHeaders: any = activePage?.requestHeaders || {};
  const pageMethods: IConfigMethods | undefined = activePage?.methods;
  const postConfig: IConfigPostMethod | undefined = pageMethods?.post;
  const customLabels: ICustomLabels | undefined = { ...config?.customLabels, ...activePage?.customLabels };
  const addItemLabel = customLabels?.buttons?.addItem || '+ Add Item';
  const addItemFormTitle = customLabels?.formTitles?.addItem || 'Add Item';
  const [openedPopup, setOpenedPopup] = useState<null | IPopupProps>(null);


  function renderPageContent() {
    return (
      <ResourceItems
        context={context}
        activeResource={activePage}
        openedPopupState={openedPopup}
        isSubResource={false}
      />
    )
  }
  async function addItem(body: any, containFiles?: boolean) {
    if (!postConfig) {
      throw new Error('Post method is not defined.');
    }

    const { url, requestHeaders, actualMethod } = postConfig;

    return await httpService.fetch({
      method: actualMethod || 'post',
      origUrl: url,
      body: containFiles ? body : JSON.stringify(body),
      headers: {
        ...pageHeaders,
        ...(requestHeaders || {}),
        ...(containFiles ? {} : { 'content-type': 'application/json' })
      },
      responseType: 'boolean'
    });
  }

  function getPageMatch(_resources: IConfigResource[] | undefined): { matchPage: IConfigResource, pathVars: { [key: string]: string } } | null {
    if (_resources === undefined || _resources.length === 0) {
      return null;
    }
    let pathVars = {};
    const nextActivePage: IConfigResource | undefined = _resources?.find((page, pIdx) => {
      let match = matchPath(pathname, page.id);
      pathVars = match ? match.params : {};
      return match?.isExact || (pIdx + 1) === parseInt(pathname || '')
    });
    if (nextActivePage !== undefined) {
      return { matchPage: nextActivePage, pathVars };
    }

    if (!_resources || _resources.length === 0) {
      return null;
    }

    return getPageMatch(_resources);
  }

  useEffect(() => {
    const { matchPage, pathVars } = getPageMatch(resources) || { matchPage: null, pathVars: {} };

    context.setActivePathVars(pathVars);
    context.setActivePage(matchPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pathname]);


  return (
    <div className="app-page">
      <header className="app-page-header">
        <hgroup>
          <h2>{activePage?.name}</h2>
          {
            activePage?.description &&
            <h4>{activePage?.description}</h4>
          }
        </hgroup>
        {
          postConfig &&
          <Button className="add-item" color="green" onClick={() => setOpenedPopup({ type: 'add', title: addItemFormTitle, config: postConfig, submitCallback: addItem })}>{addItemLabel}</Button>
        }
      </header>
      <main className="app-page-content">
        {renderPageContent()}
      </main>
    </div>
  );
}

export const Page = withAppContext(PageComp);

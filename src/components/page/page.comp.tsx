import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { matchPath, useLocation } from 'react-router';

import { IAppContext } from '../app.context';
import { IConfigResource, IConfigMethods, IConfigPostMethod, IConfigPutMethod, IConfigGetSingleMethod, ICustomLabels } from '../../common/models/config.model';
import { withAppContext } from '../withContext/withContext.comp';
import { ResourceItems } from '../resourceItems/resourceItems.comp';
import { Button } from '../button/button.comp';

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
  const { activeResource, httpService, config, activePathVars, setActivePathVars, setActiveResource } = context;
  const resources = config?.resources;
  const pageHeaders: any = activeResource?.requestHeaders || {};
  const pageMethods: IConfigMethods | undefined = activeResource?.methods;
  const postConfig: IConfigPostMethod | undefined = pageMethods?.post;
  const customLabels: ICustomLabels | undefined = { ...config?.customLabels, ...activeResource?.customLabels };
  const addItemLabel = customLabels?.buttons?.addItem || '+ Add Item';
  const addItemFormTitle = customLabels?.formTitles?.addItem || 'Add Item';
  const [openedPopup, setOpenedPopup] = useState<null | IPopupProps>(null);


  function renderPageContent() {
    return (
      <ResourceItems
        context={context}
        activeResource={activeResource}
        openedPopupState={openedPopup}
        isSubResource={false}
        activePathVars={activePathVars}
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

  function getPageMatch(_resources?: IConfigResource[]): { matchingResource: IConfigResource, pathVars: { [key: string]: string } } | null {
    if (_resources === undefined || _resources.length === 0) {
      return null;
    }
    let pathVars = {};
    const nextactiveResource: IConfigResource | undefined = _resources?.find((page, pIdx) => {
      let match = matchPath(pathname, page.id);
      pathVars = match ? match.params : {};
      return match?.isExact || (pIdx + 1) === parseInt(pathname || '')
    });
    if (nextactiveResource !== undefined) {
      return { matchingResource: nextactiveResource, pathVars };
    }

    if (!_resources || _resources.length === 0) {
      return null;
    }

    // If no match on resources, we call the matching function on all their sub-resources 
    const allSubResources = _resources.reduce((allSubR: IConfigResource[], r) => {
      if (r.subResources) {
        return [...allSubR, ...r.subResources];
      }
      return allSubR;
    }, []);

    return getPageMatch(allSubResources);
  }

  useEffect(() => {
    const { matchingResource, pathVars } = getPageMatch(resources) || { matchingResource: null, pathVars: {} };

    setActivePathVars(pathVars);
    setActiveResource(matchingResource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pathname]);


  return (
    <div className="app-page">
      <header className="app-page-header">
        <hgroup>
          <h2>{activeResource?.name}</h2>
          {
            activeResource?.description &&
            <h4>{activeResource?.description}</h4>
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

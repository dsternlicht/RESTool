import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import * as QueryString from 'query-string';
import { toast } from 'react-toastify';
import { orderBy } from 'natural-orderby';

import { IAppContext } from '../app.context';
import { IConfigPage, IConfigMethods, IConfigGetAllMethod, IConfigPostMethod, IConfigPutMethod, IConfigDeleteMethod, IConfigInputField, IConfigCustomAction, IConfigGetSingleMethod, ICustomLabels, IConfigDetailPage, IConfigResourcePage, IConfigDisplayField } from '../../common/models/config.model';
import { withAppContext } from '../withContext/withContext.comp';
import { Loader } from '../loader/loader.comp';
import { dataHelpers } from '../../helpers/data.helpers';
import { Table } from '../table/table.comp';
import { Cards } from '../cards/cards.comp';
import { QueryParams } from '../queryParams/queryParams.comp';
import { Button } from '../button/button.comp';
import { FormPopup } from '../formPopup/formPopup.comp';
import { FilterField } from '../filterField/filterField.comp';
import { matchPath, useLocation, match } from 'react-router';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Details } from '../details/details.comp';
import { TabContent } from '../tab/tabContent.comp';


// import 'react-tabs/style/react-tabs.css';
import './detailPage.scss';

interface IProps {
  context: IAppContext
  // item: any
}

interface IPopupProps {
  type: 'add' | 'update' | 'action'
  title: string
  config: IConfigPostMethod | IConfigPutMethod
  submitCallback: (body: any, containFiles: boolean) => void
  getSingleConfig?: IConfigGetSingleMethod
  rawData?: {}
}

const DetailPageComp = ({ context }: IProps) => {
  const { page } = useParams();
  let { pathname } = useLocation();
  if (pathname[0] === '/') {
    pathname = pathname.slice(1);
  }
  const { push, location } = useHistory();
  const { activePage, error, setError, httpService, config, activeItem, activePathVars, setActivePathVars } = context;
  const detailPage = activePage?.methods?.getSingle.detailPage;
  const [activeResourceIndex, setActiveResourceIndex] = useState<number>(0);
  const resources = detailPage?.resources;
  const pageHeaders: any = activePage?.requestHeaders || {};
  const pageMethods: IConfigMethods | undefined = activePage?.methods;
  const customActions: IConfigCustomAction[] = resources?.[activeResourceIndex]?.customActions || [];
  const getSingleConfig: IConfigGetSingleMethod | undefined = pageMethods?.getSingle;
  const postConfig: IConfigPostMethod | undefined = pageMethods?.post;
  const putConfig: IConfigPutMethod | undefined = pageMethods?.put;
  const deleteConfig: IConfigDeleteMethod | undefined = pageMethods?.delete;
  const customLabels: ICustomLabels | undefined = { ...config?.customLabels, ...activePage?.customLabels, ...resources?.[activeResourceIndex]?.customLabels };
  const editItemFormTitle = customLabels?.formTitles?.editItem || 'Update Item';
  const [loading, setLoading] = useState<boolean>(false);
  const [openedPopup, setOpenedPopup] = useState<null | IPopupProps>(null);
  const [queryParams, setQueryParams] = useState<IConfigInputField[]>(resources?.[activeResourceIndex]?.methods.getAll.queryParams || []);
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');
  const staticPathVars = detailPage ? matchPath(pathname, detailPage.id)?.params : {};
  let pageName = detailPage?.name;

  const dynamicMatches = pageName?.match(/\${([\w.]*)}/gm);
  const dynamicVars = dynamicMatches?.map(m => m.replace(/[\${}]/gm, ''));
  const replacements = dynamicVars?.map(key => activeItem[key]);
  dynamicMatches?.forEach((match, index) => { pageName = pageName?.replace(match, replacements?.[index] || 'undefined') })

  const [resourceLoading, setResourceLoading] = useState<boolean[]>(Array(resources?.length).fill(false));
  const [resourceItems, setResourceItems] = useState<any[][]>(Array(resources?.length).fill([]));

  const callbacks = {
    delete: deleteConfig ? deleteItem : null,
    put: putConfig ? openEditPopup : null,
    action: customActions.length ? openCustomActionPopup : () => { },
  };


  const getAllConfig = activePage?.methods?.getAll;
  const fields = getAllConfig?.fields || getAllConfig?.display?.fields || [];

  function closeFormPopup(refreshData: boolean = false) {
    setOpenedPopup(null);

    if (refreshData === true) {
      //TODO refresh data
    }
  }

  async function openEditPopup(rawData: any) {
    const params: IPopupProps = {
      rawData,
      type: 'update',
      title: editItemFormTitle,
      config: putConfig as IConfigPutMethod,
      getSingleConfig,
      submitCallback: async (body: any, containFiles: boolean) => {
        return await updateItem(body, rawData, containFiles);
      }
    };

    setOpenedPopup(params);
  }

  function openCustomActionPopup(rawData: any, action: IConfigCustomAction) {
    const params: IPopupProps = {
      rawData,
      type: 'action',
      title: action.name || 'Custom Action',
      config: action as IConfigCustomAction,
      submitCallback: async (body: any, containFiles: boolean) => {
        return await performAction(body, rawData, action, containFiles);
      }
    };

    setOpenedPopup(params);
  }

  async function performAction(body: any, rawData: any, action: IConfigCustomAction, containFiles: boolean) {
    const { url, requestHeaders, actualMethod } = action;

    return await httpService.fetch({
      method: actualMethod || 'put',
      origUrl: url,
      rawData,
      body: containFiles ? body : JSON.stringify(body),
      headers: {
        ...pageHeaders,
        ...(requestHeaders || {}),
        ...(containFiles ? {} : { 'content-type': 'application/json' })
      },
      responseType: 'boolean'
    });
  }

  function extractQueryParams(): IConfigInputField[] {
    const parsedParams = QueryString.parse(location.search);
    const finalQueryParams: IConfigInputField[] = (getAllConfig?.queryParams || []).map((queryParam) => {
      if (typeof parsedParams[queryParam.name] !== 'undefined') {
        queryParam.value = queryParam.type === 'boolean' ? (parsedParams[queryParam.name] === 'true') : decodeURIComponent(parsedParams[queryParam.name] as any);
      } else {
        queryParam.value = queryParam.value || '';
      }
      return queryParam;
    });

    return finalQueryParams
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

  async function updateItem(body: any, rawData: any, containFiles?: boolean) {
    if (!putConfig) {
      throw new Error('Put method is not defined.');
    }

    const { url, requestHeaders, actualMethod } = putConfig;

    return await httpService.fetch({
      method: actualMethod || 'put',
      origUrl: url,
      rawData,
      body: containFiles ? body : JSON.stringify(body),
      headers: {
        ...pageHeaders,
        ...(requestHeaders || {}),
        ...(containFiles ? {} : { 'content-type': 'application/json' })
      },
      responseType: 'boolean'
    });
  }

  async function deleteItem(item: any) {
    const approved: boolean = window.confirm('Are you sure you want to delete this item?');

    if (!approved) {
      return;
    }

    try {
      if (!deleteConfig) {
        throw new Error('Delete method is not defined.');
      }

      const { url, requestHeaders, actualMethod } = deleteConfig;
      const success = await httpService.fetch({
        method: actualMethod || 'delete',
        origUrl: url,
        rawData: item,
        headers: Object.assign({}, pageHeaders, requestHeaders || {}),
        responseType: 'boolean'
      });

      if (success) {
        // TODO, redirect to parent page
      }
    } catch (e) {
      toast.error(e.message);
    }
  }

  function submitQueryParams(updatedParams: IConfigInputField[]) {
    setQueryParams(updatedParams);

    if (loading) {
      return;
    }

    // Building query string
    const queryState: string = queryParams.map((queryParam, idx) => {
      return `${idx === 0 ? '?' : ''}${queryParam.name}=${encodeURIComponent(queryParam.value || '')}`;
    }).join('&');

    // Pushing query state to url
    push(queryState);
  }

  function ControlledTabs() {

    if (resources === null) {
      return null;
    }
    return (
      <Tabs selectedIndex={activeResourceIndex} onSelect={tabIndex => setActiveResourceIndex(tabIndex)}>
        <TabList>
          {
            resources &&
            resources.map((resource, index) => <Tab key={`resource_tablist_${index}`}>{resource.name}</Tab>)
          }
        </TabList>
        {
          resources &&
          resources.map((resource, index) =>
            <TabContent
              key={`resource_tabcontent_${index}`}
              context={context}
              resource={resource}
              loading={resourceLoading[index]}
              items={resourceItems[index]}
            />
          )
        }
      </Tabs>
    );
  }

  function renderPageContent() {

    return (
      <React.Fragment>
        <QueryParams
          initialParams={queryParams}
          submitCallback={submitQueryParams}
        />
        {
          error ?
            <div className="app-error">{error}</div> :
            <ControlledTabs />
        }
      </React.Fragment>
    )
  }

  function getPageMatch(pages: IConfigDetailPage[] | undefined): { matchPage: IConfigDetailPage, pathVars: { [key: string]: string } } | null {
    if (pages === undefined || pages.length === 0) {
      return null;
    }
    let pathVars = {};
    const nextActivePage: IConfigDetailPage | undefined = pages?.find(detailPage => {
      let match = matchPath(pathname, detailPage.id);
      pathVars = match ? match.params : {};
      return match?.isExact;
    });

    if (nextActivePage === undefined) {
      return null;
    }

    return { matchPage: nextActivePage, pathVars };
  }

  useEffect(() => {
    const { matchPage, pathVars } = getPageMatch(context?.config?.pages.flatMap(page => page.methods?.getSingle?.detailPage)) || { matchPage: undefined, pathVars: {} };

    context.setActivePathVars(pathVars);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pathname, activeResourceIndex]);

  useEffect(() => {
    setQueryParams(extractQueryParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  function setActiveResourceLoading(state: boolean) {
    const updated = [...resourceLoading];
    updated[activeResourceIndex] = state;
    setResourceLoading(updated);
  }

  function setActiveResourceItems(items: any[]) {
    const updated = [...resourceItems];
    updated[activeResourceIndex] = items;
    setResourceItems(updated);
  }

  async function getAllResourceRequest() {
    if (resourceItems[activeResourceIndex] && resourceItems[activeResourceIndex].length) {
      return;
    }
    const resource = resources?.[activeResourceIndex];
    const newResourceLoading = resourceLoading;
    resourceLoading[activeResourceIndex] = true;
    setActiveResourceLoading(true);
    setError(null);

    const getAllConfig = resource?.methods.getAll;

    try {
      if (!getAllConfig) {
        throw new Error('Get all method is not defined.');
      }

      const { url, requestHeaders, actualMethod, dataPath, sortBy, dataTransform } = getAllConfig;
      const result = await httpService.fetch({
        method: actualMethod || 'get',
        origUrl: url,
        // rawData: activePathVars,
        rawData: staticPathVars,
        // queryParams: extractQueryParams(),
        queryParams: queryParams,
        headers: Object.assign({}, pageHeaders, requestHeaders || {})
      });
      let extractedData = dataHelpers.extractDataByDataPath(result, dataPath);

      if (!extractedData) {
        throw new Error('Could not extract data from response.');
      }

      if (!Array.isArray(extractedData)) {
        throw new Error('Extracted data is invalid.');
      }

      if (typeof dataTransform === 'function') {
        extractedData = await dataTransform(extractedData);
      }

      const orderedItems = orderBy(extractedData, typeof sortBy === 'string' ? [sortBy] : (sortBy || []));
      setActiveResourceItems(orderedItems);
    } catch (e) {
      setError(e.message);
    }

    setActiveResourceLoading(false);
  }

  useEffect(() => {
    if (resources?.[activeResourceIndex]) {
      getAllResourceRequest();
    }
  }, [activeResourceIndex, page, pathname]);

  return (
    <div className="app-details-page">
      <header className="app-details-page-header">
        <hgroup>
          <h2>{pageName}</h2>
          <div className="details-wrapper">
            <Details
              fields={fields}
              item={activeItem}
              customLabels={customLabels}
            />
          </div>
        </hgroup>
        {
          (callbacks.put || callbacks.delete || (customActions && customActions.length > 0)) &&
          <div className="details-actions-wrapper">
            {
              callbacks.put &&
              <Button onClick={() => callbacks.put?.(activeItem)} title={'editLabel'}>
                <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
              </Button>
            }
            {
              (customActions && customActions.length > 0) &&
              customActions.map((action, idx) => (
                <Button key={`action_${idx}`} onClick={() => callbacks.action(activeItem, action)} title={action.name}>
                  <i className={`fa fa-${action.icon || 'cogs'}`} aria-hidden="true"></i>
                </Button>
              ))
            }
            {
              callbacks.delete &&
              <Button onClick={() => callbacks.delete?.(activeItem)} title={'deleteLabel'}>
                <i className="fa fa-times" aria-hidden="true"></i>
              </Button>
            }
          </div>
        }
      </header>
      <main className="app-details-page-content">
        {renderPageContent()}
      </main>
      {
        openedPopup &&
        <FormPopup
          title={openedPopup.title}
          closeCallback={closeFormPopup}
          submitCallback={openedPopup.submitCallback}
          fields={openedPopup.config?.fields || []}
          rawData={openedPopup.rawData}
          getSingleConfig={openedPopup.getSingleConfig}
          methodConfig={openedPopup.config}
        />
      }
    </div>
  );
}

export const DetailPage = withAppContext(DetailPageComp);

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { IAppContext } from '../app.context';
import { dataHelpers } from '../../helpers/data.helpers';
import { routesHelpers } from '../../helpers/routes.helpers';
import { IConfigResource, IConfigMethods, IConfigPostMethod, IConfigPutMethod, IConfigDeleteMethod, IConfigCustomAction, IConfigGetSingleMethod, ICustomLabels, IConfigDisplayField } from '../../common/models/config.model';
import { withAppContext } from '../withContext/withContext.comp';
import { Loader } from '../loader/loader.comp';
import { ResourceItems } from '../resourceItems/resourceItems.comp';
import { Button } from '../button/button.comp';
import { FormPopup } from '../formPopup/formPopup.comp';
import { matchPath, useLocation, useHistory } from 'react-router';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Details } from '../details/details.comp';

import './detailPage.scss';

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

const DetailPageComp = ({ context }: IProps) => {
  let { pathname } = useLocation();
  const { goBack } = useHistory()
  if (pathname[0] === '/') {
    pathname = pathname.slice(1);
  }
  const { activeResource, setActiveResource, error, setError, httpService, config, activeItem, setActiveItem, detailPagesConfig, activePathVars, setActivePathVars } = context;
  let subResources = activeResource?.subResources;
  const pageHeaders: any = activeResource?.requestHeaders || {};
  const pageMethods: IConfigMethods | undefined = activeResource?.methods;
  const customActions: IConfigCustomAction[] = activeResource?.customActions || [];
  const getSingleConfig: IConfigGetSingleMethod | undefined = pageMethods?.getSingle;
  const putConfig: IConfigPutMethod | undefined = pageMethods?.put;
  const deleteConfig: IConfigDeleteMethod | undefined = pageMethods?.delete;
  const customLabels: ICustomLabels | undefined = { ...config?.customLabels, ...activeResource?.customLabels };
  const editItemFormTitle = customLabels?.formTitles?.editItem || 'Update Item';
  const [openedPopup, setOpenedPopup] = useState<null | IPopupProps>(null);
  const [loading, setLoading] = useState<boolean>(false);
  let detailRouteConfigs = routesHelpers.detailRoutesConfig(config?.resources);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [pageName, setPageName] = useState<string | null>(null);

  const callbacks = {
    delete: deleteConfig ? deleteItem : null,
    put: putConfig ? openEditPopup : null,
    action: customActions.length ? openCustomActionPopup : () => { },
  };

  const getAllConfig = activeResource?.methods?.getAll;
  const fields: IConfigDisplayField[] = getSingleConfig?.fields || getAllConfig?.fields || getAllConfig?.display?.fields || [];

  function closeFormPopup(refreshData: boolean = false) {
    setOpenedPopup(null);

    if (refreshData === true) {
      setActiveItem(null);
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
        goBack();
      }
    } catch (e) {
      toast.error(e.message);
    }
  }

  const renderTabContent = (key: string, resource: IConfigResource) => {
    const sub = { ...resource };
    return (
      <TabPanel
        key={key}
      >
        <ResourceItems
          context={context}
          activeResource={sub}
          openedPopupState={openedPopup}
          activePathVars={activePathVars}
          isSubResource={true}
        />
      </TabPanel>
    )
  }

  function ControlledTabs() {

    if (subResources === null) {
      return null;
    }
    return (
      <Tabs selectedIndex={activeTabIndex} onSelect={tabIndex => setActiveTabIndex(tabIndex)}>
        <TabList>
          {
            subResources &&
            subResources.map((resource, index) => <Tab key={`resource_tablist_${index}`}>{resource.name}</Tab>)
          }
        </TabList>
        {
          subResources &&
          subResources.map((resource, index) => renderTabContent(
            `resource_tabcontent_${index}`,
            resource,
          ))
        }
      </Tabs>
    );
  }


  function renderPageContent() {
    if (loading) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        {
          error ?
            <div className="app-error">{error}</div> :
            detailPagesConfig &&
            activeResource &&
            activeItem &&
            subResources &&
            <ControlledTabs />
        }
      </React.Fragment>
    )
  }

  function getPageMatch(getSingleMethods: { resource: IConfigResource, route: string }[] | undefined): { [key: string]: string } | null {
    if (getSingleMethods === undefined || getSingleMethods.length === 0) {
      return null;
    }
    let pathVars = {};
    const nextDetail = getSingleMethods?.find(detailRoute => {
      const method = detailRoute.resource.methods.getSingle;
      if (!method.id) {
        return false;
      }
      let match = matchPath(pathname, method.id);
      pathVars = match ? match.params : {};
      return match?.isExact;
    });

    if (nextDetail === undefined) {
      return null;
    }

    return pathVars;
  }

  useEffect(() => {
    setActivePathVars(getPageMatch(detailRouteConfigs) || {});
    setActiveResource(null);
    setActiveItem(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (activeResource === null) {
      const resourceConfig = detailPagesConfig?.find(conf => {
        if (!conf.route) {
          return false;
        }
        return matchPath(`/${pathname}`, conf.route)?.isExact;
      })?.resource;
      if (resourceConfig) {
        setActiveResource(resourceConfig);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailPagesConfig]);

  useEffect(() => {
    async function getOneRequest() {
      setLoading(true);
      setError(null);

      try {
        if (!getSingleConfig) {
          throw new Error('Get single method is not defined.');
        }

        const { url, requestHeaders, actualMethod, dataPath, queryParams } = getSingleConfig;

        const result = await httpService.fetch({
          method: actualMethod || 'get',
          origUrl: url,
          rawData: getPageMatch(detailRouteConfigs) || {},
          queryParams,
          headers: Object.assign({}, pageHeaders, requestHeaders || {})
        });
        let extractedData = dataHelpers.extractDataByDataPath(result, dataPath);

        if (!extractedData) {
          throw new Error('Could not extract data from response.');
        }

        setActiveItem(extractedData);

      } catch (e) {
        setError(e.message);
      }

      setLoading(false);
    }
    if (activeResource && activeItem === null) {
      getOneRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItem, activeResource]);


  useEffect(() => {
    // Handling item variables within page title
    if (activeItem) {
      let parsedPageName = getSingleConfig?.name;
      const dynamicMatches = parsedPageName?.match(/:([\w.]*)/gm);
      const dynamicVars = dynamicMatches?.map(m => m.replace(/[:]/gm, ''));
      const replacements = dynamicVars?.map(key => activeItem[key]);
      dynamicMatches?.forEach((match, index) => { parsedPageName = parsedPageName?.replace(match, replacements?.[index] || 'undefined') });
      setPageName(parsedPageName || null);
    }
  }, [getSingleConfig, activeItem])


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

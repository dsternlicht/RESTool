import { IConfigResource } from '../common/models/config.model';

class RoutesHelpers {
  public detailRoutesConfig(resources?: IConfigResource[], parentRoute?: string): { resource: IConfigResource, route: string }[] {
    const detailRoutesConfig: { resource: IConfigResource, route: string }[] = resources?.reduce((acc: { resource: IConfigResource, route: string }[], resource) => {
      const detailPageId = resource.methods?.getSingle?.id;
      if (detailPageId) {
        const route = parentRoute ? `/${parentRoute}/${detailPageId}` : `/${detailPageId}`;
        acc.push({
          route,
          resource,
        })
      }
      return acc;
    }, []) || [];

    const subResourcesDef = resources?.reduce((acc: { sub: IConfigResource[], parentId: string }[], resource) => {
      if (resource.subResources) {
        acc.push({
          sub: resource.subResources,
          parentId: resource.id
        });
      }
      return acc;
    }, []) || [];

    if (subResourcesDef.length > 0) {
      const subRoutes = subResourcesDef.map(subDef => this.detailRoutesConfig(subDef.sub, subDef.parentId)).flat();

      return [...subRoutes, ...detailRoutesConfig];
    }

    return detailRoutesConfig;
  }
}

export const routesHelpers = new RoutesHelpers();
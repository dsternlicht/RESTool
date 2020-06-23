import { IConfigResource } from '../common/models/config.model';

class RoutesHelpers {
  public detailRoutesConfig(resources?: IConfigResource[]): { resource: IConfigResource, route: string }[] {
    const detailRoutesConfig: { resource: IConfigResource, route: string }[] = resources?.reduce((acc: { resource: IConfigResource, route: string }[], resource) => {
      const detailPageId = resource.methods?.getSingle?.id;
      if (detailPageId) {
        const route = `/${detailPageId}`;
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
      const subRoutes = subResourcesDef.map(subDef => this.detailRoutesConfig(subDef.sub)).flat();

      return [...subRoutes, ...detailRoutesConfig];
    }

    return detailRoutesConfig;
  }

  public subResourceRoutes(resources?: IConfigResource[]): string[] {
    if (!resources) {
      return [];
    }

    const subResources: IConfigResource[] = resources.reduce((allSubR: IConfigResource[], r) => {
      if (r.subResources) {
        return [...allSubR, ...r.subResources];
      }
      return allSubR;
    }, []);

    if (subResources.length === 0) {
      return [];
    }

    const subRoutes = subResources.map(sub => `/${sub.id}`);
    const deeperRoutes = this.subResourceRoutes(subResources);

    return [...subRoutes, ...deeperRoutes];
  }
}

export const routesHelpers = new RoutesHelpers();
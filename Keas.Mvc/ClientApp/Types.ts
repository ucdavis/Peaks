// Main Type of the context
// tslint:disable-next-line:interface-name
export interface AppContext {
  fetch: (url: string, init?: RequestInit) => any;
  team: ITeam;
  permissions: string[];
}

// /:team/${container}/:containerAction?/:containerId?/:assetType?/:action?/:id
export interface IMatchParams {
  containerAction: string;
  containerId: string;
  assetType: string;
  action: string;
  id: string;
}

export interface IRouteProps {
  id: string;
  action: string;

  assetType: string;

  personId: string;
  personAction: string;

  spaceId: string;
  spaceAction: string;

  keyId: string;
  keyAction: string;
}

export interface ITeam {
  id: number;
  name: string;
  slug: string;
}

export interface IHasExpiration {
  expiresAt: Date;
}

export interface IHistory {
  description: string;
  actedDate: Date;
  actionType?: string;
  assetType?: string;
  id: number;
}

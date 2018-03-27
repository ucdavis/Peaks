import * as React from "react";
import { Route } from "react-router-dom";

import AssetContainer from './AssetContainer';

export const routes = (
  <div>
    <Route path="/:team/asset/:assetType" component={AssetContainer} />
  </div>
);

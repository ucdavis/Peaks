import * as React from "react";
import { Route } from "react-router-dom";

import AccessContainer from "../../components/Access/AccessContainer";
import EquipmentContainer from "../../components/Equipment/EquipmentContainer";
import KeyContainer from "../../components/Keys/KeyContainer";
import PeopleContainer from "../../components/People/PeopleContainer";
import PersonContainer from "../../components/PersonContainer";
import SpacesContainer from "../../components/Spaces/SpacesContainer";
import AssetNav from "../assets/AssetNav";

// examples of common routes
// /CAESDO/keys/display/12
// /CAESDO/people/
// /CAESDO/person/1/keys/details/12
export const routes = (
  <AssetNav>
    <Route path="/:team/keys/:action?/:id?" component={KeyContainer} />
    <Route
      path="/:team/equipment/:action?/:id?"
      component={EquipmentContainer}
    />
    <Route path="/:team/access/:action?/:id?" component={AccessContainer} />
    <Route
        path="/:team/:assetType(spaces|workstations)/:action?/:id?" component={SpacesContainer}
    />

    <Route path="/:team/people/:action?/:id?" component={PeopleContainer} />
    <Route
      path="/:team/person/:personAction/:personId/:assetType?/:action?/:id?"
      component={PersonContainer}
    />

  </AssetNav>
);

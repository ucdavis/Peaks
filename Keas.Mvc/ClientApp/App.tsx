import * as React from 'react';
import PropTypes from 'prop-types';

import { createFetch } from './util/api';
import { IPerson } from './Types';

interface IProps {
  person: IPerson
}

// Provider
export default class App extends React.Component<IProps, {}> {
  static childContextTypes = {
    teamId: PropTypes.number,
    person: PropTypes.object,
    fetch: PropTypes.func,
  };
  getChildContext() {
    // define context here
    return {
      teamId: this.props.person.teamId,
      person: this.props.person,
      fetch: createFetch()
    };
  }
  render() {
    return this.props.children;
  }
}

import * as React from 'react';
import PropTypes from 'prop-types';

import { IPerson } from './Types';

interface IProps {
  person: IPerson
}

// Provider
export default class App extends React.Component<IProps, {}> {
  static childContextTypes = {
    team: PropTypes.string,
    teamId: PropTypes.number,
    person: PropTypes.object,
  };
  getChildContext() {
    // define context here
    return {
      person: this.props.person
    };
  }
  render() {
    return this.props.children;
  }
}

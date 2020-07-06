import * as React from 'react';
import { shallow } from 'enzyme';
import Denied from '../Shared/Denied';

describe('Link', () => {
  it('Renders link to Google', () => {
    const link = shallow(<Denied viewName='view name'></Denied>);

    expect(link.find('div').last().text()).toContain('view name');
  });
});

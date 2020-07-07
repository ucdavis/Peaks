import * as React from 'react';
import { render } from '@testing-library/react';
import Denied from './Denied';


describe('Link', () => {
  it('Renders view name', () => {
    const { getByText } = render(<Denied viewName="abc123" />);
    const div = getByText(/You do not have permission to see abc123/i);

    expect(div).toBeInTheDocument();
  });
});

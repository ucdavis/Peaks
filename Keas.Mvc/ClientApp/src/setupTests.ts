import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import '@testing-library/jest-dom/extend-expect';

Enzyme.configure({ adapter: new Adapter() });
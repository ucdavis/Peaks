import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-15";
import jasmineEnzyme from "jasmine-enzyme";

Enzyme.configure({ adapter: new Adapter() });

beforeEach(() => {
    jasmineEnzyme();
});

// require all spec files
var context = require.context("./ClientApp", true, /.+\.spec\.(js|jsx|ts|tsx)$/);
context.keys().forEach(context);

export default context;

import 'vite/modulepreload-polyfill';
import { renderApp } from './renderApp';
import './styles/main.css';
import './navigation';
import { renderDateFields } from './components/Shared/renderDateFields';

renderApp(document.getElementById('root'));
renderDateFields();

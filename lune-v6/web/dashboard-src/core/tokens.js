// Loads LDS v2 tokens into the dashboard bundle (device serves a single JS file).
import { injectStyle } from './style.js';
import tokensCss from '../../tokens.generated.css';

injectStyle('lds-tokens', tokensCss);

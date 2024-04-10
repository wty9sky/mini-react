import ReactDom from './core/react-dom.js';
import App from './App.jsx';
import React from './core/react.js';

ReactDom.createRoot(document.getElementById('root')).render(<App></App>);

// 思考问题：复杂的DOM树，会导致什么问题？浏览器卡顿，性能问题，为什么？
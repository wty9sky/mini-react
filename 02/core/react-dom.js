import React from './react.js'


const ReactDom = {
    createRoot(container) {
        return {
            render(App) {
                React.render(App, container);
            }
        }
    }
}

export default ReactDom;
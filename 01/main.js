import ReactDom from './core/react-dom.js';
import App from './App.js';
ReactDom.createRoot(document.getElementById('root')).render(App);



// 思考问题：如何使用jsx？->第二节






// // v1
// // 创建一个 div 元素
// // const dom = document.createElement("div");
// // // 设置 div 元素的 id 为 "app"
// // dom.id = "app";
// // // 将创建的 div 元素追加到 id 为 "root" 的元素中
// // document.querySelector("#root").append(dom);

// // // 创建一个文本节点
// // const textNode = document.createTextNode("");
// // // 设置文本节点的值为 "app"
// // textNode.nodeValue = "app";
// // // 将文本节点追加到创建的 div 元素中
// // dom.append(textNode);

// /*
// 这段 JavaScript 代码定义了一个名为 createTextNode 的函数，该函数执行以下操作：
// 创建一个 div 元素:
// const dom = document.createElement("div");
// 使用 document.createElement("div") 方法创建一个新的 div 元素，并将其存储在变量 dom 中。
// 设置 div 元素的 id 为 "app":
// dom.id = "app";
// 为刚刚创建的 div 元素设置 id 属性为 "app"。这样，在 HTML 文档中，这个 div 元素就可以通过其 id 属性来唯一标识和访问。
// 将创建的 div 元素追加到 id 为 "root" 的元素中:
// document.querySelector("#root").append(dom);
// * `document.querySelector("#root")`: 使用 `querySelector` 方法选择文档中 id 为 "root" 的元素。这个方法返回文档中
// 匹配指定 CSS 选择器的第一个元素。
// * `.append(dom)`: 使用 `append` 方法将前面创建的 `div` 元素（即 `dom` 变量所引用的元素）追加到找到的 "root" 元素中。这样，
// 新创建的 `div` 元素就会成为 "root" 元素的子元素。
// 总的来说，这个 createTextNode 函数的目的是创建一个新的 div 元素，为其设置 id 为 "app"，并将其追加到 id 为 "root" 的现有元素中。
// 但请注意，函数名 createTextNode 可能会让人误解，因为它实际上并没有创建任何文本节点，只是创建了一个 div 元素。如果目的是创建文本节点，
// 那么代码中还应该包括创建文本节点并将其添加到 div 元素中的部分。
// */


// // v2 react v-dom

// // const textEl = {
// //   type: 'TEXT_ELEMENT',
// //   props: {
// //     nodeValue: 'app',
// //     children: []
// //   }
// // }

// // const el = {
// //   type: 'div',
// //   props: {
// //     id: 'app',
// //     children: [textEl]
// //   }
// // }

// // const dom = document.createElement(el.type);
// // // 设置 div 元素的 id 为 "app"
// // dom.id = el.props.id;
// // // 将创建的 div 元素追加到 id 为 "root" 的元素中
// // document.querySelector("#root").append(dom);

// // // 创建一个文本节点
// // const textNode = document.createTextNode("");
// // // 设置文本节点的值为 "app"
// // textNode.nodeValue = textEl.props.nodeValue;
// // // 将文本节点追加到创建的 div 元素中
// // dom.append(textNode);



// // // v3 
// // function createTextNode(text) {
// //   return {
// //     type: 'TEXT_ELEMENT',
// //     props: {
// //       nodeValue: text,
// //       children: []
// //     }
// //   }
// // }

// // function createElement(type, props, ...children) {
// //   return {
// //     type,
// //     props: {
// //       ...props,
// //       children
// //     }
// //   }
// // }

// // const textEl = createTextNode('app');
// // const App = createElement('div', { id: 'app' }, textEl)

// // const dom = document.createElement(App.type);
// // // 设置 div 元素的 id 为 "app"
// // dom.id = App.props.id;
// // // 将创建的 div 元素追加到 id 为 "root" 的元素中
// // document.querySelector("#root").append(dom);

// // // 创建一个文本节点
// // const textNode = document.createTextNode("");
// // // 设置文本节点的值为 "app"
// // textNode.nodeValue = textEl.props.nodeValue;
// // // 将文本节点追加到创建的 div 元素中
// // dom.append(textNode);



// // v4

// function createTextNode(text) {
//   return {
//     type: 'TEXT_ELEMENT',
//     props: {
//       nodeValue: text,
//       children: []
//     }
//   }
// }

// function createElement(type, props, ...children) {
//   return {
//     type,
//     props: {
//       ...props,
//       children:children.map((child)=>{
//         return typeof child === 'string' ? createTextNode(child) : child;
//       })
//     }
//   }
// }

// function render(el, container) {
//   const dom = el.type === 'TEXT_ELEMENT'
//     ? document.createTextNode("")
//     : document.createElement(el.type);

//   Object.keys(el.props).forEach((key) => {
//     if (key !== 'children') {
//       dom[key] = el.props[key];
//     }
//   })

//   const children = el.props.children;
//   children.forEach((child) => {
//     render(child, dom);
//   })
//   container.append(dom);
// }

// // const textEl = createTextNode('app');
// // const App = createElement('div', { id: 'app' }, "hi","dsfds");
// // console.log(App);

// // render(App, document.querySelector('#root'));

// // const ReactDom = {
// //   createRoot(container){
// //     return {
// //       render(App){
// //         render(App,container);
// //       }
// //     }
// //   }
// // }
// // const App = createElement('div', { id: 'app' }, "hi","dsfds");
// // ReactDom.createRoot(document.querySelector('#root')).render(App);

// /*
// 这段 JavaScript 代码定义了一个名为 render 的函数，该函数执行以下操作：
// 创建一个 div 元素:
// const dom = el.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(el.type);
// }
//   container.append(dom);
// }
// */
// // function createTextNode(text) {
// //   return {
// //     type: "TEXT_ELEMENT",
// //     props: {
// //       nodeValue: text,
// //       children: [],
// //     },
// //   };
// // }

// // function createElement(type, props, ...children) {
// //   return {
// //     type,
// //     props: {
// //       ...props,
// //       children,
// //     },
// //   };
// // }


// // function render(el,container) {
// //   const dom =
// //     el.type === "TEXT_ELEMENT"
// //       ? document.createTextNode(el.props.nodeValue)
// //       : document.createElement(el.type);

// //       Object.keys(el.props).forEach((key)=>{
// //         if(key!=='children'){
// //             dom[key] = el.props[key];
// //         }
// //       })

// //       const children = el.props.children
// //       children.forEach((child)=>{
// //         render(child,dom)
// //       })

// //       container.append(dom);
// // }


// // const textEl = createTextNode("app");
// // const App = createElement("div", { id: "app" }, textEl);

// // render(App, document.querySelector("#root"));

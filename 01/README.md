# 从零实现mini-react(1)：实现最简mini-react


## 实现过程
通过 dom 原生 api 实现 vdom 转换为真实 dom，在页面中展示出`app`，拆分为以及几个小步

### 1. 原生 api 将`app`展示在浏览器页面上

通过调用 dom 原生 api

```js
const dom = document.createElement ("div");
dom.id = "app";
document.querySelector("#root").append(dom);
const textElement = document.createTextNode("app");
dom.append(textElement);
```

### 2. 使用 vdom 结构定义需要展示的`app`

这一步需要知道 react 中 vdom 的结构是怎么样的
主要包含几个字段：
- type
- props
- key
- ref 
- ...

我们需要使用的就是 type 和 props:
- type 标识当前的节点类型
- props 保存节点上的属性以及在 children 上保存子节点的信息

然后就可以将 dom 进行 vdom 结构化，再进一步进行 dom 节点的处理

```js
const textElementVdom = {
  type: "TEXT_ELEMENT",
  props: {
    nodeValue: "app",
    children: [],
  },
};
const domVdom = {
  type: "div",
  props: {
    id: "app",
    children: [textElementVdom],
  },
};

const dom = document.createElement (domVdom.type);
dom.id = domVdom.props.id;
document.querySelector("#root").append(dom);
const textElement = document.createTextNode(textElementVdom.props.nodeValue);
dom.append(textElement);
```

### 3. 编写符合React的api结构实现功能

这一步也需要知道 react 最后提供出来的调用方法是什么，其实在[babel](https://babeljs.io/rep)上很清晰的能看出，最终调用的结果是`React.createElement `这个方法，并且对与文本节点而言，可以单独抽离一个方法`createTextNode`进行使用；
最终实现一个`render`方法去执行渲染逻辑

```js
function createTextNode(nodeValue) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: nodeValue,
      children: [],
    },
  };
}

function createElement (type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "string" ? createTextNode(child) : child;
      }),
    },
  };
}

function render(el, container) {
  // 创建一个dom
  const dom =
    el.type === "TEXT_ELEMENT"
      ? document.createTextNode(el.props.nodeValue)
      : document.createElement (el.type);

  // 将节点上的属性挂载上去
  Object.keys(el.props).forEach((key) => {
    if (key !== "children") {
      dom[key] = el.props[key];
    }
  });

  // 将children进行递归生成节点
  el.props.children.forEach((child) => {
    render(child, dom);
  });

  // 挂载节点
  container.append(dom);
}

const textElement = createTextNode("app");
const app = createElement ("div", { id: "app" }, "aaa", "bbb");

render(app, document.querySelector("#root"));
```


### 4. 使用 jsx 写法验证
通过Vite转换功能，将 jsx 转换为 React.createElement的结构，从而进一步验证代码逻辑是否正确


## 我学到了什么？
- 从零开始实现 React 和 ReactDOM。
- 实现 React 的 createElement 和 render 方法封装。
- 使用Vite将.jsx文件编译城ECMAScript 模块（ES 模块）。
- 接入vitest并编写测试用例，了解toMatchInlineSnapshot的用法。
- 认识由繁入简的一种学习方法，有目标，但也要尽量拆解，还有一定要实操，再简单都要实操一遍。


## 我遇到了什么问题？
1. 使用Vite后，jsx代码`const div = <div id="app">hello</div>`，转成`React.createElement()`形式的原因？<br>
- 这是因为使用的vite背后的esbuild具备解析jsx文件的能力，它能够根据配置将jsx转成普通函数的形式，这样就能被浏览器解析。
- esbuild内部是根据配置项来决定用哪个方法，一共有两个配置项jsxFactory和jsxFragmentFactory，vite这里配置的jsxFactory的值为`React.createElement`。

2. /** @jsx CReact.createElement */ 这段注释作用是什么？
它告诉esbuild当前的jsxFactory要使用CReact.createElement方法。

3. 为什么jsx的文件没有使用到React，但是一定要导入React？
- 本质上来说JSX是React.createElement(component, props, ...children)方法的语法糖。
- 主要是编译前后的差异原因，因为esbuild会将jsx编译成React.createElement普通函数的形式，所以需要引入 React，防止找不到 React 引起报错。
- 写组件时，每个地方都要引入React确实很烦，新版React中，esbuild提供了自动引入React的方法autoimport配置。<a href="#在vite项目中自动引入react" >在Vite中如何自动引入React？</a>

4.

<!-- render使用递归的方式实现dom的创建，当层级非常非常深的时候可能会出现页面渲染卡顿，原因就是render 的执行时间过长，超过了浏览器一帧一帧渲染视图的时间，我们知道执行js会阻塞dom 渲染，因此会有卡顿问题出现。明天的任务调度器➕fiber 架构是要解决这个问题得 -->


## 在Vite项目中自动引入React
在Vite中自动引入React的方法主要是通过配置Vite的插件或者配置选项来实现。Vite官方提供了一个插件@vitejs/plugin-react，用于支持React项目的开发。

``` bash
npm install @vitejs/plugin-react react react-dom
```

然后，在Vite的配置文件中,引入并使用插件：
``` javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
 
export default defineConfig({
  plugins: [react()],
});
```

这样配置后，Vite将自动处理.jsx和.tsx文件中的React代码，包括自动引入React、JSX转换等功能。



# 从零实现mini-react(2)：任务调度器&fiber架构

## 目标
问题：
最简mini-react的代码实现中，render使用递归渲染，而 JavaScript 在浏览器中是单线程执行的，代码默认都执行在主线程上，因此如果递归层数过多，浏览器会响应很慢，就会导致页面卡顿

``` javascript
document.querySelector("#root").innerHTML = "Hello World"

for(let i = 0; i < 100000000000000000; i++) {
    console.log(i)
}
```


## 解决思路
### requestIdleCallback
 它允许开发者在浏览器空闲时期执行一些任务，从而避免主线程被阻塞。

[MDN文档说明](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback)

> window.requestIdleCallback() 方法插入一个函数，这个函数将在浏览器空闲时期被调用。这使开发者能够在主事件循环上执行后台和低优先级工作，而不会影响延迟关键事件，如动画和输入响应。函数一般会按先进先调用的顺序执行，然而，如果回调函数指定了执行超时时间timeout，则有可能为了在超时前执行函数而打乱执行顺序。

``` javascript
requestIdleCallback(callback, options)
```
- requestIdleCallback的参数
    - callback
        - 一个在事件循环空闲时即将被调用的函数的引用。
        - 函数会接收到一个名为 IdleDeadline 的参数，这个参数可以获取当前空闲时间以及回调是否在超时时间前已经执行的状态。
        - options.timeout
            - 如果指定了 timeout，并且有一个正值，而回调在 timeout 毫秒过后还没有被调用，那么回调任务将放入事件循环中排队，即使这样做有可能对性能产生负面影响。

- 浏览器空闲时期被调用
- 主事件循环上执行后台和低优先级工作
- 可指定超时时间timeout

``` javascript
function workLoop(deadline) {
  // 是否进行让步
  let shouldYield = false;

  while (!shouldYield) {
    console.log("进行事件");
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
```


### 实现任务调度器
- 优化render函数
    - 实现任务队列化，而不是递归调用
        - 基于requestIdleCallback的任务调度器
        - 基于fiber的任务队列生成

``` javascript
let nextWorkOfUnit = null;
function workLoop(deadline) {
  // 是否进行让步
  let shouldYield = false;

  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit/* 执行任务, 并返回下一个任务*/(nextWorkOfUnit/*定义一个全局变量作为当前正在执行的任务*/);

    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
```



### 实现fiber架构
Fiber 是 React 16 中引入的一种新的内部架构，旨在增强 React 应用的性能，特别是在动画、布局、手势等领域。它是对 React 核心算法的重写，让组件生成和更新的过程变得可以被中断和恢复，允许主线程去处理更紧急的任务，如响应用户的输入。


Fiber 架构的优点：
> - **增量渲染**：Fiber 使 React 能够将渲染工作分割成多个块，并将这些工作块分散到多个帧上执行。
> - **任务优先级**：Fiber 能够根据任务的优先级进行工作，重要的更新可以优先处理，而不重要的任务可以推迟。
> - **更平滑的用户界面**：通过避免长时间阻塞主线程，Fiber 有助于保持应用的流畅性和响应性。
> - **并发模式**：Fiber 架构为 React 的未来并发模式打下基础，即使在复杂的应用中也能保持稳定的性能。


> 根据分析，我们可以确定一个`fiber`需要以下属性
>
> - `type`: 当前节点的类型
> - `props`: 参数
> - `dom`: 当前节点对应的`真实 DOM`
> - `parent`: 当前节点的父节点
> - `sibling`: 当前节点的兄弟节点
> - `children`: 当前节点的子节点


## 综合解决方案
- 一次闲时任务处理的粒度是一个fiber节点
- 为了实现中断和恢复循环的效果, 将节点树转为链表来遍历
    - 节点的渲染顺序
        - 先渲染父节点`parent`,然后渲染子节点`child`
        - 没有子节点`child`, 就渲染兄弟节点`sibling`
        - 兄弟节点`sibling`渲染完成后, 最后渲染父节点`parent`的兄弟节点`sibling`
- 链表的节点是fiber节点, 一次任务做的事情：
    - 创建dom, 把dom挂载到父节点上
    - 设置props
    - 记录自己的子节点的父/叔的关系
    然后返回下一个任务(fiber节点)
- 闲时任务处理交由浏览器实现的requestIdleCallback API


``` javascript
// 创建节点
function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(dom, props) {
  // 设置props
  Object.keys(props).forEach((key) => {
    if (key !== "children") {
      dom[key] = props[key];
    }
  });
}

function performWorkOfUnit(fiber) {
  const { type, props, dom } = fiber;
  if (!dom) {
    const ele = (fiber.dom = createDom(type));
    updateProps(ele, props);
    fiber.parent.dom.append(ele);
  }
}
```

> 这里创建元素，并将元素绑定到 `fiber的dom属性` 上，就是为了将后续子节点添加到`dom树`上

#### 确定子级关系

``` javascript
function initChildren(fiber) {
  let prevChild = null;
  fiber.props.children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      dom: null,
      parent: fiber,
      child: null,
      sibling: null,
    };

    if (index === 0) fiber.child = newFiber;
    else prevChild.sibling = newFiber;

    prevChild = newFiber;
  });
}
```

- 如果为`children`第一个元素，那么就是`fiber.child`
- 如果不是，那么就是上一个`fiber`的`sibling`
- 这里需要更新一下`prevChild`
- `type`: 和 `child` 的 `type` 相同
- `props`: 和 `child` 的 `props` 相同
- `dom`: 先设置为 `null`，因为这个时候还没有渲染
- `parent`: 就是当前执行的`fiber`

#### 返回下一个 fiber

``` javascript
// 有子节点就返回子节点
if (fiber.child) return fiber.child;
// 如果没有子节点就返回兄弟节点
if (fiber.sibling) return fiber.sibling;
// 如果没有兄弟节点就返回父节点的子节点
return fiber.parent?.sibling;
```

#### 最终的 performWorkOfUnit

``` javascript
function performWorkOfUnit(fiber) {
  const { type, props, dom } = fiber;
  const ele = (fiber.dom = createDom(type));
  updateProps(ele, props);
  fiber.parent.dom.append(ele);

  initChildren(fiber);

  if (fiber.child) return fiber.child;
  if (fiber.sibling) return fiber.sibling;
  return fiber.parent?.sibling;
}
```

#### 将 render 函数与 performWorkOfUnit 函数进行合并

``` javascript
const render = (App, container) => {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [App],
    },
  };
};
```

> 这里将渲染任务作为一个 `fiber` 节点，并赋值给 `nextWorkOfUnit`，然后等待`performWorkOfUnit` 函数的调用，进行渲染。
> 时机：浏览器空闲的时候

``` javascript
function performWorkOfUnit(fiber) {
  const { type, props, dom } = fiber;
  // 判断dom是否有内容，没有内容就创建dom
  if (!dom) {
    // 设置fiber的dom
    const ele = (fiber.dom = createDom(type));
    updateProps(ele, props);
    // 添加到dom树中
    fiber.parent.dom.append(ele);
  }

  initChildren(fiber);

  // 返回新任务
  // 有子节点就返回子节点
  if (fiber.child) return fiber.child;
}
```


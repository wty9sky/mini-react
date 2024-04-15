# 从零实现mini-react(3)：统一提交&实现function component


## 统一提交

> 问题<br>
> 当没有空闲时间时，会导致部分渲染部分没有渲染，可能导致用户看到部分被渲染的 dom 结构，即渲染不完全的问题

<br>

> 解决办法
> 处理节点的时候只是创建dom和更新dom的props，处理children逻辑，但不加载dom到父节点。统一提交后，所有的 dom 都创建完成后再统一挂载渲染。

``` javascript
function commitRoot() {
  commitWork(root.child);
  root = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

## 支持function component

- 实现Function Component
    - 函数生成dom，并且可以传入props
    - 实际上就是比普通的component多了一层拆包的过程，判断fiber的type是否为函数，然后进一步去拆包。
    - 由于function component 本身没有vdom，在寻找父容器和兄弟节点时，需要采用循环向上的方式。
    - 需要考虑到多种边缘情况

``` javascript
function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  //...
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode =
          typeof child === "string" || typeof child === "number";
        return isTextNode ? createTextNode(child) : child;
      }),
    },
  };
}

```
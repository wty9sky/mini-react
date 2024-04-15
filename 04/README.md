# 从零实现 mini-react(4)：vdom 更新&update children

## DOM 事件绑定

- 对 DOM 事件进行绑定，需要使用`addEventListener`方法。
- 获取绑定事件的字段，然后使用`addEventListener`方法进行绑定。
- 注册事件也是同 `props` 传下来，因此只需要在处理 `props` 的时候去判断是否为注册事件，然后进行事件的注册即可。
- 更新注册的时候，需要注意将旧的事件删除掉，避免每次更新都加一个新事件。

```javascript
const updateProps = (dom, props) => {
  Object.keys(props).forEach((attr) => {
    const isEvent = attr.startsWith("on");
    if (isEvent) {
      const eventType = +attr.slice(2).toLocaleLowerCase();
      dom.addEventListener(eventType, props[attr]);
    } else {
      if (attr !== "children") {
        dom[attr] = props[attr];
      }
    }
  });
};
```


## 实现更新 props

更新props的时候，我们需要判断新旧props的差异，然后进行更新。
1. 生成新Fiber树
    - 通过render函数来生成Fiber树
        - 使用update的函数在用户交互时调用，并生成新的Fiber树
2. 获取旧Fiber树
    - 使用 `currentRoot` 在每次统一提交时保存旧的根节点
    - 然后再次更新时，将新的根节点的 `alternate` 指向旧节点
    - 更新调和 `children` 时，即从 `alternate.child` 拿到对应需要对比的第一个旧子节点
    - 此后以此通过 `sibiling` 拿到后续的旧节点比较 (关键)
3. 对比新旧Fiber树，并进行处理
    - 在`initChildren`中判断新旧child的type是否一样
        - 如果一样effectTag为更新update
        - 不一样则处理为新增加placement
    - 这里updateProps有几种情况要添加处理
        - 旧fiber有props ，新fiber没有props=>需删除
        - 旧fiber没有props ，新fiber有props=>需添加
        - 旧fiber没有props ，新fiber没有props=>需更新

``` javascript
function updateProps(dom, nextProps, prevProps) {
  // Object.keys(props).forEach((key) => {
  //   if (key !== "children") {
  //     if (key.startsWith("on")) {
  //       const eventType = key.slice(2).toLocaleLowerCase();
  //       dom.addEventListener(eventType, props[key]);
  //     } else {
  //       dom[key] = props[key];
  //     }
  //   }
  // });
  //   - 3、新老节点对比
  // - - 1、重构 updateProps
  // - - - 1、old 有 new 没有 删除
  Object.keys(prevProps).forEach((key) => {
    if (key !== "children") {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  });
  // - - - 2、new 有 old 没有 添加
  // - - - 3、new 有 old 有 修改
  Object.keys(nextProps).forEach((key) => {
    if (key !== "children") {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith("on")) {
          const eventType = key.slice(2).toLocaleLowerCase();
          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  });
}
function reconcileChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;

    if (isSameType) {
      // 更新
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: oldFiber.dom,
        effectTag: "update",
        alternate: oldFiber,
      };
    } else {
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: null,
        effectTag: "placement",
      };
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber.type);
  }
  updateProps(fiber.dom, fiber.props, {});

  const children = fiber.props.children;
  // 转换链表 设置指针
  reconcileChildren(fiber, children);
}

```

```javascript
// 更新commitWork 统一提交逻辑
function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.effectTag === "update") {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === "placement") {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```


> 双缓存机制：<br>
> 为了减少页面闪烁和提高渲染效率的一种逻辑。<br>
> 在传统的渲染中，直接在显示屏上进行 dom 的绘制和更新操作，可能会导致用户看不到完整的画面，从而产生闪烁或者撕裂效果。<br>
> 双缓存的话是通过一个缓冲区进行绘制和修改，然后将更新后的缓冲区与显示的缓冲区进行交换，避免上述问题。 <br>


## update children & 边界处理

- 通过对比新旧节点，判断isSameType为false时创建新节点
    - 没有对旧的节点进行删除
    - 判断isSameType时，对旧节点进行收集
    - commitRoot时，统一对旧节点进行删除
    - 这样的情况只在新节点不会少于旧节点的数量时才能正常显示
        - 以新节点进行遍历，没有对在新节点中不存在的兄弟节点进行处理
        - 所以需要判断oldFiber并依次遍历并进行收集删除


``` javascript
const isSameType = oldFiber && oldFiber.type === child.type;
    let newFiber = null;

    if (isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        sibling: null,
        child: null,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: "update",
      };
    } else {
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        sibling: null,
        child: null,
        dom: null,
        effectTag: "placement",
      };

      if (oldFiber) {
        deletions.push(oldFiber);
      }
    }

```

``` javascript
function commitDeletions(fiber) {
  let fiberParent = fiber.parent;

  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.dom) {
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    commitDeletions(fiber.child)
  }
}
```

### 边界处理

当使用如下表达式：
```jsx
function App() {
  return (show & <p>hello world</p>)
}
```
这时候会得到一个 `false` 的节点，因此在处理的时候，我们要跳过这个节点。
如果 `false` 是第一个节点，那么下面这行代码旧有问题了，更新时就无法更新该 fiber 的child了，child 为 null 了

当节点为false时的处理如：1 === 2 && <div>123</div>, 在这种情况下该节点的值为false，也应在链式结构中被忽略，不进行创建，所以需要处理newFiber没有值时的情况，并对prevFiber跳过赋值。

- 节点为false的情况中存在三种类型
    - 空节点在children开始
    - 空节点在children中间
    - 空节点在children结束


```js
if (!fiber.child)
  fiber.child = newFiber



function update() {
  // 记录当前的
  const currentFiber = wipFiber

  return () => {
    wipRoot = {
      ...currentFiber,
      // reconcileChildren时重新收集 child
      child: null,
      alternate: currentFiber,
    }

    nextWorkOfUnit = wipRoot
    requestIdleCallback(loop)
  }
}
```
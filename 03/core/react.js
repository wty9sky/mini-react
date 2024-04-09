function createTextNode(text) {
  // 创建一个文本节点对象
  return {
    // 节点类型为 TEXT_ELEMENT
    type: 'TEXT_ELEMENT',
    // 节点属性对象
    props: {
      // 节点值为传入的文本
      nodeValue: text,
      // 子节点数组为空
      children: []
    }
  }
}

function createElement(type, props, ...children) {
  // 返回一个对象，包含 type 和 props 属性
  return {
    type,
    props: {
      // 将传入的 props 对象和 children 数组进行合并
      ...props,
      children: children.map((child) => {
        // 如果 child 是字符串类型，则调用 createTextNode 函数创建一个文本节点
        // 否则直接返回 child
        console.log(typeof child,child)
        const isTextNode = typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean';
        return isTextNode ? createTextNode(child) : child;
      })
    }
  }
}

let root = null;

function render(el, container) {
  // 创建一个对象 nextFiberOfUnit，表示下一个Fiber节点的信息
  nextFiberOfUnit = {
    // 指定Fiber节点的DOM容器
    dom: container,
    // 指定Fiber节点的props属性，其中children属性包含传入的el元素
    props: {
      children: [el]
    }
  }

  root = nextFiberOfUnit;
}

function commitRoot() {
  // 遍历根节点
  commitWork(root.child);
  root = null;
}

function commitWork(fiber) {
  // 遍历根节点
  if (!fiber) return;
  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom);
  };
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function createDom(type) {
  // 判断传入的 type 是否为 'TEXT_ELEMENT'
  return type === 'TEXT_ELEMENT'
    // 如果是，则创建一个空的文本节点
    ? document.createTextNode("")
    // 否则，根据传入的 type 创建一个元素节点
    : document.createElement(type)
}

function updateDom(dom, props) {
  // 遍历传入的属性对象props的键
  Object.keys(props).forEach((key) => {
    // 如果键不是'children'
    if (key !== 'children') {
      // 将属性更新到dom对象上
      dom[key] = props[key];
    }
  })
}

function initChildren(fiber, children) {
  // 获取子节点
  // 上一个子节点
  let prevChild = null;
  // 遍历子节点
  children.forEach((child, index) => {
    // 创建新的Fiber节点
    const newFiber = {
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      sibling: null,
      dom: null,
    };
    // 如果是第一个子节点，则将其赋值给Fiber节点的child属性
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      // 否则，将上一个子节点的sibling属性指向新创建的Fiber节点
      prevChild.sibling = newFiber;
    }
    // 更新上一个子节点为新创建的Fiber节点
    prevChild = newFiber;
  })
}

let nextFiberOfUnit = null;
function fiberLoop(deadline) {
  // 标记是否需要让出执行权
  let shouldYield = false;

  // 当不需要让出执行权且还有下一个纤维单元时，执行循环
  while (!shouldYield && nextFiberOfUnit) {
    // 执行当前纤维单元
    nextFiberOfUnit = performfiberOfUnit(nextFiberOfUnit);

    // 检查剩余时间是否小于1毫秒，如果是，则标记需要让出执行权
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextFiberOfUnit && root) {
    commitRoot();
  }

  // 请求下一个空闲时间回调，继续执行 fiberLoop 函数
  requestIdleCallback(fiberLoop);
}

function performfiberOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function';
  // 判断当前 fiber 是否已经有 DOM 元素
  if (!isFunctionComponent) {
    if (!fiber.dom) {
      // 1.创建DOM
      const dom = (fiber.dom = createDom(fiber.type));

      // 将新创建的 DOM 元素添加到父节点的 DOM 中
      // fiber.parent.dom.append(dom);

      // 2.处理Props
      // 根据传入的 props 更新 DOM 元素
      updateDom(dom, fiber.props);
    }
  }

  // 3.转换链表，设置好指针
  // 初始化 fiber 的子节点链表
  const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children;
  initChildren(fiber, children);

  // 4.返回下一个要执行的任务
  // 如果当前 fiber 有子节点，则返回子节点作为下一个要执行的任务
  if (fiber.child) {
    return fiber.child;
  }

  // 如果当前 fiber 没有子节点，但有兄弟节点，则返回兄弟节点作为下一个要执行的任务
  if (fiber.sibling) {
    return fiber.sibling;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }

  // 如果当前 fiber 既没有子节点也没有兄弟节点，则返回父节点的兄弟节点作为下一个要执行的任务
  // return fiber.parent?.sibling;
}

requestIdleCallback(fiberLoop);


const React = {
  render,
  createElement
}

export default React;
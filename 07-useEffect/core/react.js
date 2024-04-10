let root = null;
let currentRoot = null;
let nextFiberOfUnit = null;
let deletions = [];
let wipFiber = null;
let stateHooks = [];
let effectHooks = [];
let stateHookIndex = 0;

function createTextNode(text) {
  // 创建一个文本节点对象
  return {
    // 节点类型为文本元素
    type: 'TEXT_ELEMENT',
    // 节点属性对象
    props: {
      // 节点值为传入的文本
      nodeValue: text,
      // 子节点数组，初始为空
      children: []
    }
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode = typeof child === 'string' || typeof child === 'number';
        // const isTextNode = typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean';
        return isTextNode ? createTextNode(child) : child;
      })
    }
  }
}

function render(el, container) {
  nextFiberOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }
  root = nextFiberOfUnit;
}

function update() {
  let currentFiber = wipFiber;

  return () => {
    root = {
      ...currentFiber,
      alternate: currentFiber
    }
    nextFiberOfUnit = root;
  }
}

function commitRoot() {
  // 遍历根节点
  deletions.forEach(commitRootDeletions);
  commitWork(root.child);
  commitEffectHooks();
  currentRoot = root;
  root = null;
  deletions = [];
}

function commitEffectHooks() {
  function run(fiber) {
    if (!fiber) return
    if (!fiber.alternate) {
      fiber.effectHooks?.forEach((hook) => {
        // hook.callback();
        hook.cleanup = hook.callback();
      })
    } else {
      // update
      // 判断deps有没有改变
      fiber.effectHooks?.forEach((newHook, index) => {
        const oldEffectHook = fiber.alternate?.effectHooks[index];
        const needUodate = oldEffectHook?.deps.some((oldDep, indx) => {
          return oldDep !== newHook?.deps[indx]
        })

        needUodate && (newHook.cleanup = newHook.callback())
      })

    }
    run(fiber.child)
    run(fiber.sibling)
  }

  function runCleanUp(fiber) {
    if (!fiber) return

    fiber.alternate?.effectHooks.forEach((hook) => {
      if(hook.deps.length>0){
        hook.cleanup && hook.cleanup();
      }
    })
    runCleanUp(fiber.child)
    runCleanUp(fiber.sibling)
  }
  runCleanUp(root);
  run(root);

}


function commitRootDeletions(fiber) {
  if (fiber.dom) {
    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent;
    }
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    commitRootDeletions(fiber.child);
  }
}


function commitWork(fiber) {
  // 遍历根节点
  if (!fiber) return;
  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  if (fiber.effectTag === 'UPDATING') {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === 'PLACEMENT') {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    };
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function updateProps(dom, nextProps, prevProps) {
  // 三种情况
  // 1. old有 new没有 ->删除
  Object.keys(prevProps).forEach((key) => {
    if (key !== 'children') {
      if (!(key in nextProps)) {
        dom.removeAtrribute(key);
      }
    }
  })
  // 2. old没有 new有 ->添加
  // 3. old有 new也有 ->更新
  Object.keys(nextProps).forEach((key) => {
    if (key !== 'children') {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith('on')) {
          const eventType = key.slice(2).toLowerCase();
          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  })
}

function createDom(type) {
  return type === 'TEXT_ELEMENT'
    ? document.createTextNode("")
    : document.createElement(type)
}

function initChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;
    let newFiber;
    if (isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: oldFiber.dom,
        effectTag: 'UPDATING',
        alternate: oldFiber
      };
    } else {
      if (child) {
        newFiber = {
          type: child.type,
          props: child.props,
          child: null,
          parent: fiber,
          sibling: null,
          dom: null,
          effectTag: 'PLACEMENT',
        };
      }

      if (oldFiber) {
        deletions.push(oldFiber);
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }

    if (newFiber) {
      prevChild = newFiber;
    }

  })

  while (oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

function fiberLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextFiberOfUnit) {
    nextFiberOfUnit = performfiberOfUnit(nextFiberOfUnit);

    if (root?.sibling?.type === nextFiberOfUnit?.type) {
      nextFiberOfUnit = undefined;

    }
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextFiberOfUnit && root) {
    commitRoot();
  }
  requestIdleCallback(fiberLoop);
}

function updateFunctionComponent(fiber) {
  stateHooks = [];
  stateHookIndex = 0;
  wipFiber = fiber;
  effectHooks = [];

  const children = [fiber.type(fiber.props)];

  initChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    updateProps(dom, fiber.props, {});
  }
  const children = fiber.props.children;
  initChildren(fiber, children);
}
function performfiberOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function';
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

requestIdleCallback(fiberLoop);


function useState(initial) {
  let currentFiber = wipFiber;
  const oldHook = currentFiber.alternate?.stateHooks[stateHookIndex]
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [],
  }

  stateHook.queue.forEach(action => {
    stateHook.state = action(stateHook.state);
  })

  stateHook.queue = [];

  stateHookIndex++;
  stateHooks.push(stateHook);

  currentFiber.stateHooks = stateHooks;

  function setState(action) {
    // stateHook.state = action(stateHook.state);

    let eargerState = typeof action === 'function' ? action(stateHook.state) : action;

    if (eargerState === stateHook.state) return;

    stateHook.queue.push(typeof action === 'function' ? action : () => action);

    root = {
      ...currentFiber,
      alternate: currentFiber,
    }

    nextFiberOfUnit = root;
  }

  return [stateHook.state, setState]
}

function useEffect(callback, deps) {
  const effectHook = {
    callback,
    deps,
    cleanup: undefined,
  }

  effectHooks?.push(effectHook);
  wipFiber.effectHooks = effectHooks;
}

const React = {
  render,
  createElement,
  update,
  useState,
  useEffect
}

export default React;
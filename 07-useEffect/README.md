# 从零实现mini-react(6)：实现useEffect

useEffect 是一个比较重要的 hook，它和 useState 一样，也是用来处理副作用的，它的作用是用来在函数组件中执行。
useEffect 在代码逻辑上和useState 相似。
调用时机：在React完成对Dom树的渲染后，并在浏览器完成绘制之前。


## useEffect 初始化加载
```javascript
useEffect(() => {
  console.log(1)
}, [])
```

useEffect的初始化加载 => Vue3->onMounted
<br>
- useEffect是用在state数据是否发生改变时执行,当deps为空时，应在组件初始化时执行。
- commitEffect在应在构建完dom树结构之后进行执行，即在commitRoot之后执行。
- 执行useEffect逻辑与useState类型,进行数据的采集,并将相应的数据保存在fiber上,在commitEffect时,与之前历史fiber上保存的effectHook进行对比,如果存在差异,则执行对应的effectHook。

``` javascript
const useEffect = (callback, deps) => {
  const effectHook = {
    callback,
    deps
  }
  // 这里之所以用 wipFiber 因为它只有在每次有函数组件的时候才会调用，所以它肯定是一个函数组件
  wipFiber.effectHook = effectHook
}

  if (!nextWorkOfUnit && wipRoot) {
    commitRoot()
    commitEffectHook()
  }

const commitEffectHook = () => {
  const run = (fiber) => {
    if (!fiber) return
     fiber.effectHook?.callback()
    // 这里为啥要递归child 和 sibling
    run(fiber.child)
    run(fiber.sibling)
  }

  run(wipFiber)
}
```

## 实现useEffect的update
```javascript
  const [count, setCount] = React.useState(0)
  const handleClick = () => {
    setCount((count) => count + 1)
  }
  React.useEffect(() => {
    console.log(11111)
  }, [count])
```

实现方式：
- 实现我们需要区分初始化和 update
- 这个我们可以通过我们的 alternate 指针来区分
    - 没有就是初始化
        - 然后需要对比老的新的依赖项的每一项和老的依赖项的对应的项值有没有变化
        - 只要有一个值不一样我们就要重新调用

```javascript
const commitEffectHook = () => {
  const run = (fiber) => {
    if (!fiber) return
    if (!fiber.alternate) {
      // init
      fiber.effectHook?.callback()
    } else {
      // update
      const oldEffect = fiber.alternate?.effectHook
      const needUpdate = fiber.effectHook?.deps.some((dep, index) => {
        return dep !== oldEffect.deps[index]
      })

      needUpdate && fiber.effectHook?.callback()
    }
    // 这里为啥要递归child 和 sibling
    run(fiber.child)
    run(fiber.sibling)
  }

  run(wipFiber)
}
```

## 实现多个 useEffect
这里和useState逻辑相似，都是通过effectHooks数组来保存多个useEffect的逻辑。

```javascript
let effectHooks = []
const useEffect = (callback, deps) => {
  const effectHook = {
    callback,
    deps
  }
  effectHooks.push(effectHook)
  wipFiber.effectHooks = effectHooks
}

const commitEffectHooks = () => {
  const run = (fiber) => {
    if (!fiber) return
    if (!fiber.alternate) {
      // init
      fiber.effectHooks?.forEach(hook => hook?.callback())
    } else {
      // update
      fiber.effectHooks?.forEach((newHook, index) => {
        const oldEffect = fiber.alternate?.effectHooks[index]
        const needUpdate = newHook?.deps.some((dep, i) => {
          return dep !== oldEffect.deps[i]
        })

        needUpdate && newHook?.callback()
      })
    }
  
    run(fiber.child)
    run(fiber.sibling)
  }

  run(wipFiber)
}
```


## 实现useEffect的cleanup
1. 存下useEffect 返回的 cleanup 函数，也就是调用useEffect 的 callback 把返回值存下来

```javascript
const useEffect = (callback, deps) => {
  const effectHook = {
    callback,
    deps,
    cleanup: undefined
  }
  effectHooks.push(effectHook)
  wipFiber.effectHooks = effectHooks
}
  const run = (fiber) => {
    if (!fiber) return
    if (!fiber.alternate) {
      // init
      fiber.effectHooks?.forEach(hook => (hook.cleanup = hook?.callback()))
    } else {
      // update
      fiber.effectHooks?.forEach((newHook, index) => {
        if (newHook.deps.length > 0) {
          const oldEffect = fiber.alternate?.effectHooks[index]
          const needUpdate = newHook?.deps.some((dep, i) => {
            return dep !== oldEffect.deps[i]
          })

          needUpdate && (newHook.cleanup = newHook?.callback())
        }
      })
    }
  }
```

2. 在执行当前所有的 useEffect 之前调用
```javascript
  const runCleanup = (fiber) => {
    if (!fiber) return
    // 取上一次的 effectHooks
    fiber.alternate?.effectHooks?.forEach(hook => {
      // [] 不应该执行
      if (hook.deps.length > 0) {
      hook.cleanup?.()
      }
    })
    runCleanup(fiber.child)
    runCleanup(fiber.sibling)
}

runCleanup(wipFiber)
run(wipFiber)
```
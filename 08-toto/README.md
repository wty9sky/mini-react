# 从零实现mini-react(7)：实现TodoList检验MiniReact

使用mini-react实现TodoList功能，并检验MiniReact是否满足要求。

## 实现TodoList功能
- [x] 列表展示
- [x] 添加todo
- [x] 点击添加按钮
- [x] 删除todo
- [x] 完成todo
- [x] 本地存储
- [x] 刷新页面时，读取本地存储的数据，并渲染到页面上
- [x] filter
    - [x] 显示所有的todos
    - [x] 显示已完成的todos
    - [x] 显示未完成的todos

## 遇到问题
### 在 useEffect 里修改 state 页面没更新
```javascript
  React.useEffect(() => {
    if (checkedValue === 'all') {
      setDisplayList(list)
    } else {
      const newList = list.filter(item => item.status === checkedValue)
      setDisplayList(newList)
    }
    console.log(list, 'hhhhdd')
  }, [list, checkedValue])

```
``` jsx
const div = <div>{ ...displayList.map((item) => (...)}</div>;
```
<br>

- 问题原因：我们先去调用了 commitWork 将视图更新完，再调用 commitEffectHooks，所以虽然我们的数据变了但是视图没有改变
- 解决方案：
    - 在 commitEffectHooks 后重新调用 commitWork
    - useState 在 setState 后会重新修改 wipRoot 和 nextWorkOfUnit 赋值
    - 只要它有值了说明我们在 effectHooks 又改变了我们的 state，我们就应该重新执行 commitRoot
    
```javascript
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot()
  }
  if (nextWorkOfUnit && !wipRoot) {
    wipRoot = currentRoot
  }
```

### style样式不渲染问题

解决方案：

``` javascript
  Object.keys(nextProps).forEach(key => {
    if (key !== 'children') {
      if (nextProps[key] !== prevProps[key]) {
        // 不相等进行更新赋值
        const isEvent = key.startsWith('on')
        if (isEvent) {
          const eventType = key.slice(2).toLocaleLowerCase()
          dom.removeEventListener(eventType, prevProps[key])
          dom.addEventListener(eventType, nextProps[key])
        } else {
          if (key === 'style') {
            Object.assign(dom[key], nextProps[key])
          } else {
            dom[key] = nextProps[key]
          }
        }
      }
    }
  })
```
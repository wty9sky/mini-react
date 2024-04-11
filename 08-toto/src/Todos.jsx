import React from '../core/react.js';

export function Todos() {
    const [inputValue, setInputValue] = React.useState('');
    const [todos, setTodos] = React.useState([])
    const [filter, setFilter] = React.useState('all');
    const [displayTodos, setDisplayTodos] = React.useState([]);

    React.useEffect(()=>{
        const rawTodos = localStorage.getItem('todos');
        if(rawTodos){
            setTodos(JSON.parse(rawTodos))
        }else{
            localStorage.setItem('todos',JSON.stringify(todos))
        }
    },[])

    function saveTodos(){
        localStorage.setItem('todos', JSON.stringify(todos))
    }

    React.useEffect(()=>{
        saveTodos();
    },[todos])

    React.useEffect(()=>{
        if(filter === 'all'){
            setDisplayTodos(todos)
        }else if(filter === 'true'){
            const newTodos = todos.filter((todo)=>{
                return todo.isDone === true;
            });
            setDisplayTodos(newTodos)
        }else if(filter === 'false'){
            const newTodos = todos.filter((todo)=>{
                return todo.isDone === false;
            });
            setDisplayTodos(newTodos)
        }
    },[filter,todos])

    const addTodos = () => {
        if (inputValue.trim() !== '') {
            setTodos((todo) => [...todo, { value: inputValue, isDone: false, "id": crypto.randomUUID() }])
        }
        setInputValue('')
        return;
    }

    const deleteTodo = (id) => {
        const newTodos = todos.filter((todo) => {
            return todo.id !== id;
        })

        setTodos(newTodos);
    }

    const changeTodoStatus = (id) => {
        const newTodos = todos.map((todo) => {
            if (todo.id === id) {
                return {
                    ...todo,
                    isDone: !todo.isDone
                }
            }
            return todo;
        })

        console.log(newTodos);

        setTodos(newTodos);
    }

    function select(e){
        // const selectValue = e.target.value
        // if(selectValue === 'all'){
        //     setTodos(todos.filter((todo)=>{
        //         return todo.isDone === (selectValue === 'true')
        //     })
        // }else{
        //     setTodos(todos.filter((todo)=>{
        //         return todo.isDone === (selectValue === 'true')
        //     })
        // }
    }


    return (
        <div>
            <h1>Todos</h1>
            <input type="text" placeholder='请输入Todo' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <button onClick={addTodos}>添加</button>
            <div>
                <input type='radio' name='filter' value='all' onChange={()=>setFilter('all')} checked={filter==='all'} />
                <label>全部</label>

                <input type='radio' name='filter' value={true} onChange={()=>setFilter('true')}  checked={filter==='true'} />
                <label>已完成</label>

                <input type='radio' name='filter' value={false} onChange={()=>setFilter('false')}  checked={filter==='false'}/>
                <label>未完成</label>
            </div>

            <ul>
                {
                    ...displayTodos.map((todo, index) => {
                        return (
                            <li style="height:40px;" key={index}>
                                <TodoItem todo={todo} deleteTodo={deleteTodo} changeTodoStatus={changeTodoStatus} />
                            </li>
                        )
                    })
                }
            </ul>
        </div>
    )
}

function TodoItem({ todo, deleteTodo, changeTodoStatus }) {
    return (
        <div>
            <span style="margin:10px" className={todo.isDone ? 'done' : ''}> {todo.value}</span>
            <button onClick={() => changeTodoStatus(todo.id)} style="margin:10px;">{todo.isDone ? '未完成' : '已完成'}</button>
            <button onClick={() => deleteTodo(todo.id)} style="margin:10px;">删除</button>
        </div>
    )
}
import React from './core/react.js';
import './asset/index.css';

const useState = React.useState;
function Foo(){
    const [count,setCount] = useState(10);
    const [bar,setBar] = useState('bar');
    function handleClickFoo(){
        setCount(count+1);
    }
    function handleClickBar(){
        setBar(bar+' hello world')
    }
    return (
        <div>
            <h1>{count}</h1>
            <div>{bar}</div>
            <button onClick={handleClickFoo}>click</button>
            <button onClick={handleClickBar}>click</button>
        </div>
    )
}

function App(){
    return (
        <div class="hello" id="hello">
            <Foo />
    </div>
    );
}


export default App;
import React from './core/react.js';
import './asset/index.css';


let show = false;
function Counter(){
    return (
        <>
        <button onClick={()=>{
            num++;
            props.id = num;
            React.update();
        }} onAbort={()=>{
            console.log('blur');
        }}>+1</button>
        <div {...props}>count:{num}次</div>
        </>
    )
}

function showStatus(){
    show = !show;
    React.update();
}   

function App(){
    return (
        <div class="hello" id="hello">
            <button onClick={showStatus}>更改显隐状态</button>
            <span>{show?'show':'hide'}</span>
        </div>
    );
}

// console.log(AppFun);

export default App;
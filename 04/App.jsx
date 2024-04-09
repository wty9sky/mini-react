import React from './core/react.js';
import './asset/index.css';


let num = 1;
let props = {id:1,class:'hello'};
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
// function Counter2(){
//     return <Counter num={10}></Counter>;
// }

// function BooleanComponent({bool}){
//     return <div>{bool?true:false}</div>
// }

// const App = <div class="hello" id="hello">Hello Mini React!<br/><div class="text">My name is Wty!</div><Counter2></Counter2></div>;


function App(){
    return (
        <div class="hello" id="hello">
            {/* Hello Mini React!
            <br/>
        <div class="text">My name is Wty!</div> */}
        <Counter num={1} />
        {/* <BooleanComponent bool={true}/> */}
        </div>
    );
}

// console.log(AppFun);

export default App;
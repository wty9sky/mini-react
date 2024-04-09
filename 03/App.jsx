import React from './core/react.js';

function Counter({num}){
    return <div>count:{num}次</div>
}

function Counter2(){
    const arr= [1,2,3];
    return (
        arr.map((info)=>{
            return <Counter num={info}></Counter>
        })
    );
}

console.log(Counter2());

function BooleanComponent({bool}){
    return <div>{bool?true:false}</div>
}

// const App = <div class="hello" id="hello">Hello Mini React!<br/><div class="text">My name is Wty!</div><Counter2></Counter2></div>;


function App(){
    return (
        <div class="hello" id="hello">Hello Mini React!<br/><div class="text">My name is Wty!</div><Counter2></Counter2><BooleanComponent bool={true}/></div>
    );
}

// console.log(AppFun);

export default App;
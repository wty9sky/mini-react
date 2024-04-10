import React from './core/react.js';
import './asset/index.css';

let countFoo = 1;
function Foo(){
    const update = React.update();

    function handleClick(){
        countFoo++;
        update();
    }
    return (
        <div>
            <h1>foo</h1>
            {countFoo}
            <button onClick={handleClick}>click</button>
        </div>
    )
}

function FooShow(){
    return (
        <div>
            <h1>foo</h1>
        </div>
    )
}

let countBar = 1;
function Bar(){
    const update = React.update();

    function handleClick(){
        countBar++;
        update();
    }
    return (
        <div>
            <h1>bar</h1>
            {countBar}
            <button onClick={handleClick}>click</button>
        </div>
    )
}

let show = true;
function ShowStatus(){
    const update = React.update();

    function handleClick(){
        show = !show;
        update();
    }

    return (
        <div>
            <div>{show && <FooShow/>}</div>
            <button onClick={handleClick}>更改显隐状态</button>
        </div>
    )
}
function UpdateModule(){
    return (
        <div>
            <Foo/>
            <Bar/>
        </div>
    )
}
function App(){
    return (
        <div class="hello" id="hello">
            <ShowStatus/>
            <UpdateModule />
    </div>
    );
}


export default App;
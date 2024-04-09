
/** @jsx CVue.create */
import CVue from './core/react.js';

const App = CVue.createElement("div", { id: "app" }, 'app','child');

// const App = <div class="hello" id="hello">Hello Mini React!<br/><div class="text">My name is Wty!</div></div>;

const AppFun = function(){
    return <div class="hello" id="hello">Hello Mini React!<br/><div class="text">My name is Wty!</div></div>;
}

console.log(AppFun);

export default App;
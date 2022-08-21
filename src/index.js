import React from "react";
import {createRoot} from "react-dom/client";
import Gradient from "javascript-color-gradient";
import seedrandom from "seedrandom";
import "./index.css"

function RenderBox(props){
    const border = props.col!=null ? "none": "solid 1px #fff";
    return(
        <div 
            onClick={!props.correct?(e)=>props.onClick(e,props.id):null} 
            id={props.selected?"selected":null} 
            className={props.correct?"correct":null}
            style={{background:props.col,border:border}}
        ></div>
    )
}
function arrayEqual(a,b){
    if(a.length != b.length){
        return false;
    }
    for(let i=0;i<a.length;i++){
        if(a[i]!=b[i]){
            return false
        }
    }
    return true;
}

class Board extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            done:true,
            turn:0,
            turnsTaken:0,
            gradient:[],
            randomGradient:[],
            userGradient:[],
        }
    }
    newTurn(e,id){
        let newUGrad = this.state.userGradient;
        newUGrad[id] = this.state.randomGradient[this.state.turn];
        let newTurn = this.state.turnsTaken+1;
        this.setState({
            turn:this.state.randomGradient.length-1<=this.state.turn? 0:this.state.turn+=1,
            userGradient:newUGrad,
            turnsTaken:newTurn,
        })
        if(arrayEqual(this.state.gradient,this.state.userGradient)){
            this.setState({
                done:true,
            })            
        }
    }

    randomColour(addition){
        const d = new Date();
        let dString = `${d.getYear()}${d.getMonth()}${d.getDate()}${addition}`
        const hexVal = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
        let num = "";
        
        for(let i=0;i<6;i++){
            dString+=i;
            let numberByDay = seedrandom(dString);
            let randNum = Math.floor(numberByDay()*hexVal.length);
            num += hexVal[randNum];
        }
        return num;
    }
    createGradient(){
        const newGradient = new Gradient()
            .setColorGradient(`#${this.randomColour(0)}`,`#${this.randomColour(1)}`)
            .getColors();
        this.state.gradient=newGradient.map(i=>{return {col:i,done:false}});
        this.state.userGradient=Array(newGradient.length).fill(null)
    }
    createGBoxes(){
        let toReturn = [];
        let count=0;
        if(this.state.done){
            this.createGradient();
            let randomG = this.state.gradient.slice();
            let currentIndex = randomG.length,  randomIndex;
            while (currentIndex != 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
            
                [randomG[currentIndex], randomG[randomIndex]] = [
                randomG[randomIndex], randomG[currentIndex]];
            }
            this.state.randomGradient = randomG;
        }
        this.state.done = false;
        for(const g of this.state.randomGradient){
            toReturn.push(
                <RenderBox
                    key={"0"+this.state.gradient.indexOf(g)}
                    selected={count==this.state.turn?true:false}
                    done={g.done}
                    col={g.col}
                    correct={null}
                />
            )
            count++;
        }
        return toReturn;
    }
    createUBoxes(){
        let newBoxes = [];
        let count=0;
        for(const box of this.state.userGradient){
            if(this.state.gradient[count]==this.state.userGradient[count]){
                this.state.randomGradient[this.state.randomGradient.indexOf(this.state.gradient[count])];
            }
            newBoxes.push(
                <RenderBox
                    key={"1"+count}
                    col={box?box.col:null}
                    id={count}
                    correct={this.state.gradient[count]==this.state.userGradient[count]}
                    onClick={(e,id)=>this.newTurn(e,id)}
                />
            )
            count++;
        }
        return newBoxes;
    }   
    render(){
        return(
            <div id="board">
                <aside className="colourCont" id="toDo">
                    {this.createGBoxes()}
                </aside>
                <aside className="colourCont" id="userG">
                    {this.createUBoxes()}
                </aside>
                <p id="turnCount">{this.state.turnsTaken}</p>
            </div>
        )
    }
}

class Game extends React.Component{
    render(){
        return(
            <Board/>
        )
    }
}

const container = document.querySelector("#root");
const root = createRoot(container);
root.render(
    <Game/>
)
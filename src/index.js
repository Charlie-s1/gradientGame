import React from "react";
import {createRoot} from "react-dom/client";
import Gradient from "javascript-color-gradient";
import "./index.css"

function RenderBox(props){
    const border = props.col!=null ? "none": "solid 1px #fff";
    return(
        <div 
            onClick={(e)=>props.onClick(e,props.id)} 
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
            gradient:[],
            randomGradient:[],
            userGradient:[],
        }
    }
    newTurn(e,id){
        let newUGrad = this.state.userGradient;
        newUGrad[id] = this.state.randomGradient[this.state.turn];
        
        this.setState({
            turn:this.state.randomGradient.length-1<=this.state.turn? 0:this.state.turn+=1,
            userGradient:newUGrad,
        })
        if(arrayEqual(this.state.gradient,this.state.userGradient)){
            this.setState({
                done:true,
            })            
        }
    }

    randomColour(){
        const hexVal = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
        let num = "";
        for(let i=0;i<6;i++){
            num += hexVal[Math.floor(Math.random()*hexVal.length)];
        }
        return num;
    }
    createGradient(){
        const newGradient = new Gradient()
            .setColorGradient(`#${this.randomColour()}`,`#${this.randomColour()}`)
            .getColors();
        this.state.gradient=newGradient;
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
                    selected={count==this.state.turn?true:false}
                    col={g}
                    key={"0"+this.state.gradient.indexOf(g)}
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
            newBoxes.push(
                <RenderBox
                    col={box}
                    key={"1"+count}
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
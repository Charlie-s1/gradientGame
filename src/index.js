import React from "react";
import {createRoot} from "react-dom/client";
import "./index.css"

function RenderBox(props){
    return(
        <div 
            onClick={(e)=>props.onClick(e,props.id)} 
            id={props.selected?"selected":null} 
            className={props.correct?"correct":null}
            style={{background:props.col}}
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
            userGradient:Array(8).fill([null,null,null]),
        }
    }
    newTurn(e,id){
        let newUGrad = this.state.userGradient;
        newUGrad[id] = this.state.randomGradient[this.state.turn];
        
        // console.log(this.state.gradient==this.state.randomGradient);
        // console.log(this.state.gradient,this.state.usergradient);
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
    getColours(){
        let colour1 = Math.floor(Math.random() *256);
        let colour2 = Math.floor(Math.random() *256);
        let colour3 = Math.floor(Math.random() *256);

        let colours = [colour1,colour2,colour3];

        return colours;
    }
    createGradient(){
        let col = this.getColours();
        let newGradient = [];
        for(let i=0;i<8;i++){
            newGradient.push(col.concat());
            col[0]-20>0 ? col[0]-=20 : col[0]=0;
            col[1]-20>0 ? col[1]-=20 : col[1]=0;
            col[2]-20>0 ? col[2]-=20 : col[2]=0;

        }
        this.state.gradient=newGradient;
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
                    col={`rgb(${g[0]},${g[1]},${g[2]})`}
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
                    col={`rgb(${box[0]},${box[1]},${box[2]})`}
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
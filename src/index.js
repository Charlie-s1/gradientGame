import React from "react";
import {createRoot} from "react-dom/client";
import Gradient from "javascript-color-gradient";
import seedrandom from "seedrandom";
import "./index.css"

const firstPuzzle = new Date("2022/08/17");
/**
 * create gradient container
 */
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
/**
 * Create finish screen and allow user to share
 */
function RenderDoneScreen(props){
    
    const date=new Date();
    const tDiff = date.getTime()-firstPuzzle.getTime();
    const puzzleNum = Math.floor(tDiff/(1000*3600*24));

    return(
        <div id="doneScreenCont" style={{display:props.show ? "flex" : "none"}}>
            <div id="doneText">
                <h1>Puzzle {puzzleNum}</h1>
                <p>Completed in {props.turns} turns</p>
                <button id="share" onClick={(e)=>share(e,puzzleNum,props.turns)}>Share</button>
                <p id="copyMsg">Copied to Clipboard</p>
            </div>
        </div>
    )
}
/**
 * Share score or copy to clipboard if cannot share
 */
async function share(e,puzzleNum,turns){
    
    
    const shareData = {
        title:"Gradient Game",
        text:`Puzzle: ${puzzleNum}\nTurns:  ${turns}\n`,
        url:"https://charlie-s.com/gradientGame"
    }
    const shareMsg = document.querySelector("#copyMsg")
    try{
        if(navigator.userAgent.toLowerCase().indexOf('firefox')>-1){
            throw "cannot share";
        }
        await navigator.share(shareData)
        shareMsg.textContent = "Share Successful"
        shareMsg.style.visibility = "visible";   
    }catch(err){
        try{
            await navigator.clipboard.writeText(`Puzzle: ${puzzleNum}\nTurns: ${turns}\n\nhttps://charlie-s.com/gradientGame`);
            shareMsg.textContent = "Copied to Clipboard"
            document.querySelector("#copyMsg").style.visibility = "visible";    
        }
        catch(err){
            alert("Error sharing");
        }
        
    }
}
/**
 * Compare two arrays and return true if equal
 */
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
/**
 * go to next on random gradient list
 * check if any on list are correct
 * check if game has finished
 */
    newTurn(e,id){
        let newUGrad = this.state.userGradient.slice();
        newUGrad[id] = this.state.randomGradient[this.state.turn];
        let newTurn = this.state.turnsTaken+1;
        let newRandomG = this.state.randomGradient.slice();
        newRandomG.map((g)=>{
            newUGrad.map((n)=>{
                if(g.col==n.col && n.correct){
                    g.correct = true;
                }
            });
        });

        if(!this.state.done){
            if(this.state.turn==newRandomG.length-1 && newRandomG[0].correct){
                this.state.turn=0;
            }
            if(newRandomG[this.state.turn+1] && newRandomG[this.state.turn+1].correct){
                for (let i=this.state.turn;i<newRandomG.length;i++){
                    if(newRandomG[this.state.turn+1] && newRandomG[this.state.turn+1].correct){
                        this.state.turn++;
                    }
                }
            }
        }
        if(arrayEqual(this.state.gradient,this.state.userGradient)){
            console.log("done");
            this.setState({
                done:true,
            })            
        }
        this.setState({
            randomGradient:newRandomG,
            turn:this.state.randomGradient.length-1<=this.state.turn? 0:this.state.turn+=1,
            userGradient:newUGrad,
            turnsTaken:newTurn,
        });
    }
/**
 * create colours dependin on date and addition
 */
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
/**
 * create two colours using randomColour()
 * create gradient with 10 steps between the two colours
 */
    createGradient(){
        const newGradient = new Gradient()
            .setColorGradient(`#${this.randomColour(0)}`,`#${this.randomColour(1)}`)
            .getColors();
        this.state.gradient=newGradient.map(i=>{return {col:i,correct:false}});
        this.state.userGradient=Array(newGradient.length).fill({});
    }
/**
 * randomise gradient and return a box for each colour using RenderBox
 */
    createGBoxes(){
        let toReturn = [];
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
        this.state.done = arrayEqual(this.state.userGradient,this.state.gradient)
        const rGradient = this.state.randomGradient.slice();
        rGradient.map((n,index)=>{
            toReturn.push(
                <RenderBox
                    key={"0"+index}
                    selected={index==this.state.turn?true:false}
                    col={n.col}
                    correct={n.correct}
                />
            )
        })
        return toReturn;
    }
/**
 * create a box for each of user input using RenderBox
 */
    createUBoxes(){
        let newBoxes = [];
        let count=0;
        for(const box of this.state.userGradient){
            if(this.state.gradient[count]==this.state.userGradient[count]){
                this.state.userGradient[count].correct = true;
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
/**
 * Create UI using createGBoxes(), createUBoxes() and show current score
 */   
    render(){
        return(
            <div id="board">
                <aside className="colourCont" id="toDo">
                    {this.createGBoxes()}
                </aside>
                <aside className="colourCont" id="userG">
                    {this.createUBoxes()}
                </aside>
                <RenderDoneScreen
                    show={this.state.done}
                    turns={this.state.turnsTaken} 
                />
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
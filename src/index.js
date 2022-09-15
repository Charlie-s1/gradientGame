import React from "react";
import {createRoot} from "react-dom/client";
import Gradient from "javascript-color-gradient";
import seedrandom from "seedrandom";
import CookieConsent, {Cookies, getCookieConsentValue} from "react-cookie-consent";
import "./index.css"

const firstPuzzle = new Date("2022/08/17");
// const startPuzzle = Cookies.get("startTime") ? new Date(Cookies.get("startTime")) : new Date();
const startPuzzle = new Date();
const expireDate = new Date();
expireDate.getFullYear(startPuzzle.getFullYear());
expireDate.setMonth(startPuzzle.getMonth());
expireDate.setDate(startPuzzle.getDate()+1);
expireDate.setHours(0);
expireDate.setMinutes(0);
expireDate.setSeconds(0);

let refresh = Cookies.get("refreshCount") ? +Cookies.get("refreshCount") + 1 : 1;;

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
 * create help screen
 */
function RenderHelpScreen(props){
    return(
        <div id="helpScreenCont">
            <div id="helpText">
                <p id="closeHelp" onClick={()=>document.querySelector("#helpScreenCont").style.display = "none"}>X</p>
                <h1>How To Play</h1>
                <br></br>
                <p>Complete the gradient in as little turns as possible</p>
                <p>Click/Tap on the boxes on the right of the screen to fill the selected colour from the left into it</p>
                <p>The box on the right will change appearance when it is correct</p>
                <p>Keep going until all of the boxes are correct</p>
            </div>
        </div>
    )
}
/**
 * Create finish screen and allow user to share
 */
function RenderDoneScreen(props){
    
    const date=new Date();
    const tDiff = date.getTime()-firstPuzzle.getTime();
    const puzzleNum = Math.floor(tDiff/(1000*3600*24));
    const timeTaken = Math.abs((props.start.getTime() - date.getTime())/1000); 
    
    return(
        <div id="doneScreenCont" style={{display:props.show ? "flex" : "none"}}>
            <div id="doneText">
                <h1>Puzzle {puzzleNum}</h1>
                <p>Completed in {props.turns} turns</p>
                <p>and took {timeTaken} seconds</p>
                <p>with {refresh} {refresh>1?"tries":"try"}</p>
                <button id="share" onClick={(e)=>share(e,puzzleNum,props.turns,timeTaken)}>Share</button>
                <p id="copyMsg">Copied to Clipboard</p>
            </div>
            <div id="footer">
                <div id="emailCont">
                    <p>Suggestions? Please send them to <u>gradient.game@charlie-s.com</u></p>
                </div>
            </div>
        </div>
    )
}
/**
 * Share score or copy to clipboard if cannot share
 */
async function share(e,puzzleNum,turns,time){
    const shareData = {
        title:"Gradient Game",
        text:`Puzzle: ${puzzleNum}\nTurns:  ${turns}\nTries:   ${refresh}\nTime:   ${time}sec\n`,
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
            await navigator.clipboard.writeText(`Puzzle: ${puzzleNum}\nTurns:  ${turns}\nTries:   ${refresh}\nTime:   ${time}sec\nhttps://charlie-s.com/gradientGame`);
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
            reverse:null,
        }
        if (getCookieConsentValue) {
            props.setCookies();
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
        let turnNum = this.state.turn;

        if(!this.state.done){
            //skip complete boxes
            if(newRandomG[turnNum+1] && newRandomG[turnNum+1].correct){
                for (let i=turnNum;i<newRandomG.length;i++){
                    if(newRandomG[turnNum+1] && newRandomG[turnNum+1].correct){
                        ++turnNum;
                    }
                }
            }
            //go to start if complete
            if (newRandomG.length-1<=turnNum){
                turnNum=0;
            }else{
                ++turnNum;
            }
            //if 0 is complete loop again
            if(turnNum==0 && newRandomG[0].correct){
                turnNum=-1;

                if(newRandomG[turnNum+1] && newRandomG[turnNum+1].correct){
                    for (let i=turnNum;i<newRandomG.length;i++){
                        if(newRandomG[turnNum+1] && newRandomG[turnNum+1].correct){
                            ++turnNum;
                        }
                    }
                    ++turnNum;
                }
            }
        }
        
        this.setState({
            randomGradient:newRandomG,
            turn:turnNum,
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
        this.state.done = this.state.reverse ? 
            arrayEqual(this.state.userGradient,this.state.gradient.slice().reverse()) : 
            arrayEqual(this.state.userGradient,this.state.gradient);
        
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
 * check order of gradient in user box
 */
    createUBoxes(){
        let newBoxes = [];
        let count=0;
        const gradient = this.state.gradient.slice();
        const rGradient = gradient.slice().reverse();
        const uGradient = this.state.userGradient.slice();
        const randomGradient = this.state.randomGradient.slice();

        for(const box of this.state.userGradient){
            
            newBoxes.push(
                <RenderBox
                    key={"1"+count}
                    col={box?box.col:null}
                    id={count}
                    correct={this.state.reverse ? rGradient[count]==uGradient[count] : gradient[count]==uGradient[count]}
                    onClick={(e,id)=>this.newTurn(e,id)}
                />
            )
            count++;
        }
        
        this.state.randomGradient = randomGradient;
        return newBoxes;
    }
    createUI(){
        const gradient = this.state.gradient.slice();
        const rGradient = gradient.slice().reverse();
        const uGradient = this.state.userGradient.slice();
        let newRandomG = this.state.randomGradient.slice();
        const reverse = this.state.reverse;


        uGradient.map((n,i)=>{
            //check if user is going in reverse order
            if(gradient[i]==n && reverse==null){
                this.state.reverse = false;
            }else if(rGradient[i]==n && reverse==null){
                this.state.reverse = true;
            }
            //check if correct placement depending on the order
            if (this.state.reverse){
                if(rGradient[i]==n){
                    n.correct = true;
                }
            }
            if(!this.state.reverse){
                if(gradient[i]==n){
                    n.correct = true;
                }
            }
        });
        newRandomG.map((g)=>{
            //make random gradient item correct if placed correctly
            uGradient.map((n)=>{
                if(g.col==n.col && n.correct){
                    g.correct = true;
                }
            });
        });

        this.state.randomGradient = newRandomG;
        this.state.userGradient = uGradient;
        return(
            <div id="gameArea">
                <aside className="colourCont" id="toDo">
                    {this.createGBoxes()}
                </aside>
                <aside className="colourCont" id="userG">
                    {this.createUBoxes()}
                </aside>
            </div>
        )
    }
/**
 * Create UI using createGBoxes(), createUBoxes() and show current score
 */   
    render(){
        return(
            <div id="board">
                {this.createUI()}
                <RenderDoneScreen
                    show={this.state.done}
                    turns={this.state.turnsTaken}
                    start={startPuzzle}
                />
                <RenderHelpScreen
                />
                <p id="turnCount">{this.state.turnsTaken}</p>
                <p id="helpToggle" onClick={(e)=>{
                    document.querySelector("#helpScreenCont").style.display = "flex"
                }}>?</p>
            </div>
        )
    }
}

class Game extends React.Component{
    cookiesAccepted(e){
        Cookies.set("refreshCount",refresh,{sameSite:"Lax",expires:expireDate});
        // Cookies.set("startTime",startPuzzle,{sameSite:"Lax"});
    }
    render(){
        return(
            <div>
                <Board
                    setCookies = {(e)=>this.cookiesAccepted(e)}
                />
                <CookieConsent
                    style={{fontFamily:"sans-serif", background:"#1e282c"}}
                    buttonStyle={{
                        background:"#1e282c",
                        height:"2rem", 
                        boxShadow: "5px 5px 10px #13191c,-5px -5px 10px #29373c", 
                        borderRadius:"10px", 
                        color:"white",
                    }}
                    onAccept={(e)=>this.cookiesAccepted(e)}
                >
                    This website uses cookies to enhance the user experience.
                </CookieConsent>
            </div>
        )
    }
}

const container = document.querySelector("#root");
const root = createRoot(container);
root.render(
    <Game/>
)
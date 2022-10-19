import React from "react";
import {createRoot} from "react-dom/client";
import Gradient from "javascript-color-gradient";
import seedrandom from "seedrandom";
import CookieConsent, {Cookies, getCookieConsentValue} from "react-cookie-consent";
import "./index.css";
import ReactGA from "react-ga4";
import {Chart} from "chart.js/auto";
import {Bar} from "react-chartjs-2";

const firstPuzzle = new Date("2022/08/17");
const startPuzzle = new Date();
const expireDate = new Date();
expireDate.getFullYear(startPuzzle.getFullYear());
expireDate.setMonth(startPuzzle.getMonth());
expireDate.setDate(startPuzzle.getDate()+1);
expireDate.setHours(0);
expireDate.setMinutes(0);
expireDate.setSeconds(0);

const streakExpire = new Date(expireDate);
streakExpire.setDate(expireDate.getDate()+1);

const scores = {
    "goodTime" : 30,
    "okayTime" : 60,
    "goodTurns" : 10,
    "okayTurns" : 15,
    "goodRefresh" : 1,
    "okayRefresh" : 3,
}

let savedStats = Cookies.get("savedStats") ? JSON.parse(Cookies.get("savedStats")) : {"good":0,"okay":0,"bad":0,"updated":0};
let refresh = Cookies.get("refreshCount") ? +Cookies.get("refreshCount") + 1 : 1;
let savedScore = Cookies.get("savedScore") || null;
let streak = Cookies.get("currentStreak") ? JSON.parse(Cookies.get("currentStreak")) : {"score":1,"updated":new Date()};
if(new Date(streak.updated).toDateString() != new Date().toDateString()){
    streak.score+=1;
} 
let longestStreak = Cookies.get("longestStreak") ? +Cookies.get("longestStreak") : streak.score;
if (longestStreak < streak.score){
    longestStreak = streak.score;
}

ReactGA.initialize("G-FLKH25X653");
ReactGA.send("pageview");
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
function chooseEmoji(num,best,good){
    const emojis = {
        "best":"\u{1f525}",
        "good":"\u{1f62c}",
        "bad":"\u{1f922}",
    }
    if(num<=best){
        return emojis.best;
    }else if(num<=good){
        return emojis.good;
    }else{
        return emojis.bad;
    }
}
class RenderDoneScreen extends React.Component{
    constructor(props){
        const date=new Date();
        const tDiff = date.getTime()-firstPuzzle.getTime();
        const statsInfo = JSON.parse(props.info)
        super(props);
        this.state = {
            date:new Date(),
            newPuzzleDate:expireDate,
            stats:statsInfo,
            puzzleNum:Math.floor(tDiff/(1000*3600*24)),
            timeTaken:statsInfo ? Math.abs((new Date(statsInfo.timeStart).getTime() - new Date(statsInfo.timeFin).getTime())/1000) : null
        }

    }
    setStats(){
        const timeTaken = Math.abs((this.props.start-this.props.finish)/1000);
        const turns = this.state.stats ? this.state.stats.turnsTaken : this.props.turns;
        const time = this.state.stats ? this.state.timeTaken : timeTaken;
        const refreshes = this.state.stats ? this.state.stats.refreshes : refresh;

        function getScores(n,good,okay){
            if(n<=good){
                return "good"
            }else if(n<=okay){
                return "okay"
            }else{
                return "bad"
            }
        }
        
        let emojiScores = [
            getScores(turns,scores.goodTurns,scores.okayTurns),
            getScores(time,scores.goodTime,scores.okayTime),
            getScores(refreshes,scores.goodRefresh,scores.okayRefresh),
        ]
        if(new Date(savedStats.updated).toDateString() != new Date().toDateString()){
            for(const s of emojiScores){
                savedStats[s]++;
            }
            savedStats.updated=new Date();
        }
        if(getCookieConsentValue()){
            Cookies.set("savedStats",savedStats,{sameSite:"Lax",expires:365});
        }
    }
    
    render(){
        const timeTaken = Math.abs((this.props.start-this.props.finish)/1000);
        let timeToNewPuzzle = this.state.newPuzzleDate-this.state.date;
        let hours = Math.floor(timeToNewPuzzle%(1000*60*60*24)/(1000*60*60));
        let mins = Math.floor(timeToNewPuzzle%(1000*60*60)/(1000*60));
        let secs = Math.floor(timeToNewPuzzle%(1000*60)/1000);
        let timeText = timeToNewPuzzle>0 ? `${hours}h ${mins}m ${secs}s` : "Refresh for new puzzle"
        this.interval = setInterval(()=>this.setState({date:Date.now()}),1000);
        const turns = this.state.stats ? this.state.stats.turnsTaken : this.props.turns;
        const time = this.state.stats ? this.state.timeTaken : timeTaken;
        const refreshes = this.state.stats ? this.state.stats.refreshes : refresh;

        if(this.props.done){
           this.setStats();
        }
        return(
            <div id="completeGradient" style={{display:this.props.done ? "flex" : "none", background:`linear-gradient(${this.props.completeG[0]},${this.props.completeG[this.props.completeG.length-1]})`}}>
                <div id="doneScreenCont">
                    <div id="doneText">
                        <h1 id="puzzle">Puzzle {this.state.puzzleNum}</h1>
                        <div id="score">
                            <div>
                                <h3>Turns</h3>
                                <p>{turns}{chooseEmoji(turns,scores.goodTurns,scores.okayTurns)}</p>
                            </div>
                            <div>
                                <h3>Time (sec)</h3>
                                <p>{time}{chooseEmoji(time,scores.goodTime,scores.okayTime)}</p>
                            </div>
                            <div>
                                <h3>Tries</h3>
                                <p>{refreshes}{chooseEmoji(refreshes,scores.goodRefresh,scores.okayRefresh)}</p>
                            </div>
                        </div>
                        <div id="stats">
                            <h3>Streak</h3>
                            <div id="streakData">
                                <div id="curStreak">
                                    <p>{streak.score}</p>
                                    <p id="curStreak">Current</p>
                                </div>
                                <div id="maxStreak">
                                    <p>{longestStreak}</p>
                                    <p id="longStreak">Longest</p>
                                </div>
                            </div>
                        </div>
                        <Bar
                            data={{
                                labels:["\u{1f525}","\u{1f62c}","\u{1f922}"],
                                datasets:[{
                                    data:[savedStats.good,savedStats.okay,savedStats.bad],
                                    label:"",
                                    backgroundColor:["#ffffff85"]
                                }],
                            }}
                            options={{
                                scales:{
                                    xAxes:{
                                        ticks:{
                                            display:false,
                                            color:"white"
                                        },
                                        grid:{
                                            drawBorder:false,
                                            display:false,
                                        }
                                    },
                                    yAxes:{
                                        grid:{
                                            drawBorder:false,
                                            display:false,
                                        },
                                        ticks:{
                                            font:{
                                                size:20,
                                            }
                                        }
                                    }
                                },
                                animation:{
                                    duration:0,
                                },
                                plugins:{
                                    tooltip:{
                                        displayColors:false,
                                        callbacks:{
                                            title:function(){},
                                            label:function(context){
                                                return `${context.label} ${context.parsed.x}`
                                            },
                                        },
                                    },
                                    legend:{
                                        display:false
                                    }
                                },
                                indexAxis:"y",

                            }}
                        />
                        <p id="countDown">Next puzzle in {timeText}</p>
                        <button id="share" onClick={(e)=>share(e,this.state.puzzleNum,turns,time,refreshes)}>Share</button>
                        <p id="copyMsg">Copied to Clipboard</p>

                    </div>
                    <div id="footer">
                        {/* <div id="emailCont">
                            <p>Suggestions? Please send them to <u>gradient.game@charlie-s.com</u></p>
                        </div> */}
                    </div>
                </div>
            </div>
        )
    }
}
/**
 * Share score or copy to clipboard if cannot share
 */
async function share(e,puzzleNum,turns,time,refreshes){
    
    const shareData = {
        title:"Gradient Game",
        text:`Puzzle: ${puzzleNum}\nTurns:  ${turns}  ${chooseEmoji(turns,scores.goodTurns,scores.okayTurns)}\nTries:   ${refreshes} ${chooseEmoji(refreshes,scores.goodRefresh,scores.okayRefresh)}\nTime:   ${time}sec  ${chooseEmoji(time,scores.goodTime,scores.okayTime)}\n`,
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
        ReactGA.event({
            category:"share",
            action:"share"
        })   
    }catch(err){
        try{
            await navigator.clipboard.writeText(`Puzzle: ${puzzleNum}\nTurns:  ${turns} ${chooseEmoji(turns,scores.goodTurns,scores.okayTurns)}\nTries:   ${refreshes} ${chooseEmoji(refreshes,scores.goodRefresh,scores.okayRefresh)}\nTime:   ${time}sec ${chooseEmoji(time,scores.goodTime,scores.okayTime)}\nhttps://charlie-s.com/gradientGame`);
            shareMsg.textContent = "Copied to Clipboard"
            document.querySelector("#copyMsg").style.visibility = "visible";    
            ReactGA.event({
                category:"copyScore",
                action:"copyScore"
            })   
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
            done:savedScore || true,
            turn:0,
            turnsTaken:0,
            gradient:[],
            randomGradient:[],
            userGradient:[],
            reverse:null,
            date:null
        }
        if (getCookieConsentValue) {
            props.setCookies();
        }
    }
    update(e){
        this.setState({date:new Date(),})
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
    getGradient(){
        const newGradient = new Gradient()
            .setColorGradient(`#${this.randomColour(0)}`,`#${this.randomColour(1)}`)
            .getColors();

        return newGradient
    }
/**
 * randomise gradient and return a box for each colour using RenderBox
 */
    createGBoxes(){
        let toReturn = [];
        if(this.state.done == true){
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

        if (this.state.done && this.state.turnsTaken>9 && getCookieConsentValue()){
            Cookies.set(
                "savedScore",
                JSON.stringify({
                    turnsTaken:this.state.turnsTaken,
                    timeStart:startPuzzle,
                    timeFin:new Date(),
                    refreshes:refresh
                }),
                {sameSite:"Lax",expires:expireDate}
            )
            Cookies.set("refreshCount",refresh,{sameSite:"Lax",expires:expireDate});
            Cookies.set("currentStreak",JSON.stringify({score:streak.score,updated:new Date()}),{sameSite:"Lax",expires:streakExpire});
            Cookies.set("longestStreak",longestStreak,{sameSite:"Lax",expires:365});
        }
        
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
                    done={this.state.done}
                    info={savedScore}
                    turns={this.state.turnsTaken}
                    start={startPuzzle}
                    finish={new Date()}
                    update={(e)=>this.update(e)}
                    reverse={this.state.reverse || false}
                    completeG={this.getGradient()}
                />
                <RenderHelpScreen
                />
                <svg id="refresh" onClick={(e)=>window.location.reload(false)} viewBox="0 0 50 50">
                    <mask id="block">
                        <rect x="0" y="0" width="40" height="22" fill="white"/>
                        <rect x="0" y="0" width="15" height="35" fill="white"/>
                        <rect x="10" y="30" width="40" height="30" fill="white"/>
                    </mask>
                    <circle cx="20" cy="20" r="15" stroke="white" strokeWidth="3" fill="none" mask="url(#block)"/>
                    <line x1="25" y1="15" x2="36" y2="22" stroke="white" strokeWidth="3"/>
                    <line x1="42" y1="13" x2="34" y2="22" stroke="white" strokeWidth="3"/>
                </svg>
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
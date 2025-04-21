const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

const rl = readline.createInterface({ input, output });

const STARTNUM = 1;  // 게임 시작 상수
const EXITNUM = 9;  // 게임 종료 상수

const WINNINGNUM = 3; // 3스트라이크

// 게임 시작시 로그를 출력하는 함수
function startGame() {
    console.log("게임을 새로 시작하려면 1, 종료하려면 9를 입력하세요.");
}

function playGame() {
    const gameNum = getRandomNumber();
    console.log("컴퓨터가 숫자를 뽑았습니다.");
    console.log(gameNum); // 디버깅용
    askNumber(gameNum);
}

function askNumber(gameNum) {
    rl.question('숫자를 입력해주세요: ', (input) => {
        if (exitGame(input)) return
        handlePlayerInput(input, gameNum)
    });
}

function handlePlayerInput(input, gameNum) {
    const playerNum = input.split('')
    const result = isStrike(playerNum, gameNum);

    if (result == WINNINGNUM) {
        console.log("3개의 숫자를 모두 맞히셨습니다.")
        console.log("------- 게임 종료 -------")
        startGame()
    } else {
        askNumber(gameNum)
    }
}


// 숫자 세개를 랜덤으로 뽑아서(중복X) 배열로 반환하는 함수
function getRandomNumber() {
    const gameAnswer = new Set()

    while(gameAnswer.size < 3){  
        gameAnswer.add(Math.floor(Math.random()*9)+1)
    }

    return [...gameAnswer]
}

// 스트라이크와 볼을 구분하는 함수
function isStrike(playerNum, gameNum) {
    let strike = 0
    let ball = 0

    playerNum.reduce((acc, cur, idx) => {
        if (cur == gameNum[idx]){
            strike++

        } else if (gameNum.includes(parseInt(cur))){
            ball++
        }
    }, 0)
    
    console.log(
        `${strike? `${strike}스트라이크 `:''}${ball? `${ball}볼`:''}`
    )  // todo : 사용자가 중복된 값을 입력했을 경우, 숫자 3개가 아닌경우 - 예외처리 !

    return strike
}

rl.on('line', (input) => {
    if (exitGame(input)) return;

    if (input == STARTNUM) {
        playGame();
    } else {
        console.log("잘못된 입력입니다. 1 또는 9를 입력해주세요.");
    }
});
  
function exitGame(input) {
    if (input == EXITNUM) {
        console.log("애플리케이션이 종료되었습니다.");
        rl.close();
        return true;
    }
    return false;
}

startGame();
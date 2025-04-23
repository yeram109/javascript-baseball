const readline = require("node:readline");
const { stdin: input, stdout: output } = require("node:process");
const { start } = require("node:repl");

const rl = readline.createInterface({ input, output });

const FINISHVIEWNUM = 0; // 조회 종료 상수
const STARTNUM = 1; // 게임 시작 상수
const RECORDNUM = 2; // 기록 조회 상수
const STATSNUM = 3; // 통계 조회 상수
const EXITNUM = 9; // 게임 종료 상수

const WINNINGNUM = 3; // 3스트라이크

const gameId = {
  value: 1,
};

const record = {
  gameId,
  startTime: "", // TODO: 날짜 정확히 나오게
  endTime: "",
  total: 0,
  gameHistory: [],
};
const gameRecords = [];

// 게임 시작 함수
function startGame() {
  rl.question(
    `게임을 새로 시작하려면 ${STARTNUM}, 기록을 보려면 ${RECORDNUM}, 통계를 보려면 ${STATSNUM}, 종료하려면 ${EXITNUM}를 입력하세요.\n`,
    (input) => {
      if (exitGame(input)) return;
      else if (input == STARTNUM) {
        playGame();
      } else if (input == RECORDNUM) {
        viewRecords();
      } else if (input == STATSNUM) {
        showGameStats();
      } else {
        console.log("잘못된 입력입니다. 1 또는 9를 입력해주세요.");
        return startGame();
      }
    }
  );
}


function playGame() {
  const gameNum = getRandomNumber();
  console.log("\n컴퓨터가 숫자를 뽑았습니다.\n");
  record.gameId = gameId.value++;
  record.startTime = new Date().toLocaleString();
  //console.log(new Date().toLocaleDateString() + " " +new Date().toLocaleTimeString("it-IT", {hour: "2-digit", minute: "2-digit"}))
  record.total = 0;
  record.gameHistory = [];
  console.log(gameNum); // 디버깅용
  askNumber(gameNum);
}

function askNumber(gameNum) {
  rl.question("숫자를 입력해주세요: ", (input) => {
    if (exitGame(input)) return;
    if (!isVaildPlayerNum(input)) {
      return askNumber(gameNum);
    } 
    record.total++;
    handlePlayerInput(input, gameNum);
  });
}

// 사용자가 입력한 값에 대한 예외 처리
function isVaildPlayerNum(playerNum) {
  if (isNaN(playerNum)) {
    console.log(`잘못된 입력입니다. 숫자를 입력해주세요.`)
    return 0
  }
  
  if (playerNum.length !== WINNINGNUM){
    console.log(`잘못된 입력입니다. ${WINNINGNUM}개의 숫자를 입력해주세요.`)
    return 0
  }

  if([...new Set(playerNum)].length !== playerNum.length){
    console.log(`잘못된 입력입니다. 중복되지 않은 값을 입력해주세요.`)
    return 0
  }

  return 1;
}


function handlePlayerInput(input, gameNum) {
  const playerNum = input.split("");
  const result = isStrike(playerNum, gameNum);

  if (result == WINNINGNUM) {
    console.log("\n3개의 숫자를 모두 맞히셨습니다.");
    console.log("------- 게임 종료 -------\n");
    record.endTime = new Date().toLocaleString();
    gameRecords.push({
      gameId: record.gameId,
      startTime: record.startTime, // TODO: 날짜 정확히 나오게
      endTime: record.endTime,
      total: record.total,
      gameHistory: record.gameHistory,
    });
    startGame();
  } else {
    askNumber(gameNum);
  }
}

// 숫자 세개를 랜덤으로 뽑아서(중복X) 배열로 반환하는 함수
function getRandomNumber() {
  const gameAnswer = new Set();

  while (gameAnswer.size < 3) {
    gameAnswer.add(Math.floor(Math.random() * 9) + 1);
  }

  return [...gameAnswer];
}

// 스트라이크와 볼을 구분하는 함수
function isStrike(playerNum, gameNum) {
  let strike = 0;
  let ball = 0;

  playerNum.reduce((acc, cur, idx) => {
    if (cur == gameNum[idx]) {
      strike++;
    } else if (gameNum.includes(parseInt(cur))) {
      ball++;
    }
  }, 0);

  record.gameHistory.push({
    playerNum: playerNum.join(""),
    gameLog: `${strike ? `${strike}스트라이크 ` : ""}${
      ball ? `${ball}볼` : ""
    }`,
  });

  console.log(
    `${strike ? `${strike}스트라이크 ` : ""}${ball ? `${ball}볼` : ""}${!strike && !ball ?"낫싱" :""}`
  );

  return strike;
}


function exitGame(input) {
  if (input == EXITNUM) {
    console.log("애플리케이션이 종료되었습니다.");
    rl.close();
    return true;
  }
  return false;
}

// 기록 전체 조회 및 상세조회 진입용 함수
function viewRecords() {
  if (gameRecords.length === 0) {
    console.log("저장된 게임 기록이 없습니다.");
    startGame();
  }

  console.log("\n게임 기록");
  gameRecords.reduce((acc, cur, idx) => {
    console.log(
      `[${cur.gameId}] / 시작시간: ${cur.startTime} / 종료시간: ${cur.endTime} / 횟수: ${cur.total}`
    );
  }, 0);
  rl.question(
    "\n확인할 게임 번호를 입력하세요 (종료하려면 0을 입력): ",
    (input) => {
      if (exitGame(input)) return;
      if (input == FINISHVIEWNUM) {
        return startGame();
      }
      if (!gameRecords.some((element) => element.gameId === parseInt(input))) {
        console.log("존재하지 않는 게임 번호입니다.");
        return viewRecords();
      }
      showHistory(
        parseInt(input),
        gameRecords[parseInt(input) - 1].gameHistory
      );
      return startGame();
    }
  );
}

function showHistory(gameId, gameHistory) {
  console.log(`\n${gameId}번 게임 결과`);
  gameHistory.reduce((acc, cur, idx) => {
    console.log(`숫자를 입력해주세요: ${cur.playerNum}`);
    console.log(cur.gameLog);
  }, 0);
  console.log("\n3개의 숫자를 모두 맞히셨습니다.");
  console.log("-------기록 종료-------\n");
}

function showGameStats(){

  if (gameRecords.length === 0) {
    console.log("저장된 게임 기록이 없습니다");
    return startGame();
  };

  const {minAttempts, maxAttempts, totalAttempts} = calculateGameStats();

  console.log(`\n가장 적은 횟수: ${minAttempts.totalMin}회 - [${minAttempts.gameIds.join(',')}]\n`)
  console.log(`가장 많은 횟수: ${maxAttempts.totalMax}회 - [${maxAttempts.gameIds.join(',')}]\n`)
  console.log(`평균 횟수: ${(totalAttempts/gameRecords.length).toFixed(2)}회\n`)
  console.log(`--------통계 종료-------`)
  startGame();
}

function calculateGameStats() {
  const minAttempts = {
    totalMin : gameRecords[0].total,
    gameIds : [],
  };
  const maxAttempts = {
    totalMax : gameRecords[0].total,
    gameIds : [],
  };

  const totalAttempts = gameRecords.reduce((acc, cur) => {
    if (cur.total < minAttempts.totalMin) {
      minAttempts.totalMin = cur.total
      minAttempts.gameIds = [cur.gameId]
    } else if (cur.total === minAttempts.totalMin) {
      minAttempts.gameIds.push(cur.gameId)
    }

    if (cur.total > maxAttempts.totalMax) {
      maxAttempts.totalMax = cur.total
      maxAttempts.gameIds = [cur.gameId]
    } else if (cur.total === maxAttempts.totalMax) {
      maxAttempts.gameIds.push(cur.gameId)
    }
    
    return acc + cur.total
  }, 0);

  return {minAttempts, maxAttempts, totalAttempts};
}



startGame();

const readline = require("node:readline");
const moment = require("moment");
const { stdin: input, stdout: output } = require("node:process");

const rl = readline.createInterface({ input, output });

const FINISHVIEWNUM = 0; // 조회 종료 상수
const STARTNUM = 1; // 게임 시작 상수
const RECORDNUM = 2; // 기록 조회 상수
const STATSNUM = 3; // 통계 조회 상수
const EXITNUM = 9; // 게임 종료 상수
const USER = "사용자";
const COMPUTER = "컴퓨터";

const WINNINGNUM = 3; // 3스트라이크

const gameId = {
  value: 1,
};

function createRecord() {
  return {
    gameId: gameId.value++,
    startTime: moment().format("YYYY.MM.DD HH:mm"),
    endTime: "",
    total: 0,
    gameHistory: [],
    winner: "",
    condition: 0,
  };
}

const gameRecords = [];

// 게임 시작 함수
function startGame() {
  rl.question(
    `게임을 새로 시작하려면 ${STARTNUM}, 기록을 보려면 ${RECORDNUM}, 통계를 보려면 ${STATSNUM}, 종료하려면 ${EXITNUM}를 입력하세요.\n`,
    (input) => {
      const integerInput = parseInt(input);
      if (exitGame(integerInput)) return;
      else if (integerInput === STARTNUM) {
        playGame();
      } else if (integerInput === RECORDNUM) {
        viewRecords();
      } else if (integerInput === STATSNUM) {
        showGameStats();
      } else {
        console.log("잘못된 입력입니다. 1 또는 9를 입력해주세요.");
        return startGame();
      }
    }
  );
}
// 게임 초기 설정 함수
function playGame() {
  rl.question(
    "\n컴퓨터에게 승리하기 위해 몇번만에 성공해야 하나요?\n",
    (input) => {
      const gameNum = getRandomNumber();
      console.log("\n컴퓨터가 숫자를 뽑았습니다.\n");
      const record = createRecord();
      record.condition = parseInt(input);
      console.log(gameNum); // 디버깅용
      askNumber(gameNum, record);
    }
  );
}
// 숫자를 입력받음(단, 9면 나감)
function askNumber(gameNum, record) {
  rl.question("숫자를 입력해주세요: ", (input) => {
    if (exitGame(parseInt(input))) return;
    if (!isVaildPlayerNum(input)) {
      return askNumber(gameNum, record);
    }
    record.total++;
    handlePlayerInput(input, gameNum, record);
  });
}

// 사용자가 입력한 값에 대한 예외 처리
function isVaildPlayerNum(playerNum) {
  if (isNaN(playerNum)) {
    console.log(`잘못된 입력입니다. 숫자를 입력해주세요.`);
    return 0;
  }

  if (playerNum.length !== WINNINGNUM) {
    console.log(`잘못된 입력입니다. ${WINNINGNUM}개의 숫자를 입력해주세요.`);
    return 0;
  }

  if ([...new Set(playerNum)].length !== playerNum.length) {
    console.log(`잘못된 입력입니다. 중복되지 않은 값을 입력해주세요.`);
    return 0;
  }

  return 1;
}
// 입력받은 정상 게임 입력 값 처리 함수
function handlePlayerInput(input, gameNum, record) {
  const playerNum = input.split("").map((num) => parseInt(num));
  const result = getRoundResult(playerNum, gameNum, record);

  if (result === WINNINGNUM) {
    record.winner = getWinner(record.total, record.condition);
    printGameResult(record.winner);
    record.endTime = moment().format("YYYY.MM.DD HH:mm");
    gameRecords.push(record);
    startGame();
  } else {
    askNumber(gameNum, record);
  }
}

function getWinner(total, condition) {
  if (total <= condition) {
    return "사용자";
  } else {
    return "컴퓨터";
  }
}

function printGameResult(winner) {
  console.log(`${winner}가 승리하였습니다.`);
  console.log("\n3개의 숫자를 모두 맞히셨습니다.");
  console.log("\n------- 게임 종료 -------\n");
}

// 숫자 세개를 랜덤으로 뽑아서(중복X) 배열로 반환하는 함수
function getRandomNumber() {
  const gameAnswer = new Set();
  // 3개의 서로 다른 숫자를 뽑을때까지 반복해야 하는 특성상 가장 직관적인 WHILE을 사용했습니다
  while (gameAnswer.size < WINNINGNUM) {
    gameAnswer.add(Math.floor(Math.random() * 9) + 1);
  }

  return [...gameAnswer];
}

// 스트라이크와 볼을 구분하는 함수
function getRoundResult(playerNum, gameNum, record) {
  let strike = 0;
  let ball = 0;

  playerNum.reduce((acc, cur, idx) => {
    if (cur === gameNum[idx]) {
      strike++;
    } else if (gameNum.includes(parseInt(cur))) {
      ball++;
    }
  }, 0);

  const gameLog = getGameLog(strike, ball);
  record.gameHistory.push(getGameHistory(playerNum, gameLog));
  console.log(gameLog);

  return strike;
}

function getGameLog(strike, ball) {
  return `${strike ? `${strike}스트라이크 ` : ""}${ball ? `${ball}볼` : ""}${
    !strike && !ball ? "낫싱" : ""
  }`;
}

function getGameHistory(playerNum, gameLog) {
  return {
    playerNum: playerNum.join(""),
    gameLog,
  };
}

function exitGame(input) {
  if (input === EXITNUM) {
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
  gameRecords.reduce((acc, cur) => {
    console.log(
      `[${cur.gameId}] / 시작시간: ${cur.startTime} / 종료시간: ${cur.endTime} / 횟수: ${cur.total} / 승리자: ${cur.winner}`
    );
  }, 0);

  routeHistory();
}

function routeHistory() {
  rl.question(
    "\n확인할 게임 번호를 입력하세요 (종료하려면 0을 입력): ",
    (input) => {
      if (parseInt(input) === FINISHVIEWNUM) {
        return startGame();
      }
      if (!gameRecords.some((element) => element.gameId === parseInt(input))) {
        console.log("존재하지 않는 게임 번호입니다.");
        return viewRecords();
      }
      printHistory(
        parseInt(input),
        gameRecords[parseInt(input) - 1].gameHistory
      );
      return startGame();
    }
  );
}

function printHistory(gameId, gameHistory) {
  console.log(`\n${gameId}번 게임 결과`);
  gameHistory.reduce((acc, cur) => {
    console.log(`숫자를 입력해주세요: ${cur.playerNum}`);
    console.log(cur.gameLog);
  }, 0);
  console.log("\n3개의 숫자를 모두 맞히셨습니다.");
  console.log("-------기록 종료-------\n");
}

function showGameStats() {
  const totalGameLength = gameRecords.length;

  if (totalGameLength === 0) {
    console.log("저장된 게임 기록이 없습니다");
    return startGame();
  }

  const {
    minAttempts,
    maxAttempts,
    maxCondition,
    minCondition,
    totalCondition,
    computerWinCount,
    userWinCount,
  } = calculateGameStats();

  printAttempts(minAttempts, maxAttempts);
  printConditions(maxCondition, minCondition);
  printAverageCondition(totalCondition, totalGameLength);
  printWinCounts(userWinCount, computerWinCount, totalGameLength);
  // console.log(
  //   `평균 횟수: ${(totalAttempts / totalGameLength).toFixed(2)}회\n`
  // );
  console.log(`--------통계 종료-------\n`);
  startGame();
}

function printAttempts(minAttempts, maxAttempts) {
  console.log(
    `\n가장 적은 횟수: ${minAttempts.totalMin}회 - [${minAttempts.gameIds.join(
      ","
    )}]`
  );
  console.log(
    `가장 많은 횟수: ${maxAttempts.totalMax}회 - [${maxAttempts.gameIds.join(
      ","
    )}]`
  );
}

function printConditions(maxCondition, minCondition) {
  console.log(`가장 많이 적용된 승리/패배 횟수: ${maxCondition}회`);
  console.log(`가장 적게 적용된 승리/패배 횟수: ${minCondition}회`);
}

function printAverageCondition(totalCondition, totalGameLength) {
  console.log(
    `적용된 승리/패배 횟수 평균: ${(totalCondition / totalGameLength).toFixed(
      2
    )}회`
  );
}

function printWinCounts(userWinCount, computerWinCount, totalGameLength) {
  console.log(
    `컴퓨터 전적: ${computerWinCount}승 / ${userWinCount}패 / ${(
      (computerWinCount * 100) /
      totalGameLength
    ).toFixed(0)}%`
  );
  console.log(
    `사용자 전적: ${userWinCount}승 / ${computerWinCount}패 / ${(
      (userWinCount * 100) /
      totalGameLength
    ).toFixed(0)}%\n`
  );
}

function calculateGameStats() {
  const minAttempts = {
    totalMin: gameRecords[0].total,
    gameIds: [],
  };
  const maxAttempts = {
    totalMax: gameRecords[0].total,
    gameIds: [],
  };

  const totalAttempts = gameRecords.reduce((acc, cur) => {
    updateMinAttempts(minAttempts, cur);
    updateMaxAttempts(maxAttempts, cur);
    return acc + cur.total;
  }, 0);

  const { maxCondition, minCondition } = calculateCondition();
  const totalCondition = calculateTotalCondition();
  const { computerWinCount, userWinCount } = calculateWinCount();

  return {
    minAttempts,
    maxAttempts,
    maxCondition,
    minCondition,
    totalCondition,
    computerWinCount,
    userWinCount,
  };
}

function updateMinAttempts(minAttempts, cur) {
  if (cur.total < minAttempts.totalMin) {
    minAttempts.totalMin = cur.total;
    minAttempts.gameIds = [cur.gameId];
  } else if (cur.total === minAttempts.totalMin) {
    minAttempts.gameIds.push(cur.gameId);
  }
}

function updateMaxAttempts(maxAttempts, cur) {
  if (cur.total > maxAttempts.totalMax) {
    maxAttempts.totalMax = cur.total;
    maxAttempts.gameIds = [cur.gameId];
  } else if (cur.total === maxAttempts.totalMax) {
    maxAttempts.gameIds.push(cur.gameId);
  }
}

function calculateCondition() {
  const maxCondition = gameRecords.reduce((acc, cur) => {
    return acc < cur.condition ? cur.condition : acc;
  }, 0);

  const minCondition = gameRecords.reduce((acc, cur) => {
    return acc > cur.condition ? cur.condition : acc;
  }, Number.MAX_SAFE_INTEGER);

  return { maxCondition, minCondition };
}

function calculateTotalCondition() {
  const totalCondition = gameRecords.reduce((acc, cur) => {
    return acc + cur.condition;
  }, 0);
  return totalCondition;
}

function calculateWinCount() {
  const computerWinCount = gameRecords.filter(
    (game) => game.winner === COMPUTER
  ).length;

  const userWinCount = gameRecords.filter(
    (game) => game.winner === USER
  ).length;

  return { computerWinCount, userWinCount };
}

startGame();

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

function createRecord(attemptLimit = 0) {
  return {
    gameId: gameId.value++,
    startTime: moment().format("YYYY.MM.DD HH:mm"),
    endTime: "",
    total: 0,
    gameHistory: [],
    winner: "",
    attemptLimit,
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
        viewRecords(gameRecords);
      } else if (integerInput === STATSNUM) {
        viewGameStats(gameRecords);
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
    (attemptLimitInput) => {
      const gameNum = getRandomNumber();
      console.log("\n컴퓨터가 숫자를 뽑았습니다.\n");
      const record = createRecord(parseInt(attemptLimitInput));
      console.log(gameNum); // 디버깅용
      askNumber(gameNum, record);
    }
  );
}
// 숫자를 입력받음(단, 9면 나감)
function askNumber(gameNum, record) {
  rl.question("숫자를 입력해주세요: ", (playerNumInput) => {
    if (exitGame(parseInt(playerNumInput))) return;
    if (!isVaildPlayerNum(playerNumInput)) {
      return askNumber(gameNum, record);
    }
    record.total++;
    handlePlayerInput(playerNumInput, gameNum, record);
  });
}

// 사용자가 입력한 값에 대한 예외 처리
function isVaildPlayerNum(playerNum) {
  if (isNaN(playerNum)) {
    console.log(`잘못된 입력입니다. 숫자를 입력해주세요.`);
    return false;
  }

  if (playerNum.length !== WINNINGNUM) {
    console.log(`잘못된 입력입니다. ${WINNINGNUM}개의 숫자를 입력해주세요.`);
    return false;
  }

  if ([...new Set(playerNum)].length !== playerNum.length) {
    console.log(`잘못된 입력입니다. 중복되지 않은 값을 입력해주세요.`);
    return false;
  }

  return true;
}

// 입력받은 정상 게임 입력 값 처리 함수
function handlePlayerInput(playerNumInput, gameNum, record) {
  const playerNum = playerNumInput.split("").map((num) => parseInt(num));
  const result = getRoundResult(playerNum, gameNum, record);

  if (result === WINNINGNUM) {
    record.winner = getWinner(record.total, record.attemptLimit);
    printGameResult(record.winner);
    record.endTime = moment().format("YYYY.MM.DD HH:mm");
    gameRecords.push(record);
    startGame();
  } else {
    askNumber(gameNum, record);
  }
}

function getWinner(total, attemptLimit) {
  if (total <= attemptLimit) {
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

// 한 라운드를 진행하는 함수
function getRoundResult(playerNum, gameNum, record) {
  const { strike, ball } = checkStrikeAndBall(playerNum, gameNum);
  const gameLog = getGameLog(strike, ball);

  console.log(gameLog);

  record.gameHistory.push(getGameHistory(playerNum, gameLog));

  return strike;
}

// 스트라이크와 볼을 구분하는 함수
function checkStrikeAndBall(playerNum, gameNum) {
  return playerNum.reduce(
    (acc, cur, idx) => {
      if (cur === gameNum[idx]) {
        acc.strike++;
      } else if (gameNum.includes(cur)) {
        acc.ball++;
      }
      return acc;
    },
    { strike: 0, ball: 0 }
  );
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
function viewRecords(records) {
  if (records.length === 0) {
    console.log("저장된 게임 기록이 없습니다.");
    startGame();
  }

  console.log("\n게임 기록");
  // 단순히 gameRecords 배열을 돌면서 출력하는 기능만이 필요하기에, forEach로 구현하였습니다.
  records.forEach((record) => {
    console.log(
      `[${record.gameId}] / 시작시간: ${record.startTime} / 종료시간: ${record.endTime} / 횟수: ${record.total} / 승리자: ${record.winner}`
    );
  });

  routeHistory(gameRecords);
}

function routeHistory(records) {
  rl.question(
    "\n확인할 게임 번호를 입력하세요 (종료하려면 0을 입력): ",
    (gameIdInput) => {
      const gameId = parseInt(gameIdInput);
      if (gameId === FINISHVIEWNUM) {
        return startGame();
      }
      if (!records.some((element) => element.gameId === gameId)) {
        console.log("존재하지 않는 게임 번호입니다.");
        return viewRecords(records);
      }
      printHistory(gameId, records[gameId - 1].gameHistory);
      return startGame();
    }
  );
}

function printHistory(gameId, gameHistory) {
  console.log(`\n${gameId}번 게임 결과`);
  // 단순 출력을 위한 gameHistory 순회이기에 forEach문을 사용했습니다.
  gameHistory.forEach((gameRound) => {
    console.log(`숫자를 입력해주세요: ${gameRound.playerNum}`);
    console.log(gameRound.gameLog);
  });
  console.log("\n3개의 숫자를 모두 맞히셨습니다.");
  console.log("-------기록 종료-------\n");
}

function viewGameStats(records) {
  const gameRecordsLength = records.length;

  if (gameRecordsLength === 0) {
    console.log("저장된 게임 기록이 없습니다");
    return startGame();
  }

  const gameStats = calculateGameStats();

  printGameStats(gameStats, gameRecordsLength);
  startGame();
}

function printGameStats(gameStats, gameRecordsLength) {
  printAttempts(gameStats.minAttempts, gameStats.maxAttempts);
  printAttemptLimits(gameStats.maxAttemptLimit, gameStats.minAttemptLimit);
  printAverageAttemptLimit(gameStats.totalAttemptLimits, gameRecordsLength);
  printWinCounts(
    gameStats.userWinCount,
    gameStats.computerWinCount,
    gameRecordsLength
  );
  // console.log(
  //   `평균 횟수: ${(totalAttempts / gameRecordsLength).toFixed(2)}회\n`
  // );
  console.log(`--------통계 종료-------\n`);
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

function printAttemptLimits(maxAttemptLimit, minAttemptLimit) {
  console.log(`가장 많이 적용된 승리/패배 횟수: ${maxAttemptLimit}회`);
  console.log(`가장 적게 적용된 승리/패배 횟수: ${minAttemptLimit}회`);
}

function printAverageAttemptLimit(totalAttemptLimits, gameRecordsLength) {
  console.log(
    `적용된 승리/패배 횟수 평균: ${(
      totalAttemptLimits / gameRecordsLength
    ).toFixed(2)}회`
  );
}

function printWinCounts(userWinCount, computerWinCount, gameRecordsLength) {
  console.log(
    `컴퓨터 전적: ${computerWinCount}승 / ${userWinCount}패 / ${(
      (computerWinCount * 100) /
      gameRecordsLength
    ).toFixed(0)}%`
  );
  console.log(
    `사용자 전적: ${userWinCount}승 / ${computerWinCount}패 / ${(
      (userWinCount * 100) /
      gameRecordsLength
    ).toFixed(0)}%\n`
  );
}

function calculateGameStats() {
  const { minAttempts, maxAttempts } = calculateMinMaxAttempts(gameRecords);
  const { maxAttemptLimit, minAttemptLimit } =
    calculateAttemptLimit(gameRecords);
  const totalAttemptLimits = calculateTotalAttemptLimits(gameRecords);
  const { computerWinCount, userWinCount } = calculateWinCounts(gameRecords);

  return {
    minAttempts,
    maxAttempts,
    maxAttemptLimit,
    minAttemptLimit,
    totalAttemptLimits,
    computerWinCount,
    userWinCount,
  };
}

function calculateMinMaxAttempts(records) {
  const minAttempts = {
    totalMin: Number.MAX_SAFE_INTEGER,
    gameIds: [],
  };
  const maxAttempts = {
    totalMax: 0,
    gameIds: [],
  };

  const totalAttempts = records.reduce((acc, cur) => {
    updateMinAttempts(minAttempts, cur);
    updateMaxAttempts(maxAttempts, cur);
    return acc + cur.total;
  }, 0);

  return { minAttempts, maxAttempts };
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

function calculateAttemptLimit(records) {
  const maxAttemptLimit = records.reduce((acc, cur) => {
    return acc < cur.attemptLimit ? cur.attemptLimit : acc;
  }, 0);

  const minAttemptLimit = records.reduce((acc, cur) => {
    return acc > cur.attemptLimit ? cur.attemptLimit : acc;
  }, Number.MAX_SAFE_INTEGER);

  return { maxAttemptLimit, minAttemptLimit };
}

function calculateTotalAttemptLimits(records) {
  const totalAttemptLimits = records.reduce((acc, cur) => {
    return acc + cur.attemptLimit;
  }, 0);
  return totalAttemptLimits;
}

function calculateWinCounts(records) {
  const computerWinCount = records.filter(
    (game) => game.winner === COMPUTER
  ).length;

  const userWinCount = records.filter((game) => game.winner === USER).length;

  return { computerWinCount, userWinCount };
}

startGame();

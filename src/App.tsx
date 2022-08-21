import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { useAppSelector, useAppDispatch } from "./app/hooks";
import {
  setUsers,
  GameSlice,
  setForceGameData,
  setPoint,
  setGameStatus,
  setActiveUserId,
  restartGame,
  initialState,
} from "./features/game/gameSlice";

import Button from "@mui/material/Button";
function App() {
  const {
    users,
    activeUserId,
    gameStatus,
    gameMap: { x: gameRow, y: gameCol },
    selectedPoint,
  } = useAppSelector((state) => state.game);

  const dispatch = useAppDispatch();
  const [shouldReset, setShouldReset] = useState(false);
  function askForUsersInfo() {
    const maxUser = 2;
    const allUsers = [];
    const letters = [..."qwertyuiopasdfghjklzxcvbnm"];
    for (let i = 0; i < maxUser; i++) {
      const defaultName = `Player ${i + 1}`;
      let userName = prompt(
        `What is the Player ${i + 1} name is?`,
        defaultName
      );
      if (!userName || !userName.trim()) {
        userName = defaultName;
      }
      let userLetter = letters.splice(~~(Math.random() * letters.length), 1);

      allUsers.push({ name: userName, letter: userLetter[0] });
    }
    dispatch(setUsers({ rest: true, data: allUsers }));
    dispatch(setGameStatus("process"));
  }
  useEffect(() => {
    if (users.length) return;
    const savedGameData = window.localStorage.getItem("gameData");

    if (savedGameData) {
      try {
        const lastSavedInfo: GameSlice = JSON.parse(savedGameData);
        console.log("we are here");
        dispatch(setForceGameData(lastSavedInfo));
      } catch (e) {
        // handle error if data was broken
        askForUsersInfo();
      }
      return;
    }
    askForUsersInfo();
  }, [users.length]);

  function onHitPoint(pointId: number) {
    if (selectedPoint[pointId] || gameStatus !== "process") {
      return;
    }
    dispatch(setPoint({ point: pointId, userId: activeUserId }));
  }

  function calcWinner() {
    let isWin = false;

    // check if row is win
    const calcRowWinner = () => {
      head: for (let row = 0; row < gameRow; row++) {
        const firstItem = selectedPoint[row * gameRow];

        if (!firstItem) continue;
        for (let col = 1; col < gameCol; col++) {
          const item = selectedPoint[row * gameRow + col];
          if (item?.userId != firstItem?.userId) continue head;
        }
        return firstItem;
      }
      return false;
    };

    const calcColWinner = () => {
      head: for (let col = 0; col < gameCol; col++) {
        const firstItem = selectedPoint[col];

        if (!firstItem) continue;
        for (let row = 1; row < gameRow; row++) {
          const item = selectedPoint[row * gameRow + col];
          if (item?.userId != firstItem?.userId) continue head;
        }
        return firstItem;
      }
      return false;
    };

    const crossRightWinner = () => {
      let lastRes = selectedPoint[gameCol * gameRow - 1];

      console.log(lastRes, gameCol, gameRow);
      for (let row = gameRow - 2, col = gameCol - 2; row >= 0; row--, col--) {
        const firstItem = selectedPoint[row * gameRow + col];
        if (
          lastRes?.userId == null ||
          firstItem?.userId == null ||
          firstItem?.userId !== lastRes?.userId
        ) {
          return false;
        }
      }
      return lastRes;
    };
    const crossLeftWinner = () => {
      let lastRes = selectedPoint[gameCol - 1];

      for (let row = 1, col = gameCol - 2; gameRow > row; row++, col--) {
        const firstItem = selectedPoint[row * gameRow + col];
        if (
          lastRes?.userId == null ||
          firstItem?.userId == null ||
          firstItem?.userId !== lastRes?.userId
        ) {
          return false;
        }
      }
      return lastRes;
    };
    const crossWinner = () => {
      return crossLeftWinner() || crossRightWinner();
    };
    const winCheckers = {
      calcRowWinner,
      calcColWinner,
      crossWinner,
    };

    for (const [checkerName, checker] of Object.entries(winCheckers)) {
      isWin = checker();
      if (isWin) break;
    }

    return isWin;
  }
  function calcGameState(selectedPoint: any): any {
    const win = calcWinner();
    let gameState = "continue";
    const isTie =
      gameRow * gameCol === Object.keys(selectedPoint).length && !win;
    if (win) {
      gameState = "win";
    } else if (isTie) {
      gameState = "tie";
    }

    // is any User
    return { gameState, data: win };
  }
  function nextUserTurn() {
    const userIdIndex = activeUserId + 1 < users.length ? activeUserId + 1 : 0;
    const nextUser = users[userIdIndex];
    setMessage(
      `It's Turn for ${nextUser.name} { ${nextUser.letter.toUpperCase()} }`
    );
    dispatch(setActiveUserId(userIdIndex));
    return userIdIndex;
  }
  useEffect(() => {
    // check if we are in middle of game

    const { gameState, data } = calcGameState(selectedPoint);
    // check if the game not ended
    if (gameState !== "continue") {
      setShouldReset(true);
    }
    if (gameState === "win") {
      const winnerUser = users[data.userId];
      setMessage(
        `Horray the winner is  ${
          winnerUser?.name
        } { ${winnerUser?.letter.toUpperCase()} }`
      );
      dispatch(setGameStatus("done"));

      return;
    } else if (gameState === "tie") {
      setMessage("No one won or lost ! Tie! ");
      return;
    }
    if (gameStatus !== "process") return;
    if (Object.keys(selectedPoint).length) nextUserTurn();

    // when game is on process
  }, [Object.keys(selectedPoint).length, gameStatus]);

  const defaultWellcomeMsg = "Welcome to Tic Tak Toe Game";
  const [message, setMessage] = useState(defaultWellcomeMsg);

  const restGame = () => {
    dispatch(restartGame());
    setShouldReset(false);
  };
  const newGame = () => {
    dispatch(setForceGameData(initialState));
    askForUsersInfo();
    setMessage(defaultWellcomeMsg);
  };

  return (
    <div className="App">
      <div className="h-screen w-screen flex-col gap-3  flex items-center justify-center">
        {message}
        <div className="gamePoints flex flex-col border min-w-[300px] min-h-[300px] border-solid border-red-300">
          {[...Array(gameRow)].map((row, rowId) => {
            return (
              <div key={rowId} className="flex flex-1">
                {[...Array(gameRow)].map((col, colId) => {
                  const pointId = rowId * gameRow + colId;
                  const letter =
                    users[selectedPoint?.[pointId]?.userId]?.letter;
                  return (
                    <div
                      onClick={() => onHitPoint(pointId)}
                      key={colId}
                      className=" cursor-pointer  hover:bg-gray-300 inline-flex text-5xl uppercase justify-center items-center  w-10  flex-1 border border-solid border-red-300"
                    >
                      {letter || <pre> </pre>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" color="error" onClick={restGame}>
            Restart
          </Button>
          <Button variant="outlined" color="warning" onClick={newGame}>
            newGame
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;

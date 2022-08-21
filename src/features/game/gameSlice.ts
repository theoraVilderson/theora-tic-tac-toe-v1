import { createSlice } from "@reduxjs/toolkit";

type GameUser = {
  name: string;
  letter: string;
};
type Point = {
  userId: number;
};
interface GameSlice {
  users: GameUser[];
  activeUserId: number;
  gameStatus: "readyToProcess" | "process" | "done";
  gameMap: {
    x: number;
    y: number;
  };
  selectedPoint: any;
}

export const initialState: GameSlice = {
  users: [],
  activeUserId: 0,
  gameStatus: "readyToProcess",
  gameMap: {
    x: 3,
    y: 3,
  },
  selectedPoint: {},
};

function saveData(data: object) {
  window.localStorage.setItem("gameData", JSON.stringify(data));
}

const slice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameStatus(state, data) {
      state.gameStatus = data.payload;
      saveData(state);
    },
    setUsers(state, data) {
      if (data.payload?.rest) {
        state.users = data.payload.data;
      } else {
        state.users.push(...data.payload);
      }
      saveData(state);
    },
    setForceGameData(state, data) {
      Object.assign(state, data.payload);
      saveData(state);
    },
    setPoint(state, data) {
      state.selectedPoint[data.payload.point] = { userId: data.payload.userId };
      saveData(state);
    },
    setActiveUserId(state, data) {
      state.activeUserId = data.payload;
      saveData(state);
    },
    restartGame(state) {
      state.selectedPoint = {};
      state.gameStatus = "process";
      saveData(state);
    },
  },
});

export type { GameSlice };
export const {
  setGameStatus,
  setUsers,
  setForceGameData,
  setPoint,
  setActiveUserId,
  restartGame,
} = slice.actions;
export default slice.reducer;

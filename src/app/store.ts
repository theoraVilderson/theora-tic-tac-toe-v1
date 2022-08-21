import {configureStore} from "@reduxjs/toolkit";
import gameReducer from "../features/game/gameSlice";

const store = configureStore({
    reducer:{
        game:gameReducer
    }
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;
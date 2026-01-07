import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IUserState {
    username: string;
    email: string | null; // email может быть null
}

const initialState: IUserState = {
    username: "",
    email: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<IUserState>) => {
            state.username = action.payload.username;
            state.email = action.payload.email;
        },
        clearUser: (state) => {
            state.username = "";
            state.email = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

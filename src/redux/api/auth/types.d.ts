// src/redux/api/auth/types.d.ts
export interface ILoginRequest {
    username: string;
    password: string;
}

export interface ILoginResponse {
    user: {
        username: string;
        email: string | null; // email может быть пустым
    };
    // Токены приходят в ответе от бекенда
    access: string;
    refresh: string;
}

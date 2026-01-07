// src/redux/api/auth/index.tsx
import { api } from "../index";
import type { ILoginRequest, ILoginResponse } from "./types";
import { setUser, clearUser } from "../../slices/userSlice";
import Cookies from "js-cookie";

// Типы для ответа от /student-profile/
interface StudentProfileArrayResponse {
    username?: string;
    email?: string;
    user?: {
        username?: string;
        email?: string;
    };
}

interface StudentProfileResponse {
    username?: string;
    email?: string;
    user?: {
        username?: string;
        email?: string;
    };
}

export const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        // Получение текущего пользователя
        getMe: build.query<{ username: string; email: string | null }, void>({
            query: () => ({
                url: "/student-profile/",
                method: "GET",
            }),
            providesTags: ["User"],
            transformResponse: (
                response: StudentProfileResponse | StudentProfileArrayResponse[]
            ) => {
                console.log("📥 Ответ от /student-profile/:", response);

                // Если ответ - массив, берем первый элемент
                if (Array.isArray(response) && response.length > 0) {
                    return {
                        username:
                            response[0].username ||
                            response[0].user?.username ||
                            "",
                        email:
                            response[0].email ||
                            response[0].user?.email ||
                            null,
                    };
                }

                // Если объект
                const singleResponse = response as StudentProfileResponse;
                return {
                    username:
                        singleResponse.username ||
                        singleResponse.user?.username ||
                        "",
                    email:
                        singleResponse.email ||
                        singleResponse.user?.email ||
                        null,
                };
            },
        }),

        // Логин
        login: build.mutation<ILoginResponse, ILoginRequest>({
            query: (credentials) => ({
                url: "/login/",
                method: "POST",
                body: credentials,
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    console.log("🔄 Начало процесса логина...");
                    const { data } = await queryFulfilled;
                    console.log("✅ Данные от сервера получены:", data);

                    // Сохраняем токены в cookies
                    if (data.access && data.refresh) {
                        console.log("💾 Сохраняем токены...");

                        // Access token - короткий срок (1 час)
                        Cookies.set("access_token", data.access, {
                            expires: 1 / 24, // 1 час
                            path: "/",
                        });

                        // Refresh token - длинный срок (7 дней)
                        Cookies.set("refresh_token", data.refresh, {
                            expires: 7, // 7 дней
                            path: "/",
                        });

                        console.log("✅ Токены сохранены в cookies");
                        console.log(
                            "🔑 Access token:",
                            Cookies.get("access_token")?.substring(0, 20) +
                                "..."
                        );
                        console.log(
                            "🔑 Refresh token:",
                            Cookies.get("refresh_token")?.substring(0, 20) +
                                "..."
                        );
                    } else {
                        console.log("❌ Токены не найдены в ответе!");
                    }

                    // Сохраняем пользователя в Redux
                    dispatch(
                        setUser({
                            username: data.user.username,
                            email: data.user.email,
                        })
                    );
                    console.log("✅ Пользователь сохранен в Redux:", data.user);
                } catch (error) {
                    // Ошибки обрабатываются в компоненте
                    console.log(
                        "⚠️ Ошибка при логине (обрабатывается в компоненте)"
                    );
                }
            },
        }),

        // Обновление токена
        refreshToken: build.mutation<{ access: string }, { refresh: string }>({
            query: (body) => ({
                url: "/api/token/refresh",
                method: "POST",
                body,
            }),
        }),

        // Выход
        logout: build.mutation<void, void>({
            query: () => ({
                url: "/logout/",
                method: "POST",
            }),
            invalidatesTags: ["User"],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    console.log("✅ Logout успешен");
                } catch (error) {
                    console.log(
                        "⚠️ Logout request failed, but clearing local data anyway"
                    );
                } finally {
                    // Очищаем Redux и cookies в любом случае
                    dispatch(clearUser());
                    Cookies.remove("access_token");
                    Cookies.remove("refresh_token");
                    Cookies.remove("user");
                }
            },
        }),
    }),
});

export const {
    useGetMeQuery,
    useLoginMutation,
    useRefreshTokenMutation,
    useLogoutMutation,
} = authApi;

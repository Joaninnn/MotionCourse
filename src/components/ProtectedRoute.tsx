// src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/redux/api/auth";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/slices/userSlice";
import Cookies from "js-cookie";
import style from "./ProtectedRoute.module.scss";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Проверяем наличие токена
    const hasToken =
        Cookies.get("access_token") || Cookies.get("refresh_token");

    // Делаем запрос только если есть токен
    const {
        data: user,
        isLoading,
        error,
    } = useGetMeQuery(undefined, {
        skip: !hasToken, // Пропускаем запрос если нет токенов
    });

    useEffect(() => {
        // Если нет токенов - сразу редиректим
        if (!hasToken) {
            router.replace("/login");
            return;
        }

        // Если загрузка завершена и есть ошибка или нет пользователя - редиректим
        if (!isLoading && (error || !user)) {
            console.error("❌ Ошибка получения профиля:", error);
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            router.replace("/login");
            return;
        }

        // Если пользователь загружен - сохраняем в Redux
        if (user) {
            console.log("✅ Профиль загружен:", user);
            dispatch(
                setUser({
                    username: user.username,
                    email: user.email,
                })
            );
        }
    }, [user, isLoading, error, router, hasToken, dispatch]);

    // Показываем loader пока идет проверка
    if (!hasToken || isLoading) {
        return <div className={style.loading}>Загрузка...</div>;
    }

    // ВРЕМЕННО: если есть токены - пропускаем
    // (закомментировано пока не найдем правильный путь к API)
    if (!user) {
        return null;
    }

    // Пользователь авторизован - показываем контент
    return <>{children}</>;
}

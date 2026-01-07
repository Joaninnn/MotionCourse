// src/appPages/auth/components/pages/login/login.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/redux/api/auth";
import style from "./login.module.scss";

export default function Login() {
    const router = useRouter();
    const [login, { isLoading }] = useLoginMutation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!username || !password) {
            return;
        }

        try {
            await login({ username, password }).unwrap();
            router.push("/home");
        } catch (err) {
            // Ничего не делаем при ошибке - просто игнорируем
            // Пользователь останется на странице логина
        }
    };

    return (
        <section className={style.login}>
            <div className={style.content}>
                <div className={style.form}>
                    <h2 className={style.title}>ВХОД В СИСТЕМУ</h2>

                    <div className={style.Block}>
                        <h2 className={style.Text}>ЛОГИН</h2>
                        <input
                            className={style.input}
                            placeholder="Введите логин"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={style.Block}>
                        <h2 className={style.Text}>ПАРОЛЬ</h2>
                        <input
                            className={style.input}
                            placeholder="Введите пароль"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleLogin()
                            }
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        className={style.button}
                        type="button"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? "ВХОД..." : "ВОЙТИ"}
                    </button>
                </div>
            </div>
        </section>
    );
}

// src/appPages/site/components/layout/header/header.tsx
"use client";

import style from "./Header.module.scss";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProfileIcon from "@/assets/Icons/profile.jpg";
import Logo from "@/assets/Icons/Logo.svg";
import { useLogoutMutation, useGetMeQuery } from "@/redux/api/auth";
import { useAppSelector } from "@/redux/hooks";

const Links = [
    {
        name: "Уроки",
        href: "/lessons",
    },
    {
        name: "Чат",
        href: "/chat",
    },
];

const Header: React.FC = () => {
    const router = useRouter();
    const [logout] = useLogoutMutation();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

    // Получаем пользователя из Redux
    const userFromRedux = useAppSelector((state) => state.user);

    // Загружаем данные пользователя с сервера, если их нет в Redux
    const { data: userFromServer, isLoading } = useGetMeQuery(undefined, {
        skip: !!userFromRedux, // Пропускаем запрос, если данные уже есть в Redux
    });

    // Используем данные из Redux или с сервера
    const user = userFromRedux || userFromServer;
    const isAuthenticated = !!user;

    const handleProfileClick = (): void => {
        if (isAuthenticated) {
            setShowProfileMenu(!showProfileMenu);
        } else {
            router.push("/login");
        }
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await logout().unwrap();
        } catch (error) {
            console.log("Logout request failed");
        } finally {
            setShowProfileMenu(false);
            router.push("/login");
        }
    };

    const toggleMenu = (): void => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className={style.header}>
            <div className="container">
                <div className={style.content}>
                    <div
                        onClick={() => router.push("/home")}
                        className={style.logoButton}
                    >
                        <Image className={style.logo} src={Logo} alt="Logo" />
                        <div className={style.logoTextBlock}>
                            <span className={style.logoText1}>Motion</span>
                            <span className={style.logoText2}>Web</span>
                        </div>
                    </div>

                    <div className={style.navs}>
                        {Links.map((link) => (
                            <a
                                key={link.name}
                                className={style.nav}
                                href={link.href}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    <div className={style.rightBlock}>
                        <div className={style.profileWrapper}>
                            <button
                                onClick={handleProfileClick}
                                className={style.buttonBlock}
                            >
                                <Image
                                    className={style.profile}
                                    src={ProfileIcon}
                                    alt="profile"
                                />
                                {isAuthenticated && user && !isLoading && (
                                    <span className={style.username}>
                                        {user.username}
                                    </span>
                                )}
                            </button>

                            {isAuthenticated && showProfileMenu && user && (
                                <div className={style.profileMenu}>
                                    <div className={style.profileInfo}>
                                        <p className={style.profileName}>
                                            {user.username}
                                        </p>
                                        <p className={style.profileEmail}>
                                            {user.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className={style.logoutButton}
                                    >
                                        Выйти
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={toggleMenu}
                            className={style.burgerButton}
                            aria-label="Toggle menu"
                        >
                            <span
                                className={`${style.burgerLine} ${
                                    isMenuOpen ? style.open : ""
                                }`}
                            ></span>
                            <span
                                className={`${style.burgerLine} ${
                                    isMenuOpen ? style.open : ""
                                }`}
                            ></span>
                            <span
                                className={`${style.burgerLine} ${
                                    isMenuOpen ? style.open : ""
                                }`}
                            ></span>
                        </button>
                    </div>

                    <nav
                        className={`${style.mobileMenu} ${
                            isMenuOpen ? style.active : ""
                        }`}
                    >
                        {Links.map((link) => (
                            <a
                                key={link.name}
                                className={style.mobileNav}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        {isAuthenticated && (
                            <button
                                onClick={handleLogout}
                                className={style.mobileLogout}
                            >
                                Выйти
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;

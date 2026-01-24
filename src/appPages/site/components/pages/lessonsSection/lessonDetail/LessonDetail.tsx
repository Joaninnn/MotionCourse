"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import style from "./lessonDetail.module.scss";
import { useGetVideosDetailQuery } from "@/redux/api/video";
import { useGetCourseVideosQuery, useGetLessonDetailQuery } from "@/redux/api/lessons";
import { useAppSelector } from "@/redux/hooks";

function LessonDetail() {
    const router = useRouter();
    const currentUser = useAppSelector((state) => state.user);
    const { id } = useParams();

    // Получаем детали текущего видео
    const { 
        data: videoDetail, 
        isLoading: isVideoLoading, 
        error: videoError 
    } = useGetVideosDetailQuery(Number(id), {
        skip: !id,
    });

    // Получаем детали курса, к которому принадлежит видео
    const { 
        data: courseDetail, 
        isLoading: isCourseLoading 
    } = useGetLessonDetailQuery(
        videoDetail?.course || 0,
        {
            skip: !videoDetail?.course,
        }
    );

    // Получаем список других видео того же курса для "Следующие уроки"
    const { data: courseVideos = [] } = useGetCourseVideosQuery(
        {
            course_id: currentUser?.course?.toString() || "",
        },
        {
            skip: !currentUser?.course || !videoDetail,
        }
    );

    const videoRef = useRef<HTMLVideoElement | null>(null);

    // Проверка доступа - видео должно принадлежать курсу пользователя
    const hasAccess = videoDetail && videoDetail.course === currentUser?.course;

    console.log("🔍 [LESSON_DETAIL] User course ID:", currentUser?.course);
    console.log("🔍 [LESSON_DETAIL] Video course ID:", videoDetail?.course);
    console.log("🔍 [LESSON_DETAIL] Video ID:", id);
    console.log("🔍 [LESSON_DETAIL] Has access:", hasAccess);

    // Фильтруем видео: 
    // 1. Та же категория урока (тема)
    // 2. Исключаем текущее видео
    // 3. Сортируем по номеру урока
    // 4. Берем только следующие уроки (с большим номером)
    const nextLessons = courseVideos
        .filter((video) => {
            // Та же категория урока
            const sameCategory = videoDetail && 
                video.category_lesson.id === videoDetail.category_lesson.id;
            
            // Не текущее видео
            const notCurrent = video.id !== Number(id);
            
            // Номер урока больше текущего
            const isNext = videoDetail && 
                video.lesson_number > videoDetail.lesson_number;
            
            return sameCategory && notCurrent && isNext;
        })
        .sort((a, b) => a.lesson_number - b.lesson_number) // Сортируем по возрастанию номера
        .slice(0, 6); // Ограничиваем количество (первые 6 следующих)

    console.log("🔍 [NEXT_LESSONS] Current category:", videoDetail?.category_lesson);
    console.log("🔍 [NEXT_LESSONS] Current lesson number:", videoDetail?.lesson_number);
    console.log("🔍 [NEXT_LESSONS] Next lessons:", nextLessons);
    console.log("🔍 [NEXT_LESSONS] Next lessons count:", nextLessons.length);

    const handleVideoClick = (video: LESSONS.VideoListItem): void => {
        router.push(`/lessons/${video.id}`);
    };

    useEffect(() => {
        const disableKeys = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && ["s", "u"].includes(e.key.toLowerCase())) ||
                (e.ctrlKey &&
                    e.shiftKey &&
                    ["i", "j"].includes(e.key.toLowerCase()))
            ) {
                e.preventDefault();
            }
        };

        document.addEventListener("keydown", disableKeys);
        return () => document.removeEventListener("keydown", disableKeys);
    }, []);

    // Обработка состояния загрузки
    if (isVideoLoading || isCourseLoading) {
        return (
            <div className={style.empty}>
                <p>Загрузка...</p>
            </div>
        );
    }

    // Обработка ошибки
    if (videoError) {
        return (
                <div className={style.empty}>
                    <h1>Ошибка загрузки</h1>
                    <p>Не удалось загрузить видео. Попробуйте позже.</p>
                    <button 
                        className={style.backButton}
                        onClick={() => router.push("/lessons")}
                    >
                        Вернуться к урокам
                    </button>
                </div>
            );
    }

    // Если видео не найдено
    if (!videoDetail) {
        return (
                <div className={style.empty}>
                    <h1>Видео не найдено</h1>
                    <p>Запрашиваемое видео не существует 😕</p>
                    <button 
                        className={style.backButton}
                        onClick={() => router.push("/lessons")}
                    >
                        Вернуться к урокам
                    </button>
                </div>
        );
    }

    // Если нет доступа
    if (!hasAccess) {
        return (
                <div className={style.empty}>
                    <h1>Доступ запрещен</h1>
                    <p>
                        У вас нет доступа к этому видео. 
                        <br />
                        Видео курса ID: {videoDetail.course}
                        <br />
                        Ваш курс ID: {currentUser?.course || 'не назначен'}
                    </p>
                    <button 
                        className={style.backButton}
                        onClick={() => router.push("/lessons")}
                    >
                        Вернуться к моим урокам
                    </button>
                </div>
        );
    }

    return (
        <section className={style.LessonDetail}>
            <div className="container">
                <div className={style.content}>
                    <div className={style.detailContent}>
                        {videoDetail.video && (
                            <video
                                ref={videoRef}
                                className={style.lessonVideo}
                                src={videoDetail.video}
                                controls
                                autoPlay={false}
                                loop={false}
                                controlsList="nodownload noplaybackrate"
                                disablePictureInPicture
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                                playsInline
                            >
                                Ваш браузер не поддерживает видео тег.
                            </video>
                        )}

                        <div className={style.lessonInfo}>
                            <h2 className={style.title}>
                                {videoDetail.category_lesson.ct_lesson_name}
                            </h2>
                            <div className={style.hr}></div>

                            {courseDetail && (
                                <>
                                    <div className={style.themeBlock}>
                                        <h2 className={style.themeTitle}>Курс:</h2>
                                        <h2 className={style.theme}>
                                            {courseDetail.course_name}
                                        </h2>
                                    </div>

                                    <div className={style.dataBlock}>
                                        <h2 className={style.dataTitle}>Дата создания курса:</h2>
                                        <h2 className={style.data}>
                                            {courseDetail.created_at}
                                        </h2>
                                    </div>
                                </>
                            )}

                            <div className={style.numberBlock}>
                                <h2 className={style.numberTitle}>
                                    Урок по счету:
                                </h2>
                                <h2 className={style.number}>
                                    {videoDetail.lesson_number}
                                </h2>
                            </div>

                            <div className={style.hr}></div>

                            <div className={style.descBlock}>
                                <h2 className={style.desctitle}>ОПИСАНИЕ</h2>
                                <p className={style.desc}>
                                    {videoDetail.description || 'Описание отсутствует'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {nextLessons.length > 0 && (
                        <div className={style.table}>
                            <h2 className={style.title}>
                                СЛЕДУЮЩИЕ УРОКИ ПО ТЕМЕ: {videoDetail.category_lesson.ct_lesson_name}
                            </h2>
                            <div className={style.cards}>
                                {nextLessons.map((video) => (
                                    <div
                                        key={video.id}
                                        className={style.card}
                                        onClick={() => handleVideoClick(video)}
                                       
                                    >
                                        <h3 
                                           className={style.title}
                                        >
                                            {video.category_lesson.ct_lesson_name}
                                        </h3>
                                        <p 
                                            
                                        >
                                            Номер урока: {video.lesson_number}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default LessonDetail;
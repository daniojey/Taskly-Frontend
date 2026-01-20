import { createContext, useEffect, useRef, useState } from "react";
import { api } from "../api";
import { getAccessToken } from "../tokens_func";

const startSession = async ( taskId: number) => {
    try {
        const response = await api.post(
            `api/v1/task-sessions/start_session_performer/`,
            {taskId},
            {headers: {
                Authorization: getAccessToken()
            }}
        )

        return response.data.results
    } catch (error) {
        throw error
    }
}

const updateSession = async ( sessionId: number | null, time: number) => {

    try {
        const response = await api.patch(
            `api/v1/task-sessions/${sessionId}/update_session_performer/`,
            {time},
            {headers: {Authorization: getAccessToken()}}
        )

        console.log(response.data.results)
        return response.data.results
    } catch (error) {
        throw error
    }
}

interface OneTimerContextType {
    startTimer: (taskId: number) => void;
    pauseTimer: () => void;
    resumeTimer: () => void;
    resetTimer: () => void;
    getFormattedTime: () => {};
    getElapsed: () => number;
    isPaused: boolean;
    isRunning: () => boolean;
    activeTaskId: null | number;
}

interface OneTimerProviderProps {
    children: React.ReactNode
}


export const OneTimerContext = createContext<OneTimerContextType | undefined>(undefined);

export function OneTimerProvider({ children }: OneTimerProviderProps) {
    const [startTime, setStartTime] = useState<number>(0)
    const pauseTimeRef = useRef<number>(0)
    const [isPaused, setIsPaused] = useState<boolean>(true)
    const [updateNumber, forceUpdate] = useState(0)
    const intervalRef = useRef<any>(null)
    const [activeTaskId, setActiveTaskId] = useState<null | number>(null)
    const originalTitleRef = useRef<string>(document.title)
    const sessionIdRef = useRef<number | null>(null)

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            forceUpdate(prev => prev + 1)
        }, 1000);

        return () => {
            clearInterval(intervalRef.current)
            // Восстанавливаем оригинальный title при размонтировании
            document.title = originalTitleRef.current
        }
    }, [])

    // Обновляем title при изменении времени или состояния паузы
    useEffect(() => {
        if (!isPaused) {
            const { formatted } = getFormattedTime()
            document.title = `⏱️ ${formatted} - ${originalTitleRef.current}`
        } else if (pauseTimeRef.current > 0) {
            const { formatted } = formatTime(pauseTimeRef.current)
            document.title = `⏸️ ${formatted} - ${originalTitleRef.current}`
        } else {
            document.title = originalTitleRef.current
        }
    }, [isPaused, startTime]) // Зависимости срабатывают при старте/паузе/резюме

    // Принудительное обновление title каждую секунду при активном таймере
    useEffect(() => {
        if (!isPaused && startTime > 0) {
            const { formatted } = getFormattedTime()
            document.title = `⏱️ ${formatted} - ${originalTitleRef.current}`
        }
    })

    if (updateNumber > 30 && !isPaused) {
        console.log('number is rated')
        const time = pauseTimeRef.current + (Date.now() - startTime)
        updateSession(sessionIdRef.current, time)
        forceUpdate(0)
    }


    const startTimer = async (taskId: number) => {

        const result = await startSession(taskId)

        if (result) {
            setActiveTaskId(taskId)
            sessionIdRef.current = result.id
            setStartTime(Date.now())
            pauseTimeRef.current = 0
            setIsPaused(false)
        }

    }

    const pauseTimer = () => {
        pauseTimeRef.current = pauseTimeRef.current + (Date.now() - startTime)
        setIsPaused(true)
    }

    const resumeTimer = () => {
        setStartTime(Date.now())
        setIsPaused(false)
    }

    const resetTimer = async () => {
        setStartTime(0)
        pauseTimeRef.current = 0
        setIsPaused(true)
        await saveResults()
    }

    const saveResults = async () => {
        console.log('Saved')
    }

    const getElapsed = () => {
        if (isPaused) {
            return pauseTimeRef.current
        }

        return pauseTimeRef.current + (Date.now() - startTime)
    }

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)

        let formattedTime = `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

        if (hours < 1) {
            formattedTime = `${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
        }

        return {
            hours,
            minutes: minutes % 60, // Исправил & на %
            seconds: seconds % 60,
            formatted: formattedTime
        }
    };

    const getFormattedTime = () => {
        return formatTime(getElapsed())
    }

    const isRunning = () => {
        return !isPaused
    }

    return (
        <OneTimerContext.Provider value={{
            startTimer,
            pauseTimer,
            resumeTimer,
            resetTimer,
            getFormattedTime,
            getElapsed,
            isPaused,
            isRunning,
            activeTaskId
        }}>
            {children}
        </OneTimerContext.Provider>
    )
}
import React, { createContext, useState, useEffect, useRef} from "react";

export const TimerContext = createContext();

export function TimerProvider({ children }) {
    const [timers, setTimers] = useState({});
    const [, forceUpdate] = useState(0);
    const intervalRef = useRef(null);
    const [activeTaskId, setActiveTaskId] = useState(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            forceUpdate(prev => prev + 1)
        }, 1000);

        return () => clearInterval(intervalRef.current)
    })

    const startTimer = (taskId) => {
        setTimers(prev => ({
            ...prev,
            [taskId]: {
                startTime: Date.now(),
                pausedTime: prev[taskId]?.pausedTime || 0,
                isPaused: false
            }
        }))

        setActiveTaskId(taskId)
    }

    const pauseTimer = (taskId) => {
        setTimers(prev => {
        const timer = prev[taskId];
        if (!timer || timer.isPaused) return prev;

        return {
            ...prev,
            [taskId]: {
            ...timer,
            pausedTime: timer.pausedTime + (Date.now() - timer.startTime),
            isPaused: true
            }
        };
        });
    };

    const resumeTimer = (taskId) => {
        setTimers(prev => {
        const timer = prev[taskId];
        console.log(timer)
        if (!timer || !timer.isPaused) return prev;

        return {
            ...prev,
            [taskId]: {
            ...timer,
            startTime: Date.now(),
            isPaused: false
            }
        };
        });
    };

    const resetTimer = (taskId) => {
        setTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[taskId];
            return newTimers
        })

        setActiveTaskId(null)
    }

    const getElapsed = (taskId) => {
        const timer = timers[taskId];
        if (!timer) return 0;

        if (timer.isPaused) {
            return timer.pausedTime;
        }

        const time = timer.pausedTime + (Date.now() - timer.startTime)
        return time
    }

    const formatTime = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        let formattedTime = `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

        if (hours < 1) {
            formattedTime = `${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
        }

        return {
            hours,
            minutes: minutes & 60,
            seconds: seconds % 60,
            formatted: formattedTime
        }
    };

    const getFormattedTime = (taskId) => {
        return formatTime(getElapsed(taskId))
    };

    const isRunning = (taskId) => {
        const timer = timers[taskId];
        return timer && !timer.isPaused;
    };

    return (
        <TimerContext.Provider value={{
            startTimer,
            pauseTimer,
            resumeTimer,
            resetTimer,
            getElapsed,
            getFormattedTime,
            isRunning,
            activeTaskId
            }}>
            {children}
        </TimerContext.Provider>
    )
}
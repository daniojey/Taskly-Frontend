import { useContext } from "react";
import { OneTimerContext } from "../../OneTimerContext";


export function useTimer(taskId) {
    const context = useContext(OneTimerContext)
    if (!context) {
        throw new Error('useTimer must be used within TimerProvider')
    }

    return {
        start: () => context.startTimer(taskId),
        pause: () => context.pauseTimer(),
        resume: () => context.resumeTimer(),
        reset: () => context.resetTimer(),
        elapsed: context.getElapsed(),
        formatted: context.getFormattedTime(),
        isRunning: context.isRunning()
    }
}
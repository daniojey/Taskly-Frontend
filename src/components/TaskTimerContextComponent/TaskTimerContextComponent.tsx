import { useEffect, useRef } from "react";
import "./TaskTimerContextComponent.css"

interface TaskTimerContextComponentProps {
    data: {x: number, y: number};
    onClose: () => void;
    onPause: () => void;
    onReset: () => void;
    onResume: () => void;
    isRunning: boolean;
}


function TaskTimerContextComponent({data, onClose, onPause, onReset, onResume, isRunning}: TaskTimerContextComponentProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [onClose])

    return (
        <div
        className="subtask__context-body"
        ref={ref}
        style={{
            position: "fixed",
            top: data.y,
            left: data.x
        }} 
        >

            {!isRunning ? (
            <button
                onClick={onResume}
            >
                Resume
            </button>
            ) : (
            <button
                onClick={onPause}
            >
                Pause
            </button>
            )}

            <button
            onClick={onReset}
            >Reset</button>
        </div>
    )
}

export default TaskTimerContextComponent
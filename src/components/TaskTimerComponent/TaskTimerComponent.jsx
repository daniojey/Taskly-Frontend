import { useTimer } from "../../common/hooks/timerHook";
import './TaskTimerComponent.css'

function TaskTimerComponent( {taskId, taskName, shortVersion = false }) {
    const timer = useTimer(taskId)

    return(
        <div className="timer-body">
        
        <div className="timer-time">
            {timer.formatted.formatted}
        </div>

        {!shortVersion && (
            <div className="timer-button-body">
            {!timer.isRunning ? (
            <button
                onClick={timer.elapsed > 0 ? timer.resume : timer.start}
            >
                {timer.elapsed > 0 ? 'Resume' : 'Start'}
            </button>
            ) : (
            <button
                onClick={timer.pause}
            >
                Pause
            </button>
            )}
            
            <button
            onClick={timer.reset}
            >
            Reset
            </button>
        </div>
        )}
        
        </div>
    )
}

export default TaskTimerComponent
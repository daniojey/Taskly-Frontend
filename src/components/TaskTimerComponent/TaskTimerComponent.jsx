import { useTimer } from "../../common/hooks/timerHook";
import { useTaskTimer } from "../../common/stores/TaskStore";
import TaskTimerContextComponent from "../TaskTimerContextComponent/TaskTimerContextComponent";
import './TaskTimerComponent.css'
import { useState } from "react";

function TaskTimerComponent( {taskId, taskName, shortVersion = false }) {
    const taskIdActive = useTaskTimer((state) => state.taskId)
    const activeTimer = useTaskTimer((state) => state.timerActive)
    const [menuPos, setMenuPos] = useState(null)
    const timer = useTimer(taskId)

    return(
        <div className="timer-body">
        
        
        {taskId === taskIdActive && (
            <>
                <div 
                className="timer-time"
                onClick={(e) => setMenuPos({x: e.clientX, y: e.clientY})}
                >
                    {timer?.formatted?.formatted}
                </div>

                {menuPos && (
                    <TaskTimerContextComponent 
                    data={menuPos} 
                    onClose={() => setMenuPos(null)}
                    onResume={timer.resume}
                    onPause={timer.pause}
                    onReset={timer.reset}
                    isRunning={timer.isRunning}
                    />
                )}
            </>
        )}


        {!shortVersion && (taskId === taskIdActive || !activeTimer) && (
            <div className="timer-button-body">
            {!timer.isRunning ? (
            <button
                onClick={timer.elapsed > 0 ? timer.resume : timer.start}
            >
                {timer.elapsed > 0 ? 'Resume' : 'Start session'}
            </button>
            ) : (
            <button
                onClick={timer.pause}
            >
                Pause
            </button>
            )}
            
            {timer.startTime !== 0 && (
                <button
                onClick={timer.reset}
                >
                Reset
                </button>
            )
            }
            
        </div>
        )}
        
        </div>
    )
}

export default TaskTimerComponent
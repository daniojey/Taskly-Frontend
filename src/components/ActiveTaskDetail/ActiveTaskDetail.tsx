import { useState } from "react";
import TaskTimerComponent from "../TaskTimerComponent/TaskTimerComponent";
import './ActiveTaskDetail.css'

interface TaskItem {
    id: number;
    project_name: string;
    project: number;
    name: string;
    description: string;
    deadline: string;
    created_at: string;
    status: string;
}


function ActiveTaskDetail({ task, onClose}: {task: TaskItem, onClose: () => void}) {
    const {id, name, project_name, description, deadline, created_at, status} = task
    const [isClose, setIsClose] = useState<boolean>()

    const handleClose = () =>  {
        setIsClose(true)

        setTimeout(() => {
            onClose()
        }, 400)
    }

    return (
        <div className={`detail-active-task__body ${isClose ? 'close' : ''}`}>
            <div className="detail-active-task__content">
                <button onClick={handleClose} className="detail-active-task__close">✖</button>
                <div className="detail-active-task__title">
                    <h2>{name}</h2>
                </div>

                <div className="detail-active-task__description">
                    <h4>Task Description</h4>
                    <p>{description}</p>
                </div>

                <div className="detail-active-task__session-timer-wrapper">
                    <div className="detail-active-task__timer-container">
                        <h4>Session Timer</h4>
                        <TaskTimerComponent shortVersion={false} taskId={id} taskName={name}/>
                    </div>
                    <div className="detail-active-task__session-timer">
                        <h4>Task Session</h4>
                        <button>My sessions</button>
                    </div>
                </div>
            </div>

            <div className="detail-active-task__data-info">
                <h4>Deadline info</h4>
                <p className="created_at">created: {created_at}</p>
                <label>-</label>
                <p className="deadline">deadline: {deadline}</p>
            </div>
        </div>
    )
}

export default ActiveTaskDetail
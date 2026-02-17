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


    return (
        <div className="detail-active-task__body">
            <div>            
                <div className="detail-active-task__title">
                    <h2>{name}</h2>
                    <button onClick={onClose}>X</button>
                </div>

                <div className="detail-active-task__description">
                    <h4>Task Description</h4>
                    <p>{description}</p>
                </div>

                <div className="detail-active-task__session-timer">
                    <label>Task Session</label>
                    <h4>My sessions</h4>

                    <div className="detail-active-task__timer-container">
                        <p>Session Timer</p>
                        <TaskTimerComponent shortVersion={false} taskId={id} taskName={name}/>
                    </div>
                </div>
            </div>

            <div className="detail-active-task__data-info">
                <p className="created_at">created: {created_at}</p>
                <label>-</label>
                <p className="deadline">deadline: {deadline}</p>
            </div>
        </div>
    )
}

export default ActiveTaskDetail
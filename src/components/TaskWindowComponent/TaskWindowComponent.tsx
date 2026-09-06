import { createPortal } from "react-dom"
import { useModalClose } from "../../common/hooks/closeOverlay"
import "./TaskWindowComponent.css"
import { useState } from "react"
import  Icon  from "../UI/icons/icon.tsx"
import TaskTimerComponent from "../TaskTimerComponent/TaskTimerComponent.jsx"
import { truncateString } from "../../common/truncate.js"
import TaskStatisticModelWindow from "../TaskStatisticModelWindow/TaskStatisticModelWindow.tsx"
import TaskSettingsComponent from "../TaskSettingsComponent/TaskSettingsComponent.tsx"
import TaskChat from "../TaskChat/TaskChat.tsx"

type TaskStatus = "US" | "NS"| "BS"

interface TaskData {
    created_at: string;
    deadline: string;
    description: string;
    id: number;
    is_performer: boolean
    name: string;
    project: number;
    project_name: string;
    status: TaskStatus
}

interface TaskWindowComponentProps {
    onClose: () => void;
    data: TaskData;
    groupId: string;
    projectId: string;
}

type ActivePartTypes = "subTask" | 'chat' | 'settings' | 'statistic' | null

function TaskWindowComponent ({ onClose, data, groupId, projectId} : TaskWindowComponentProps) {
    const { isClosing, handleCloseWindow} = useModalClose({onClose: onClose, delay: 400, className: 'window-overlay'})
    const [activePart, setActivePart] = useState<ActivePartTypes>("subTask")
    const [taskData] = useState(data)

    return (
        createPortal(
            <div 
            className={`window-overlay ${isClosing ? "close": 'open'} `} 
            onClick={handleCloseWindow}
            >
                <div 
                className="window-body"
                style={{
                    maxHeight: "800px",
                    minHeight: "600px",
                    maxWidth: "1000px"
                }}
                >
                    <div className="task-component__base-container">
                        <div className="task-component__side-column">
                            <Icon
                            onClick={() => setActivePart('subTask')}
                            className={`${activePart === "subTask" ? "active": "none"}`}
                            name="subTask"
                            />
                            
                            <Icon
                            onClick={() => setActivePart('chat')}
                            className={`${activePart === "chat" ? "active": "none"}`}
                            name="chat"
                            />

                            <Icon
                            onClick={() => setActivePart("statistic")}
                            className={`${activePart === "statistic" ? "active": "none"}`}
                            name="statistic"
                            />        

                            <Icon
                            onClick={() => setActivePart("settings")}
                            className={`${activePart === "settings" ? "active": "none"}`}
                            name="settings"
                            />
                        </div>

                        <div className="task-component__base-window">
                            <div className="task-component__base-title">
                                <h2>{truncateString(taskData.name, 50)}</h2>
                                <TaskTimerComponent taskId={taskData.id} taskName={taskData.name} />
                            </div>

                            {activePart === "subTask" && (
                                <></>
                            )}

                            {activePart === "chat" && (
                                <TaskChat data={taskData}/>
                            )}

                            {activePart === "statistic" && (
                                <TaskStatisticModelWindow
                                    taskId={taskData.id}
                                    onClose={() => setActivePart(null)}
                                />
                            )}

                            {activePart === "settings" && (
                                 <TaskSettingsComponent
                                    onClose={() => setActivePart(null)}
                                    taskId={taskData.id}
                                    projectId={projectId}
                                    groupId={groupId}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        , document.body)
    )
}

export default TaskWindowComponent
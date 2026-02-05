import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useModalClose } from "../../common/hooks/closeOverlay";
import TaskSessionComponent from "../TaskSessionComponent/TaskSessionComponent";
import './TaskStatisticModelWindow.css'

type TabNames = 'sessions' | 'diagram';

interface TaskStatisticModelWindowProps {
    taskId: number;
    onClose: () => void;
};


function TaskStatisticModelWindow({ taskId, onClose}: TaskStatisticModelWindowProps) {
    const { isClosing, handleCloseWindow } = useModalClose({ onClose: onClose, delay: 500, className: 'window-overlay'})
    const [sessionTab, setSessionsTab] = useState<boolean>(true)
    const [diagramTab, setDiagramTab] = useState<boolean>(false)


    const changeTab = (tabName: TabNames) => {
        const tabMap: Record<TabNames, Dispatch<SetStateAction<boolean>>> = {
            'sessions': setSessionsTab,
            'diagram': setDiagramTab,
        }

        // Указываем активную вкладку
        const setActiveTab = tabMap[tabName]
        setActiveTab(true)

        // Перебираем другие вкладки и закрываем их
        for (const name in tabMap) {
            if (name !== tabName) {
                const typedName = name as keyof typeof tabMap;
                tabMap[typedName](false)
            }
        }
    }

    return (
        createPortal(
        <div 
            className={`window-overlay ${isClosing ? 'close' : 'open'}`} 
            onClick={handleCloseWindow}
            style={{ zIndex: 1100}}
        >
            <div className="window-body">
                <div className="task-statistic__button-container">
                    <button 
                    className={`statistic-button ${sessionTab === true ? 'active' : ''}`}
                    onClick={() => changeTab('sessions')}
                    >Sessions</button>

                    <button 
                    className={`diagram-button ${diagramTab === true ? 'active' : ''}`}
                    onClick={() => changeTab('diagram')}
                    >Diagrams</button>
                </div>
                
                {sessionTab === true && (
                    <TaskSessionComponent taskId={taskId}/>
                )}

                {diagramTab === true && (
                    <></>
                )}
            </div>
        </div>
        , document.body
        )
    )
}


export default TaskStatisticModelWindow
import { useEffect, useState } from "react"
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"
import './ActiveTaskPage.css'
import ActiveTaskDetail from "../../components/ActiveTaskDetail/ActiveTaskDetail"

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

interface ActiveItem {
    task: TaskItem
    date_add: string;
}



function ActiveTaskPage() {
    const [activeTasks, setActiveTasks] = useState<ActiveItem[]>([])
    const [detailTask, setDetailTask] = useState<TaskItem | null>(null)

    useEffect(() => { 
        const getActiveTasks = async () => {
            try {
                const response =await api.get(
                    'api/v1/tasks/get_active_tasks/',
                    {headers: {Authorization: getAccessToken()}}
                )

                console.log(response)
                setActiveTasks(response.data.results)
            } catch (error) {
                throw error
            }
        }

        getActiveTasks()
    }, [])

    return (
        <div className="active-tasks__body">
            <div className="active-tasks__container">
                {activeTasks.length > 0 && activeTasks.map((item, index) => (
                    <div 
                    className={`active-task__card ${detailTask?.id === item?.task?.id ? 'active' : ''}`}
                    onClick={() => setDetailTask(item.task)}
                    key={index}
                    >
                        <h2>Task name: {item?.task?.name}</h2>
                        <h4>Project name: {item?.task?.project_name}</h4>
                        <p>{item?.date_add}</p>
                    </div>
                ))}
            </div>
            <div className="active-tasks__detaiil">
                {detailTask && (
                    <ActiveTaskDetail task={detailTask} onClose={() => setDetailTask(null)}/>
                )}
            </div>
        </div>
    )
}

export default ActiveTaskPage
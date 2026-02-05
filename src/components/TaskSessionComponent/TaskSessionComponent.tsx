import './TaskSessionComponent.css'
import { useState, useEffect } from 'react'
import { getAccessToken } from '../../../tokens_func';
import { api } from '../../../api';
import PerformerSessionCard from '../PerformerSessionCard/PerformerSessionCard';

interface User {
    id: number
    username: string;
    image_profile_url: string;
}

interface PerformerSessionItem {
    id: number;
    duration: string;
    user: User;
    is_active: boolean;
}

function TaskSessionComponent({ taskId } : { taskId: number}) {
    const [performersSessions, setPerformersSessions] = useState<PerformerSessionItem[]>([])

    useEffect(() => {
            const getPerformersSession = async () => {
                try {
                    const response = await api.get(
                        `api/v1/task-sessions/${taskId}/get_task_performers_sessions/`,
                        {headers: {Authorization: getAccessToken()}}
                    )
    
                    console.log(response.data)
                    setPerformersSessions(response.data.results)
                } catch (error) {
                    throw error
                }
            }
    
            getPerformersSession()
    }, [])

    return (
        <div className="task-sessions-body">
            {performersSessions.length > 0 && performersSessions.map((data, index) => (
                <PerformerSessionCard data={data} index={index} key={data.id}/>
            ))}
        </div>
    )
}


export default TaskSessionComponent
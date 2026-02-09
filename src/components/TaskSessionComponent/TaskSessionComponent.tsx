import './TaskSessionComponent.css'
import { useState, useEffect, useReducer } from 'react'
import { getAccessToken } from '../../../tokens_func';
import { api } from '../../../api';
import PerformerSessionCard from '../PerformerSessionCard/PerformerSessionCard';
import { useSearchParams } from 'react-router';

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

interface initialStateType {
    is_active: null | boolean;
    user_filter: null | string;
    unactive: null | boolean;
}

const initialState = {
    is_active: null,
    user_filter: null,
    unactive: null,
}

const reducer = (state: initialStateType, action : {type: string, payload: any}) => {
    switch(action.type) {
        case 'SET_IS_ACTIVE':
            return {...state, unactive: false, is_active: action.payload}

        case "SET_USER_FILTER":
            return {...state, user_filter: action.payload}

        case 'SET_UNACTIVE':
            return {...state, is_active: false, unactive: action.payload}

        case 'CLEAR_FILTERS':
            return {...state, is_active: false, unactive: false}

        default:
            return state
    }
}

function TaskSessionComponent({ taskId } : { taskId: number}) {
    const [performersSessions, setPerformersSessions] = useState<PerformerSessionItem[]>([])
    const [state, dispatch] = useReducer(reducer, initialState)

    const buildUrl = () => {
        let filterExists = false
        let url = `api/v1/task-sessions/${taskId}/get_task_performers_sessions/`;

        if (state.is_active) {
            url = url + `?is_active=${state.is_active ? 'True' : ''}`
            filterExists = true
        };

        if (state.unactive && filterExists) {
            url = url + `&?unactive=${state.unactive ? 'True' : ''}`
        } else if (state.unactive && !filterExists) {
            url = url + `?unactive=${state.unactive ? 'True' : ''}`
            filterExists = true
        };

        if (state.user_filter && filterExists) {
            url + `&?user_filter=${state.user_filter}`
        } else if (state.user_filter && !filterExists) {
            url + `?user_filter=${state.user_filter}`
        }
        return url
    }

    useEffect(() => {
            const getPerformersSession = async () => {
                try {
                    const response = await api.get(
                        buildUrl(),
                        {headers: {Authorization: getAccessToken()}}
                    )
    
                    console.log(response.data)
                    setPerformersSessions(response.data.results)
                } catch (error) {
                    throw error
                }
            }
    
            getPerformersSession()
    }, [state.is_active, state.user_filter, state.unactive])

    const changeStateStatistics = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === 'is_active') {
            dispatch({type: 'SET_IS_ACTIVE', payload: !!e.target.value})
        } else if (e.target.value === 'unactive') {
            dispatch({type: 'SET_UNACTIVE', payload: !!e.target.value})
        } else {
            dispatch({ type: 'CLEAR_FILTERS', payload: true})
        }
    }

    return (
        <>
        <div className='sessions-filters-body'>
            <select 
            name="activity" 
            id="activity" 
            onChange={changeStateStatistics}
            >   
                <option value="" defaultValue={''}>filter</option>
                <option value="is_active">is active</option>
                <option value="unactive">unactive</option>
            </select>

            <input 
            type="text" 
            name='username' 
            placeholder='input username' />
        </div>
        <div className="task-sessions-body">
            {performersSessions.length > 0 && performersSessions.map((data, index) => (
                <PerformerSessionCard data={data} index={index} key={data.id}/>
            ))}
        </div>
        </>
    )
}


export default TaskSessionComponent
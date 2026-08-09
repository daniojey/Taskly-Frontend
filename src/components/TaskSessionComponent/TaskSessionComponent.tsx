import './TaskSessionComponent.css'
import { useState, useEffect, useReducer } from 'react'
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
    created_at: number;
}

interface initialStateType {
    is_active: null | boolean;
    user_filter: null | string;
    unactive: null | boolean;
}


interface PageData {
    current: number,
    total: number,
    item_per_page: number,
}

const initialState = {
    is_active: null,
    user_filter: null,
    unactive: null,
}


function getPages(current: number, total: number = 0, siblings: number = 1) {
    const totalNumbers = siblings * 2 + 5;
    if (total <= totalNumbers) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }

    const leftSibling = Math.max(current - siblings, 1);
    const rightSibling = Math.min(current + siblings, total);
    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < total - 1;

    if (!showLeftDots && showRightDots) {
        const leftRange = Array.from({ length: 3 + siblings * 2 }, (_, i) => i + 1);
        return [...leftRange, "...", total];
    }

    if (showLeftDots && !showRightDots) {
        const count = 3 + siblings * 2;
        const rightRange = Array.from({ length: count }, (_, i) => total - count + i + 1)
        return [1, "...", ...rightRange]
    }

    const middleRange = Array.from(
        { length: rightSibling - leftSibling + 1 },
        (_, i) => leftSibling + i
    );

    return [1, "...", ...middleRange, "...", total]
}

const reducer = (state: initialStateType, action: { type: string, payload: any }) => {
    switch (action.type) {
        case 'SET_IS_ACTIVE':
            return { ...state, unactive: false, is_active: action.payload }

        case "SET_USER_FILTER":
            return { ...state, user_filter: action.payload }

        case 'SET_UNACTIVE':
            return { ...state, is_active: false, unactive: action.payload }

        case 'CLEAR_FILTERS':
            return { ...state, is_active: false, unactive: false }

        default:
            return state
    }
}

function TaskSessionComponent({ taskId }: { taskId: number }) {
    const [pagesData, setPagesData] = useState<PageData>({
        current: 1,
        total: 0,
        item_per_page: 10
    })
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [performersSessions, setPerformersSessions] = useState<PerformerSessionItem[]>([])
    const [state, dispatch] = useReducer(reducer, initialState)

    useEffect(() => {
        setCurrentPage(1)
        setPagesData({...pagesData, current: 1})
    },[state.is_active, state.unactive, state.unactive])

    const buildUrl = () => {
        let filterExists = true
        let url = `api/v1/task-sessions/${taskId}/get_task_performers_sessions/?page=${currentPage}`;

        if (state.is_active && filterExists) {
            url = url + `&is_active=${state.is_active ? 'True' : ''}`
        } else if (state.is_active && !filterExists) {
            url = url + `?is_active=${state.is_active ? 'True' : ''}`
        }

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
                    { headers: { Authorization: getAccessToken() } }
                )

                console.log(response.data)
                setPerformersSessions(response.data.results)

                const data = response.data
                setPagesData({
                    current: currentPage,
                    total: Math.ceil(data.count / data.page_size) || 0,
                    item_per_page: data.item_per_page,
                })

            } catch (error) {
                throw error
            }
        }

        getPerformersSession()
    }, [state.is_active, state.user_filter, state.unactive, currentPage])

    const changeStateStatistics = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === 'is_active') {
            dispatch({ type: 'SET_IS_ACTIVE', payload: !!e.target.value })
        } else if (e.target.value === 'unactive') {
            dispatch({ type: 'SET_UNACTIVE', payload: !!e.target.value })
        } else {
            dispatch({ type: 'CLEAR_FILTERS', payload: true })
        }
    }

    return (
        <>
            <div className='sessions-filters-body'>
                <select
                    name="activity"
                    id="activity"
                    className='holy_select'
                    style={{
                        maxWidth: "150px"
                    }}
                    onChange={changeStateStatistics}
                >
                    <option value="" defaultValue={''}>filter</option>
                    <option value="is_active">is active</option>
                    <option value="unactive">unactive</option>
                </select>

                <input
                    type="text"
                    className='holy_input'
                    style={{
                        maxWidth: "150px"
                    }}
                    name='username'
                    placeholder='input username' />

                <div
                    className='paggination-delta'
                >
                    {pagesData?.current && getPages(pagesData?.current, pagesData?.total).map((p, i) =>
                        p === "..." ? (
                            <span key={`dots-${i}`} className="pagination-dots">...</span>
                        ) : (
                            <button
                                value={p}
                                key={p}
                                id={`${pagesData?.current === Number(p) ? 'current-page-number' : ''}`}
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    if (Number(e.currentTarget.value) && e.currentTarget.value) {
                                        return setCurrentPage(Number(e.currentTarget.value))
                                    }
                                }
                                }
                            >
                                {p}
                            </button>
                        )
                    )}
                </div>
            </div>
            <div className="task-sessions-body">
                {performersSessions.length > 0 && performersSessions.map((data, index) => (
                    <PerformerSessionCard data={data} index={index} key={data.id} />
                ))}
            </div>
        </>
    )
}


export default TaskSessionComponent
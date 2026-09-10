import { useEffect, useReducer, useState } from "react";
import "./SubTasksComponent.css"
import { SubTaskActionTypes, SubTasksActions, SubTasksState, SubTaskItem } from "./TypesSubTasks"
import { useApi } from "../../common/api_query";
import { useNotify } from "../../common/stores/NotifyStore";

const initialState: SubTasksState = {
    subtasks: [],
    loading: false
}

function SubTasksReducer(state: SubTasksState, action: SubTasksActions) {
    const { type, payload } = action;

    switch (type) {
        case SubTaskActionTypes.SET_SUBTASKS:
            return {
                ...state,
                subtasks: payload
            }

        case SubTaskActionTypes.UPDATE_SUBTASK:
            return {
                ...state,
                subtasks: state.subtasks.map(item => item.id === payload.id ? payload : item)
            }

        case SubTaskActionTypes.REMOVE_SUBTASK:
            return {
                ...state,
                subtasks: state.subtasks.filter(item => item.id === item.id)
            }
        default:
            return state
    }
}



function SubTasksComponent({ taskId }: { taskId: number }) {
    const [state, dispatch] = useReducer(SubTasksReducer, initialState)
    const [lastActiveTask, setLastActiveTask] = useState<number>()
    const { addNotify } = useNotify()

    useEffect(() => {
        const loadSubtasks = async () => {
            const result = await useApi<SubTaskItem[]>(`api/v1/tasks/${taskId}/get_subtasks/`, "get");

            if (result.success) {
                dispatch({ type: SubTaskActionTypes.SET_SUBTASKS, payload: result.data });
            } else {
                console.error(result.error);
            }
        };

        loadSubtasks();
    }, [])


    useEffect(() => {
        const lastItem = state.subtasks.find(item => !item.is_closed)
        setLastActiveTask(Number(lastItem?.id))
    }, [state.subtasks])


    async function UpdateSubtask(subTaskId: number, is_closed: boolean) {
        const result = await useApi<SubTaskItem>(
            `api/v1/tasks/${subTaskId}/suptask_update/`,
            "patch",
            { is_closed: is_closed }
        )

        if (result.success) {
            dispatch({ type: SubTaskActionTypes.UPDATE_SUBTASK, payload: result.data })
        } else {
            addNotify(result.error, 'error')
        }
    }


    function CheckSubTaskStatus(item: SubTaskItem) {

        if (lastActiveTask && lastActiveTask >= item.id) {
            return false
        }

        if (item.is_closed) {
            setLastActiveTask(item.id + 1)
        }
        return true
    }


    return (
        <div className="subtasks__base-container">
            {state.subtasks.length > 0 && state.subtasks.map((item, index) => (
                <>
                    <div
                        key={index}
                        className="subtask__row"
                    >
                        <div
                            className={`holy_checkbox ${item.is_closed ? 'active' : ''} ${CheckSubTaskStatus(item) ? "off" : ''}`}
                        >
                            <input
                                id="sb-1"
                                type="checkbox"
                                checked={item.is_closed}
                                onChange={() => { }}
                            />
                            <label
                                htmlFor="sb-1"
                                onClick={() => { UpdateSubtask(item.id, !item.is_closed) }}
                            ></label>
                        </div>

                        <p>{item.title}</p>
                        <div></div>
                    </div>
                </>
            ))}
        </div>
    )
}

export default SubTasksComponent
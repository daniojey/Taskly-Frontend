import { useCallback, useEffect, useReducer, useState } from "react";
import "./SubTasksComponent.css"
import { SubTaskActionTypes, SubTasksActions, SubTasksState, SubTaskItem } from "./TypesSubTasks"
import { useApi } from "../../common/api_query";
import { useNotify } from "../../common/stores/NotifyStore";
import DynamicPngIcon from "../UI/icons/DynamicPngIcon";
import CreateSubTask from "../CreateSubTask/CreateSubTask";
import DeleteSubTask from "../DeleteSubTask/DeleteSubTask";

const initialState: SubTasksState = {
    subtasks: [],
    loading: false,
    newSubtasks: []
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

        case SubTaskActionTypes.ADD_NEW_SUBTASK:
            return {
                ...state,
                subtasks: [...state.subtasks, payload]
            }
        default:
            return state
    }
}



function SubTasksComponent({ taskId }: { taskId: number }) {
    const [state, dispatch] = useReducer(SubTasksReducer, initialState)
    const [ createWindow, setCreateWindow] = useState<boolean>(false)
    const { addNotify } = useNotify()
    const [ editMode, setEditMode] = useState<boolean>(false)
    const [ deleteSubTaskId, setDeleteSubTaskId] = useState<number | null>(null)
    const [descriptionExpanded, setDescriptionExpanded] = useState<Set<number>>(new Set())


    const toggleExpand = (id: number) => {

        if (editMode) {
            return
        }

        setDescriptionExpanded(prev => {
            const next = new Set(prev)

            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }

            return next
        })
    }


    const loadSubtasks = useCallback(async () => {
        const result = await useApi<SubTaskItem[]>(`api/v1/tasks/${taskId}/get_subtasks/`, "get");

            if (result.success) {
                dispatch({ type: SubTaskActionTypes.SET_SUBTASKS, payload: result.data });
            } else {
                console.error(result.error);
            }
        }, [taskId]
    )


    useEffect(() => {
        loadSubtasks();
    }, [loadSubtasks])


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


    const isExpanded = (id: number) => {
        return descriptionExpanded.has(id)
    }


    const handleUpdateSubtasks = (subtask: SubTaskItem) => {
        dispatch({"type": SubTaskActionTypes.ADD_NEW_SUBTASK, "payload": subtask})
        setCreateWindow(false)
    }


    function swap<T>(list: T[], i: number, j: number): T[] {
        if (i < 0 || j < 0 || i >= list.length || j >= list.length) return list

        const copy = [...list]
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
        return copy
    }


    const changeSubTaskPosition = async (itemId: number, direction: -1 | 1) => {
        const index = state.subtasks.findIndex(t => t.id === itemId)

        console.log(index)
        if (index === -1) return

        const next = swap<SubTaskItem>(state.subtasks, index, index + direction)
        if (next === state.subtasks) return

        const prevTasks = state.subtasks

        dispatch({"type": SubTaskActionTypes.SET_SUBTASKS, payload: next})

        
        const result = await useApi(
            "api/v1/subtasks/reorder/",
            "post",
            {
                "reorder": next.map(item => item.id),
                "task_id": taskId
            }
        )

        if (!result.success) {
            dispatch({"type": SubTaskActionTypes.SET_SUBTASKS, payload: prevTasks})
            addNotify("We have error when try to change position task", "error")
        }
    }

    return (
        <div className="subtasks__base-container">
            {createWindow && (
                <CreateSubTask onClose={() => setCreateWindow(false)} taskId={taskId} onUpdate={handleUpdateSubtasks}/>
            )}

            {deleteSubTaskId && (
                <DeleteSubTask 
                subTaskId={deleteSubTaskId} 
                onClose={() => setDeleteSubTaskId(null)}
                onUpdate={loadSubtasks}/>
            )}


            {state.subtasks.length > 0 && state.subtasks.map((item, index) => (
                <>
                    <div
                        key={index}
                        className="subtask__row"
                    >
                        <div
                            className={`holy_checkbox ${item.is_closed ? 'active' : ''}`}
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

                        <div 
                        className="subtask__row-title"
                        onClick={() => toggleExpand(item.id)}
                        >
                            <p
                            
                            >{item.title}</p>
                        </div>
                        
                        {!isExpanded(item.id) && !editMode && (
                            <DynamicPngIcon 
                            id="subtask-expand-arrow"
                            onClick={() => toggleExpand(item.id)}
                            iconName={"arrowDownWhite"}/>
                        )}

                        {editMode && (
                            <div className="subtask-edit-mode__body">
                                <div className="subtask-edit-mode__item">
                                    <DynamicPngIcon 
                                    iconName="stratagemArrow_up"
                                    onClick={() => changeSubTaskPosition(item.id, -1)}
                                    />
                                </div>

                                <div className="subtask-edit-mode__item">
                                    <DynamicPngIcon 
                                    iconName="stratagemArrow_down"
                                    onClick={() => changeSubTaskPosition(item.id, 1)}
                                    />
                                </div>
                                
                                <div className="subtask-edit-mode__item"
                                    onClick={() => setDeleteSubTaskId(item.id)}>
                                    <DynamicPngIcon iconName="deleteBucketIcon"/>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`subtask__description-wrapper ${isExpanded(item.id) ? "expanded" : ""}`}>
                        <div className="subtask__description">
                            {item.description}
                        </div>
                    </div>
                </>
            ))}
            <div 
            className="subtask-button__body"
            >
                <p
                onClick={() => setCreateWindow(true)}>Add Subtask +</p>

                <p
                id={editMode ? `edit-mode`: 'unactive-edit-mode'}
                onClick={() => {
                    setEditMode(!editMode)
                    setDescriptionExpanded(new Set())
                }}
                >
                {!editMode ? "Edit mode" : "Close edit"}
                </p>
            </div>
        </div>
    )
}

export default SubTasksComponent
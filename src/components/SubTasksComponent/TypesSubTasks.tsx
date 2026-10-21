export enum SubTaskActionTypes {
    SET_SUBTASKS = "SET_SUBTASKS",
    UPDATE_SUBTASK = "UPDATE_SUBTASK",
    REMOVE_SUBTASK = "REMOVE_SUBTASK",
    ADD_NEW_SUBTASK = "ADD_NEW_SUBTASK"
}


export interface SubTaskItem {
    id: number;
    title: string;
    description: string;
    priority: string;
    created_at: string;
    is_closed: boolean;
}


interface SetSubTasks {
    type: SubTaskActionTypes.SET_SUBTASKS,
    payload: SubTaskItem[]
}

interface UpdateSubTask {
    type: SubTaskActionTypes.UPDATE_SUBTASK,
    payload: SubTaskItem
}

interface RemoveSubtask {
    type: SubTaskActionTypes.REMOVE_SUBTASK,
    payload: SubTaskItem
}

interface AddNewSubTask {
    type: SubTaskActionTypes.ADD_NEW_SUBTASK,
    payload: SubTaskItem
}

export type SubTasksActions = 
    SetSubTasks |
    UpdateSubTask |
    RemoveSubtask |
    AddNewSubTask


export interface SubTasksState {
    subtasks: SubTaskItem[];    
    loading: boolean
}


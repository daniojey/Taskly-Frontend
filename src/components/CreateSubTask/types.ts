import { SubTaskItem } from "../SubTasksComponent/TypesSubTasks";

export interface CreateSubTaskProps {
    onClose: () => void;
    taskId: number;
    onUpdate: (subtask: SubTaskItem) => void;
}
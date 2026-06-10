import { api } from "../../../../api";
import { getAccessToken } from "../../../../tokens_func";

type TaskStatus = 'NS' | 'BS' | 'US'

interface FormData {
    name: string;
    description?: string;
    status: TaskStatus;
    deadline: string;
}

interface WindowFunction {
    closeWindow: () => void;
    onUpdate: () => void;
}

export const createTask = async (formData: FormData, projectId: string | undefined, windowFunctions: WindowFunction) => {
    if (!projectId) return new Error('Project not found')

    try {
        const response = await api.post(
            `api/v1/projects/${projectId}/tasks/`,
            { ...formData },
            {
                headers: {
                    Authorization: getAccessToken()
                }
            }
        )

        console.log("RESPONSE", response)
        windowFunctions.closeWindow()
        windowFunctions.onUpdate()
    } catch (error) {
        return error
    }
}
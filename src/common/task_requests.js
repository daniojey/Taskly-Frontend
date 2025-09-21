import { api } from "../../api"
import { getAccessToken } from "../../tokens_func"

const mapStatus = {
    "no-status": 'NS',
    "base-status": 'BS',
    "urgent-status": 'US',
}

export const updateTask = async (projectId, active, overContainerId) => {
    try {

        const response = await api.post(
            `api/v1/projects/${projectId}/tasks/${active.id}/update_status/`,
            {
                new_status: mapStatus[overContainerId]
            },
            {
                headers: {
                    Authorization: getAccessToken()
                }
            }
        )

        console.log(response)
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}
import { api } from "../../../../api";
import { getAccessToken } from "../../../../tokens_func";

export async function deleteGroup(groupId) {
    if (groupId === null) return

    try {
        const response = api.delete(`api/v1/groups/${groupId}/`,
            { headers: {Authorization: getAccessToken()}}
        )
        console.log(response)
    } catch (e) {
        console.error(e)
        throw e
    }
}
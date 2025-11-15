import { api } from "../../api"
import { getAccessToken } from "../../tokens_func"

export const delete_user_in_group = async (userId, groupId) => {
    try {
        const response = await api.post(
            `api/v1/groups/${groupId}/delete_member/`,
            {userId: userId, groupId:groupId},
            {headers: {
                Authorization: getAccessToken()
            }}
        )

        console.log(response)
        return await response.status
    } catch (error) {
        return await error
    }
}
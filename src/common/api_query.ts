import { api } from "../../api";
import { getAccessToken } from "../../tokens_func";

type MethodTypes = 'get' | 'post'| 'delete' | 'patch'

interface ApiResultSuccess<T> {
    success: true,
    data: T
}

interface ApiResultError {
    success: false,
    error: string
}

type ApiResult<T> = ApiResultSuccess<T> | ApiResultError

export async function useApi<T>(url: string, method: MethodTypes, data: any = {}): Promise<ApiResult<T>> {
    try {

        switch(method) {
            case "get":
                const getResult =await api.get(url, {headers: {Authorization: getAccessToken()}})
                return { success: true, data: getResult.data.results}
            case "post":
                const postResult = await api.post(url, data, {headers: {Authorization: getAccessToken()}})
                return { success: true, data: postResult.data.results}
            case "delete":
                const deleteResult = await api.delete(url, {headers: {Authorization: getAccessToken()}})
                return { success: true, data: deleteResult.data.results}
            case "patch":
                const patchResult = await api.patch(url, data, {headers: {Authorization: getAccessToken()}})
                return { success: true, data: patchResult.data.results}
        }
    } catch (e) {
        return { success: false, error: String(e)}
    }
}
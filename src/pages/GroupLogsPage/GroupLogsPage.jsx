import { useParams, useSearchParams } from "react-router"
import { useEffect, useState } from "react"
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"

function GroupLogsPage () {
    const [logs, setLogs] = useState([])
    const [searchParams, setSearchParams] = useSearchParams()

    const { groupId } = useParams()

    const page = searchParams.get('page') || '1'

    const buildUrl = (page) => {
        const url = `api/v1/group/${groupId}/logs`
        const params = new URLSearchParams()

        if (page) params.set('page', page)
        const queryParam = params.toString()

        return queryParam ? `${url}?${queryParam}` : url
    }

    useEffect(() => {
        const getGroupLogs = async () => {
            try {
                const response = await api.get(
                    buildUrl(page),
                    {headers: {
                        Authorization: getAccessToken()
                    }}
                )
                
                console.log(response)
                setLogs(response.data.results)
            } catch (error) {
                console.error(error)
            }
        }


        getGroupLogs()
    }, [page])

    return (
        <div>
            {logs && logs.length > 0 && logs.map((item, index) => (
                <h2 key={index}>{item.event_type} - {item.created_at}</h2>
            ))}
        </div>
    )
}


export default GroupLogsPage
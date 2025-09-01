import { useEffect, useState } from "react"
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"
import GroupCard from "../../components/GroupCard/GroupCard"

function GroupsPage() {
    const [groups, setGroups] = useState([])

    useEffect(() => {
        const  getGroups = async () => {
            try {
                const response = await api.get(
                    'api/v1/groups/',
                    {
                        headers : {
                            Authorization: getAccessToken()
                        }
                    },
                )
                console.log(response)

                setGroups(response.data.result)

            } catch (error) {
                console.error(error)
            }
            

            
        }

        getGroups()
    }, [])

    return (
        <div className="base-container">
            {groups && groups.map((item, index) => (
                <GroupCard props={item} key={index}/>
            ))}
             
        </div>
    )
}

export default GroupsPage
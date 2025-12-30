import { useEffect, useState, useContext } from "react"
import { api } from "../../../api.js"
import { getAccessToken } from "../../../tokens_func.js"
import GroupCard from "../../components/GroupCard/GroupCard.tsx"
import './GroupPage.css'
import { useSearchParams } from "react-router"
import { AuthContext } from "../../AuthContext.jsx"
import AddMembersModelWindow from "../../components/AddMembersModelWindow/AddMembersModelWindow.tsx"

interface Members {
    email: string;
    first_name: string;
    id: number;
    image_profile: string | null;
    image_profile_url: string | null;
    in_group: boolean;
    in_invite_send: boolean;
    last_login: string;
    last_name: string;
    username: string
}

interface Projects {
    created_at: string;
    description: string;
    group_name: string;
    id: number;
    title: string;
}

interface GroupItem {
    id: number;
    name: string;
    members: Members[];
    projects: Projects[];
    created: true | null

}

function GroupsPage() {
    const [groups, setGroups] = useState<GroupItem[]>([])
    const [searchParams, setSearchParams] = useSearchParams()
    const [createForm, setCreateForm] = useState<boolean>(false) 
    const [groupName, setGroupName] = useState<string | null>(null)
    const {user} = useContext(AuthContext)
    const [addMembersWindow, setAddMembersWindow] = useState<boolean>(false)


    // const filter = searchParams.get('filter') || ''

    const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value) {
            const param = new URLSearchParams()
            param.set('f', e.target.value)
            setSearchParams(param)
        } else {
            const param = new URLSearchParams();
            setSearchParams(param)
        }
    }

    const onCreateGroup = async (members_ids: number[] | null = null) => {
        let members_data: number[] = [user.id]

        if (members_ids) {
            members_data = [...members_ids, user.id]
        } else {
            members_data = [user.id]
        }


        try {
            const response = await api.post(
                'api/v1/groups/',
                {members: members_data, name: groupName, owner: user.id},
                {
                    headers: {
                        Authorization: getAccessToken()
                    }
                }
            )

            console.log(response)

            // setGroups({response.data.result})
            const data = {
                created: true,
                ...response.data.result
            }
            setGroups(groups => [data, ...groups]);
        } catch (error) {
            console.error(error)
        }
    }

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault()

        // console.log(typeof user)
        // console.log(groupName)

        try {
            // const response = await api.post(
            //     'api/v1/groups/',
            //     {members:[user.id], name: groupName, owner: user.id},
            //     {
            //         headers: {
            //             Authorization: getAccessToken()
            //         }
            //     }
            // )

            // console.log(response)

            // // setGroups({response.data.result})
            // const data = {
            //     created: true,
            //     ...response.data.result
            // }
            // setGroups(groups => [data, ...groups]);
            setAddMembersWindow(true)
        } catch (error) {
            console.error(error)
        }
        
    }


    useEffect(() => {
        const url = 'api/v1/groups/?' + searchParams.toString();

        const  getGroups = async () => {
            try {
                const response = await api.get(
                    url,
                    {headers : {
                            Authorization: getAccessToken()
                    }},
                )
                console.log(response)
                setGroups(response.data.result)
            } catch (error) {
                console.error(error)
            }
        }

        getGroups()
    }, [searchParams])

    return (
        <div className="base-container">

            {addMembersWindow && (
                <AddMembersModelWindow onClose={() => setAddMembersWindow(false)} onCreateGroup={onCreateGroup}/>
            )}

            <div className="group-navigation-block">
                <div className="group-navigation-block__filter">
                    <label htmlFor="filters">Filter</label>
                    <select name="filters" id="filters" onChange={onChange}>
                        <option value="">Default</option>
                        <option value="A-z">A-z</option>
                        <option value="Z-a">Z-a</option>
                        <option value="created">created Data</option>
                    </select>
                </div>
                

                <button
                className={createForm ? "active-button" : ''} 
                onClick={(e) => setCreateForm(!createForm)}
                >
                {createForm ? (
                    <>
                        Close   
                    </>
                ): (
                    <>
                        Create Group
                    </>
                )}</button>
            </div>

            <form className={createForm ? "group-form-body active" : "group-form-body"} onSubmit={submitForm}>
                <h2>Come up with a name for the group</h2>
                <input type="text" placeholder="Group name" onChange={(e) => {
                    const target = e.target as HTMLInputElement
                    setGroupName(target.value)} 
                }
                required/>
                <button type="submit">Create Group</button>
            </form>
            
            <div className="group-cards-body">

                {groups && groups.map((item, index) => (
                    <GroupCard 
                    props={{index, ...item}} 
                    key={index} 
                    />
                ))}
            </div>
            
             
        </div>
    )
}

export default GroupsPage
import { useEffect, useState, useContext } from "react"
import { api } from "../../../api.js"
import { getAccessToken } from "../../../tokens_func.js"
import GroupCard from "../../components/GroupCard/GroupCard.tsx"
import './GroupPage.css'
import { useSearchParams } from "react-router"
import { AuthContext } from "../../AuthContext.jsx"
import AddMembersModelWindow from "../../components/AddMembersModelWindow/AddMembersModelWindow.tsx"


interface GroupItem {
    id: number;
    name: string;
    count_members: number;
    count_projects: number;
    created: true | null

}

function GroupsPage() {
    const [groups, setGroups] = useState<GroupItem[]>([])
    const [searchParams, setSearchParams] = useSearchParams()
    const [createForm, setCreateForm] = useState<boolean>(false) 
    const [groupName, setGroupName] = useState<string | null>(null)
    const {user} = useContext(AuthContext)
    const [addMembersWindow, setAddMembersWindow] = useState<boolean>(false)


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
        setAddMembersWindow(true)
    }

    useEffect(() => {
        const url = searchParams.toString() ?  'api/v1/groups/?' + searchParams.toString() : 'api/v1/groups/';

        const  getGroups = async () => {
            try {
                const response = await api.get(
                    url,
                    {headers : {
                            Authorization: getAccessToken()
                    }},
                )
                console.log(response)
                setGroups(response.data.results)
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
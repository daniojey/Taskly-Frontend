import { useEffect, useState, useContext } from "react"
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"
import GroupCard from "../../components/GroupCard/GroupCard"
import './GroupPage.css'
import { useSearchParams } from "react-router"
import { AuthContext } from "../../AuthContext"

function GroupsPage() {
    const [groups, setGroups] = useState([])
    const [searchParams, setSearchParams] = useSearchParams()
    const [createForm, setCreateForm] = useState(null) 
    const [groupName, setGroupName] = useState(null)
    const {user} = useContext(AuthContext)

    // const filter = searchParams.get('filter') || ''

    const onChange = async (e) => {
        if (e.target.value) {
            const param = new URLSearchParams()
            param.set('f', e.target.value)
            setSearchParams(param)
        } else {
            const param = new URLSearchParams();
            setSearchParams(param)
        }
    }

    const submitForm = async (e) => {
        e.preventDefault()

        // console.log(typeof user)
        // console.log(groupName)

        try {
            const response = await api.post(
                'api/v1/groups/',
                {members_ids:[user.id], name: groupName},
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
                <input type="text" placeholder="Group name" onChange={(e) => setGroupName(e.target.value)} required/>
                <button type="submit">Create Group</button>
            </form>
            
            <div className="group-cards-body">

                {groups && groups.map((item, index) => (
                    <GroupCard props={{index, ...item}} key={index} index={index}/>
                ))}
            </div>
            
             
        </div>
    )
}

export default GroupsPage
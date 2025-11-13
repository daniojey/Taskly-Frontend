import { useState, useContext, useEffect } from "react";
import './AddMembersWindow.css'
import '../../common/Styles/ModelWindow.css'
import { createPortal } from "react-dom";
import { api } from "../../../api";
import { getAccessToken } from "../../../tokens_func";
import DynamicPngIcon from "../UI/icons/DynamicPngIcon";

const searchUsers = async(input, groupId) => {
    try {
        const response = await api.post(
            'api/v1/users/search_users/',
            {username: input, group_id: groupId},
            {headers: {
                Authorization: getAccessToken()
            }}
        )

        console.log(response)
        return response.data
    } catch (error) {
        throw new Error(error?.message)
    }
}

const sendInviteGroup = async (user_id, group_id) => {
    try {
        const response = await api.post(
            `api/v1/groups/${group_id}/user_invite_group/`,
            {user_id: user_id},
            {headers: {
                Authorization: getAccessToken()
            }}
        )

        console.log(response)
        return await response.data
    } catch (error) {
        throw new Error(error)
    }
}

function AddMemberWindow({ onClose, groupId }) {
    const [searchText, setSearchText] = useState(null)
    const [closeWindow, setCloseWindow] = useState(false)
    const [users, setUsers] = useState([])

    const timers = new Map()

    const onCloseWindow = () => {
        setCloseWindow(true)

        setTimeout(() => {
            onClose()
        }, 500)
    }

    const handleClickOverlay = (e) => {
        if (e.target.className.includes('window-overlay')) {
            onCloseWindow()
        }
    }

    const handleChangeInput = (e) => {

        const timer = setTimeout(async () => {
            setSearchText(e.target.value)
            console.log(e.target.value)
            const  result = await searchUsers(e.target.value, groupId)
            console.log('RESULTS', result.results)
            setUsers(result.results)
        
        }, 2000)


        if (timers.has('timer')) {
            clearTimeout(timers.get('timer'))
        }

        timers.set('timer', timer) 
    }

    const handleClickInviteButton = async (user_id) => {
        console.log(user_id)
        const result = await sendInviteGroup(user_id, groupId)

        console.log(result.results)

        if (result.results === 'success') {
            setUsers(users.map(user => 
                user_id === user.id
                ? {...user, in_group: true}
                : user
            ))
        }
    } 

    return (
        createPortal(
            <div 
            className={`window-overlay ${closeWindow ? 'close' : 'open'}`} 
            onClick={handleClickOverlay}
            >
                <div className="window-body">

                    <div className="add-members-title-body">
                        <h1>Search members</h1>
                    </div>

                    <div className="add-members-form-body">
                        <form>
                            <input className="neomorphism-input add-members" type="text" onChange={handleChangeInput} />
                        </form>
                    </div>

                    <div className="add-members-results">
                        {users.length > 0 && users.map((item, index) => (
                            <div className="add-member__user-card">
                                { item.image_profile_url && (
                                    <img src={item.image_profile_url}/>
                                ) || (
                                    <DynamicPngIcon iconName='defaultImageProfile' width={40} height={40} />
                                )}
                                <p key={item.id}>{item.username}</p>

                                { !item.in_group && !item.is_invite_send && (
                                    <button onClick={() => handleClickInviteButton(item.id)}>send invite</button>
                                ) }
                            </div>
                        ))}
                    </div>
                </div>
            </div>,
            document.body
        )

    )
}


export default AddMemberWindow
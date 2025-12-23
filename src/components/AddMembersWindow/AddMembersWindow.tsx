import { useState, useContext, useEffect, InputHTMLAttributes } from "react";
import './AddMembersWindow.css'
import '../../common/Styles/ModelWindow.css'
import { createPortal } from "react-dom";
import { api } from "../../../api";
import { getAccessToken } from "../../../tokens_func";
import DynamicPngIcon from "../UI/icons/DynamicPngIcon";

const searchUsers = async(input: string, groupId: string) => {
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
    } catch (error: any) {
        if (error instanceof Error) {
            throw new Error(error?.message)
        }
    }
}

const sendInviteGroup = async (user_id: number, group_id: string) => {
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
        if (error instanceof Error) {
            throw new Error(error?.message)
        }
    }
}

interface AddMemberWindowProps {
    onClose: () => void;
    groupId: string;
}

interface User {
    id: number;
    username: string;
    in_group: boolean;
    image_profile_url: string | null;
    is_invite_send: boolean
}


function AddMemberWindow({ onClose, groupId }: AddMemberWindowProps) {
    const [searchText, setSearchText] = useState<string| null>(null)
    const [closeWindow, setCloseWindow] = useState<boolean>(false)
    const [users, setUsers] = useState<User[]>([])

    const timers = new Map()

    const onCloseWindow = () => {
        setCloseWindow(true)

        setTimeout(() => {
            onClose()
        }, 500)
    }

    const handleClickOverlay = (e : React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement

        if (target.className.includes('window-overlay')) {
            onCloseWindow()
        }
    }

    const handleChangeInput = (e: React.ChangeEvent) => {
        const target = e.target as HTMLInputElement

        const timer = setTimeout(async () => {
            setSearchText(target.value)
            console.log(target.value)
            const  result = await searchUsers(target.value, groupId)
            console.log(result)
            console.log('RESULTS', result.results)
            setUsers(result.results)
        
        }, 2000)


        if (timers.has('timer')) {
            clearTimeout(timers.get('timer'))
        }

        timers.set('timer', timer) 
    }

    const handleClickInviteButton = async (user_id: number) => {
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
import { useState, useContext, useEffect, InputHTMLAttributes } from "react";
import './AddMembersWindow.css'
import '../../common/Styles/ModelWindow.css'
import { createPortal } from "react-dom";
import { api } from "../../../api";
import { getAccessToken } from "../../../tokens_func";
import DynamicPngIcon from "../UI/icons/DynamicPngIcon";
import { useModalClose } from "../../common/hooks/closeOverlay";

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
    const [users, setUsers] = useState<User[]>([])

    const {
        isClosing,
        handleCloseWindow
    } = useModalClose({ onClose: onClose, delay: 400, className: 'window-overlay'})

    const timers = new Map()


    const handleChangeInput = (e: React.ChangeEvent) => {
        const target = e.target as HTMLInputElement
        
        if (timers.has('timer')) {
            clearTimeout(timers.get('timer'))
        }

        const timer = setTimeout(async () => {
            setSearchText(target.value)
            const  result = await searchUsers(target.value, groupId)
            setUsers(result.results)
        
        }, 2000)


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
            className={`window-overlay ${isClosing ? 'close' : 'open'}`} 
            onClick={handleCloseWindow}
            >
                <div className="window-body"
                style={{ maxWidth: '700px'}}>
                    <div className="add-members-content-body">
                        <div className="add-members-title-body">
                            <h1>Search members</h1>
                        </div>

                        <div className="add-members-form-body">
                            <input 
                            className="holy_input" 
                            type="text" 
                            onChange={handleChangeInput}
                            placeholder="Enter username..."
                             />
                        </div>

                        <div className="add-members-results">
                            {users.length > 0 && users.map((item, index) => (
                                <div className="add-member__user-card">
                                    <div className="add-member__user-card-body">
                                        { item.image_profile_url && (
                                            <img src={item.image_profile_url}/>
                                        ) || (
                                            <DynamicPngIcon iconName='defaultImageProfile' width={40} height={40} />
                                        )}
                                        <p key={item.id}>{item.username}</p>
                                    </div>
                                    
                                    { !item.in_group && !item.is_invite_send && (
                                        <button onClick={() => handleClickInviteButton(item.id)}>send invite</button>
                                    ) }
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        )

    )
}


export default AddMemberWindow
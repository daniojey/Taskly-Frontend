import React, { useState } from 'react';
import '../../common/Styles/ModelWindow.css'
import './AddMembersModelWindow.css'
import { createPortal } from 'react-dom';
import { api } from '../../../api';
import { getAccessToken } from '../../../tokens_func';
import DynamicPngIcon from '../UI/icons/DynamicPngIcon';
import '../../App.css'

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

interface AddMembersModelWindowProps {
    onClose: () => void;
    onCreateGroup: (members_ids: number[]) => void;
}


function AddMembersModelWindow ({ onClose, onCreateGroup }: AddMembersModelWindowProps) {
    const [close, setClose] = useState(false)
    const [searchingUsers, setSearchingUsers] = useState<Members[]>([])
    const [addMembers, setAddMembers] = useState<Members[]>([])

    const timers = new Map()

    const searchUsers = async(input: string) => {
        try {
            const response = await api.post(
                'api/v1/users/search_users/',
                {username: input},
                {headers: {
                    Authorization: getAccessToken()
                }}
            )

            return response.data
        } catch (error: any) {
            if (error instanceof Error) {
                throw new Error(error?.message)
            }
            return null
        }
    }


    const closeWindow = () => {
        setClose(true)

        setTimeout(() => {
            onClose()
        }, 500)
    }


    const handleCloseOverlay = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement

        if (target.className.includes('window-overlay')) {
            closeWindow()
        }
    }


    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value && e.target.value.length > 0 && timers.has('timer')) {
            clearTimeout(timers.get('timer'))
        }

        if (e.target.value && e.target.value.length > 0) {
            const timer = setTimeout( async () => {
                try {
                    const response = await searchUsers(e.target.value)

                    console.log(response)

                    setSearchingUsers(response.results)
                } catch (error) {
                    console.error(error)
                }
            }, 700)

            timers.set('timer', timer)
        } else {
            setSearchingUsers([])
        }
        
    }


    const handleClickAddUser = (user: Members) => {
        setAddMembers([...addMembers, user])
    }


    const handleCreate = () => {
        const selectedUsers = addMembers.map(item => ( item.id))
        onCreateGroup(selectedUsers)
        onClose()
    }

    return (
        createPortal(
            <div className={`window-overlay ${close ? 'close' : 'open'}`} onClick={handleCloseOverlay}>
                <div className='window-body' style={{
                    maxWidth: '800px',
                    height: '80vh',
                    maxHeight: '600px',
                    minHeight: '40vh'
                }}>
                    <div className='add-members-window__body'>
                        <h3>Add Members</h3>
                        <div className='add-members-window__button_body'>
                            <input type="text" className='holy_input' onChange={handleSearch} />
                        </div>

                        <div className='add-members-window__content_body'>
                            <div className='add-members-window__user_found'>
                                <h2>Serach users</h2>
                                {searchingUsers.length > 0 && searchingUsers.map(user => (
                                    <div className="add-member__user-card" key={user.id}>
                                        <div>
                                            { user.image_profile_url && (
                                                <img src={user.image_profile_url}/>
                                            ) || (
                                                <DynamicPngIcon iconName='defaultImageProfile' width={40} height={40} />
                                            )}
                                            <p>{user.username}</p>
                                        </div>

                                        <button onClick={() => handleClickAddUser(user)}>Add</button>
                                    </div>
                                ))}
                            </div>

                            <div className='add-members-window__selected_users'>
                                <h2>Added users</h2>
                                {addMembers.length > 0 && addMembers.map(user => (
                                    <div className='add-member-window__added_user_item' key={user.id}>
                                        <div>
                                            { user.image_profile_url && (
                                                <img src={user.image_profile_url}/>
                                            ) || (
                                                <DynamicPngIcon iconName='defaultImageProfile' width={40} height={40} />
                                            )}
                                            <p>{user.username}</p>
                                        </div>
                                        
                                        <div className='delete-icon-container' onClick={() => setAddMembers(addMembers.filter(item => user.id !== item.id))}>
                                            <DynamicPngIcon iconName='deleteBucketIcon' />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='add-members-window__create-button'>
                            <button onClick={handleCreate}>Create Group</button>
                        </div>
                    </div>
                </div>
            </div>
        , document.body)
    
    )
}


export default AddMembersModelWindow
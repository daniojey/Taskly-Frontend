import { useEffect, useState, useRef, useCallback } from 'react'
import './GroupPageDetail.css'
import { useParams, useNavigate } from 'react-router'
import { api } from '../../../api.js'
import { getAccessToken } from '../../../tokens_func.js'
import ProjectCard from '../../components/ProjectCard/ProjectCard.jsx'
import AddMemberWindow from '../../components/AddMembersWindow/AddMembersWindow.js'

import DynamicPngIcon from '../../components/UI/icons/DynamicPngIcon.jsx'
import CreateProjectWindow from '../../components/CreateProjectWindow/CreateProjectWindow.js'
import DeleteWindowConfirmation from '../../components/DeleteWindowConfirmation/DeleteWindowConfirmation.js'
import { useUser } from '../../common/stores/AuthStore.jsx'

interface UserItem {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    image_profile_url: string;
    last_login: string;
}


interface GroupItem<T>{
    id: number;
    is_owner: T extends true ? {}: null;
    name: string;

}

type updateTypes = 'projects' | 'all'


function GroupPageDetail() {
    const [group, setGroup] = useState<GroupItem<UserItem> | null>(null)
    const [groupWindow, setGroupWindow] = useState(false)
    const [membersWindow, setMembersWindow] = useState(false)
    const [projects, setProjects] = useState([])
    const [members, setMembers] = useState<UserItem[]>([])

    const navigate = useNavigate()

    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

    const user  = useUser((state) => state.user)

    const { groupId  = ''} = useParams<string>()


    const getGroup = async (typed: updateTypes = 'all') => {
        switch (typed) {
            case 'all':
                try {
                    const response = await api.get(
                        `api/v1/groups/${groupId}/`,
                        {
                            headers: {
                                Authorization: getAccessToken()
                            }
                        }
                    )


                    console.log(response.data)
                    setGroup(response.data.results)
                    setProjects(response.data.results?.projects)
                    setMembers(response.data.results?.members)
                } catch (error) {
                    console.error(error)
                }
                break
            case 'projects':
                try {
                    const response = await api.get(
                        `api/v1/groups-projects/${groupId}/get_group_projects`,
                        {
                            headers: {
                                Authorization: getAccessToken()
                            }
                        }
                    )


                    console.log('RESPONSE', response)
                    setProjects(response?.data?.results)
                } catch (error) {
                    console.error(error)
                }
                break
        }
    }


    useEffect(() => {
        getGroup()
    }, [])

    const handleUpdate = useCallback((typed: updateTypes) => {
        getGroup(typed)
    }, [])


    const openGroupLogs = () => {
        navigate(`/group/${groupId}/logs/`)
    }

    return (
        <div className='base-container'>
            {groupWindow && (
                <CreateProjectWindow groupId={groupId} onClose={() => setGroupWindow(false)} onUpdate={() => handleUpdate('projects')} />
            )}

            {membersWindow && (
                <AddMemberWindow groupId={groupId} onClose={() => setMembersWindow(false)} />
            )}

            {selectedUser && (
                <DeleteWindowConfirmation
                    groupId={groupId}
                    userId={selectedUser.id}
                    username={selectedUser.username}
                    onClose={() => setSelectedUser(null)}
                    onUpdate={() => handleUpdate('all')}
                />
            )}

            <div className='group-detail__title'>
                {group ? (
                    <>
                        <h2>Group Name: {group.name}</h2>

                        {group.is_owner === true && (
                            <button onClick={() => openGroupLogs()}>Group logs</button>
                        )}
                    </>
                ) : (
                    <>
                        <h2>Not found</h2>
                    </>
                )}
            </div>

            {/* <div className='group-detail__navigation'>
                <div className='group-detail__projects-body'>
                    <h2>Projects</h2>
                    <button onClick={(e) => setGroupWindow(!groupWindow)}>New project</button>
                </div>


                <div className='group-detail__members'>
                    <h2>Members</h2>
                    <button onClick={() => setMembersWindow(true)}>+</button>
                </div>
            </div> */}

            <div className='group-detail__body'>
                <div className='group-detail__wrapper'>
                    <div className='group-detail__body_project-title'>
                        <h3>Projects</h3>
                        <p onClick={() => setGroupWindow(true)}>+</p>
                    </div>
                    <div className='group-detail__body-projects'>
                        {projects && projects.map((project, index) => (
                            <ProjectCard props={project} key={index} groupId={groupId} />
                        )

                        )}
                    </div>
                </div>
                

                <div className='group-detail__body-members'>
                    <div className='group-detail__body-members-title'>
                        <h3>Group Members</h3>
                        <p onClick={() => setMembersWindow(true)}>+</p>
                    </div>

                    {members && members.map((userItem, index) => (
                        <div className='group-detail__member-container' key={index}>

                            <div className='group-detail__member-body'>
                                {userItem.image_profile_url ? (
                                    <img src={userItem.image_profile_url} className='image-profile' />
                                ) : (
                                    <DynamicPngIcon iconName='defaultImageProfile' width={40} height={40} className='image-profile' />
                                )}
                                <div>
                                    {userItem.last_name && userItem.first_name ? (
                                        <p>{userItem.first_name} {userItem.last_name}</p>
                                    ) : (
                                        <p>{userItem.username}</p>
                                    )}
                                </div>
                            </div>

                            {group && group.is_owner === true && userItem.id !== user?.id && (
                                <div className='delete-icon-container' onClick={() => setSelectedUser(userItem)}>
                                    <DynamicPngIcon iconName='deleteBucketIcon' />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GroupPageDetail
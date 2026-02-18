import { useEffect, useState, useRef, useCallback, useContext } from 'react'
import './GroupPageDetail.css'
import { useParams, useNavigate } from 'react-router'
import { api } from '../../../api.js'
import { getAccessToken } from '../../../tokens_func.js'
import ProjectCard from '../../components/ProjectCard/ProjectCard.jsx'
import AddMemberWindow from '../../components/AddMembersWindow/AddMembersWindow.js'

import { ChevronLeft, ChevronRight, UserIcon } from 'lucide-react';
import DynamicPngIcon from '../../components/UI/icons/DynamicPngIcon.jsx'
import CreateProjectWindow from '../../components/CreateProjectWindow/CreateProjectWindow.js'
import { AuthContext } from '../../AuthContext.jsx'
import DeleteWindowConfirmation from '../../components/DeleteWindowConfirmation/DeleteWindowConfirmation.js'

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


function GroupPageDetail() {
    const [group, setGroup] = useState<GroupItem<UserItem> | null>(null)
    const [groupWindow, setGroupWindow] = useState(false)
    const [membersWindow, setMembersWindow] = useState(false)
    const [projects, setProjects] = useState([])
    const [members, setMembers] = useState<UserItem[]>([])

    const navigate = useNavigate()

    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

    const { user } = useContext(AuthContext)


    const { groupId  = ''} = useParams<string>()

    const scrollContainerRef = useRef<HTMLDivElement | null>(null)

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -400,
                behavior: 'smooth'
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            // положительное значение означает прокрутку вправо
            scrollContainerRef.current.scrollBy({
                left: 400, // прокручиваем на 200px вправо
                behavior: 'smooth' // плавная анимация прокрутки
            });
        }
    };

    const getGroup = async () => {
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
    }


    useEffect(() => {
        getGroup()
    }, [])

    const handleUpdate = useCallback(() => {
        getGroup()
    }, [])


    useEffect(() => {
        const container = scrollContainerRef.current;

        // Проверяем, что контейнер существует
        if (!container) return;

        // Функция-обработчик события wheel (колесико мыши)
        const handleWheel = (event: WheelEvent) => {

            const canScrollHorizontally = container.scrollWidth > container.clientWidth;

            const sensitivity = 2;
            const scrollAmount = event.deltaY * sensitivity;

            if (canScrollHorizontally) {
                event.preventDefault();

                container.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
        };

        container.addEventListener('wheel', (handleWheel), { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    const openGroupLogs = () => {
        navigate(`/group/${groupId}/logs/`)
    }

    return (
        <div className='base-container'>
            {groupWindow && (
                <CreateProjectWindow groupId={groupId} onClose={() => setGroupWindow(false)} onUpdate={() => handleUpdate()} />
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
                    onUpdate={() => handleUpdate()}
                />
            )}

            <div className='group-detail__title'>
                {group ? (
                    <>
                        <h2>{group.name}</h2>

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

            <div className='group-detail__navigation'>
                <div className='group-detail__projects-body'>
                    <h2>Projects</h2>
                    <button onClick={(e) => setGroupWindow(!groupWindow)}>New project</button>
                </div>

                <div className='group-detail__navigation-buttons'>
                    <button
                        onClick={scrollLeft}
                        className="scroll-button"
                        aria-label="Прокрутить влево"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        onClick={scrollRight}
                        className="scroll-button"
                        aria-label="Прокрутить вправо"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className='group-detail__members'>
                    <h2>Members</h2>
                    <button onClick={() => setMembersWindow(true)}>+</button>
                </div>
            </div>

            <div className='group-detail__body'>
                <div className='group-detail__body-projects' ref={scrollContainerRef}>
                    {projects && projects.map((project, index) => (
                        <ProjectCard props={project} key={index} groupId={groupId} />
                        // <div className='grs' key={index}>{project.title}</div>
                    )

                    )}
                </div>

                <div className='group-detail__body-members'>
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
                                    <p>{userItem.last_login}</p>
                                </div>
                            </div>

                            {group && group.is_owner === true && userItem.id !== user.id && (
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
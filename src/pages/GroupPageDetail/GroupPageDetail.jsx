import { useEffect, useState, useRef, useCallback } from 'react'
import './GroupPageDetail.css'
import { useParams, useNavigate } from 'react-router'
import { api } from '../../../api'
import { getAccessToken } from '../../../tokens_func'
import ProjectCard from '../../components/ProjectCard/ProjectCard'

import { ChevronLeft, ChevronRight } from 'lucide-react';
import DynamicPngIcon from '../../components/UI/icons/DynamicPngIcon'
import CreateProjectWindow from '../../components/CreateProjectWindow/CreateProjectWindow.jsx'


function GroupPageDetail() {
    const [group, setGroup] = useState(null)
    const [groupWindow, setGroupWindow] = useState(false)
    const [projects, setProjects] = useState([])
    const [members, setMembers] = useState([])

    console.log('MEMBERS', members)

    const { groupId } = useParams()

    const scrollContainerRef = useRef(null)

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
            setGroup(response.data.result)
            setProjects(response.data.result?.projects)
            setMembers(response.data.result?.members)
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
        const handleWheel = (event) => {

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

        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []); // пустой массив зависимостей означает, что эффект выполнится только при монтировании

    return (
        <div className='base-container'>
            {groupWindow && (
                <CreateProjectWindow groupId={groupId} onClose={() => setGroupWindow(false)} onUpdate={() => handleUpdate()} />
            )}

            <div className='group-detail__title'>
                {group ? (
                    <>
                        <h2>{group.name}</h2>
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

                <h2>Members</h2>

            </div>

            <div className='group-detail__body'>
                <div className='group-detail__body-projects' ref={scrollContainerRef}>
                    {projects && projects.map((project, index) => (
                        <ProjectCard props={project} key={index} />
                        // <div className='grs' key={index}>{project.title}</div>
                    )

                    )}
                </div>

                <div className='group-detail__body-members'>
                    {members && members.map((user, index) => (
                        <div className='group-detail__member-container' key={index}>
                            {user.image_profile_url ? (
                                <img src={user.image_profile_url} />
                            ) : (
                                <DynamicPngIcon iconName='defaultImageProfile' width={40} height={40} />
                            )}
                            <div>
                                {user.last_name && user.first_name ? (
                                    <p>{user.first_name} {user.last_name}</p>
                                ) : (
                                    <p>{user.username}</p>
                                )}
                                <p>{user.last_login}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default GroupPageDetail
import { useEffect, useState } from "react";
import { api } from "../../../api";
import '../../common/Styles/ModelWindow.css'
import './TaskSettingsComponent.css'
import { createPortal } from "react-dom";
import { useModalClose } from "../../common/hooks/closeOverlay";
import { getAccessToken } from "../../../tokens_func";
import DynamicPngIcon from "../UI/icons/DynamicPngIcon";


interface UserItem {
    id: number;
    username: string;
    is_performer: boolean;
    image_profile: string | null
}

interface TaskSettingsComponentProps {
    onClose: () => void;
    taskId: number;
    projectId: string | undefined;
    groupId: string | undefined;
}

function TaskSettingsComponent({ onClose, taskId, projectId, groupId }: TaskSettingsComponentProps) {
    const [usersData, setUsersData] = useState<UserItem[]>([])
    const {
        isClosing,
        handleCloseWindow
    } = useModalClose({ onClose: onClose, delay: 500, className: 'window-overlay'})

    const updateUsers =async (usersNewData: UserItem[] | null) => {
        if (usersNewData === null) return

        try {
            const userIds = usersNewData.filter(user => user.is_performer).map(user => user.id)

            const response =await api.post(
                `api/v1/performers/${taskId}/change_performers/?group=${groupId}`,
                {usersIds: userIds},
                {headers: {Authorization: getAccessToken()}}
            )

            return true
        } catch (error) {
            return false
        }
    }

    const changeBox = async (e: React.MouseEvent<HTMLLabelElement>, user_id: number, is_performer: boolean) => {
        const backupData = [...usersData]
        const newData = usersData.map(user => user.id === user_id ? {...user, is_performer: is_performer} : user)

        const sortingData = newData.sort((a, b) => Number(b.is_performer) - Number(a.is_performer))
        setUsersData(sortingData)

        const result = await updateUsers(newData)

        if (!result) setUsersData(backupData)
    }

    // function for buttons 
    async function setCheckedValue(action: "setPerfromers" | "unsetPerformers") {
        const backupData = [...usersData]
        let newUsersData: UserItem[] | null = null

        if (action === 'setPerfromers') {
            newUsersData = usersData.map(item => ({...item, is_performer: true}))
        } else if (action === 'unsetPerformers') {
            newUsersData = usersData.map(item => ({...item, is_performer: false}))
        }

        const result = await updateUsers(newUsersData)
        if (result) {
            newUsersData !== null ? setUsersData(newUsersData) : null
        } else {
            setUsersData(backupData)
        }
    }

    useEffect(() => {
        const getUsersData = async () => {
            try {
                const response = await api.get(
                    `api/v1/performers/${taskId}/group_performers/?group=${groupId}`,
                    {headers: {Authorization: getAccessToken()}}
                )
                console.log(response)
                setUsersData(response.data.results)
            } catch (error) {
                console.error(error)
            }
        }

        getUsersData()
    },[])

    return (
        createPortal(
            <div 
            className={`window-overlay ${isClosing ? 'close': 'open'}`}
            style={{ zIndex: 1100 }}
            onClick={handleCloseWindow}>
                <div className="window-body">
                    <div className="task-performers-title">
                        <h2>Performers</h2>
                    </div>

                    <div className="performers-body">
                        {usersData.length > 0 && usersData.map((user, index) => (
                            <div 
                            style={{ animationDelay: `${0.2 * index}s`}}
                            className={`user-item-card ${user.is_performer ? 'active' : ''}`} 
                            key={user.id}
                            >
                                <p>{user.username}</p>

                                {user.image_profile ? (
                                    <img src={user.image_profile} className='image-profile' />
                                ) : (
                                    <DynamicPngIcon iconName='defaultImageProfile' width={40} height={40} className='image-profile' />
                                )}


                                <div className={`holy_checkbox ${user.is_performer ? 'active' : ''}`} >
                                    <input
                                        id="cb-1"
                                        type="checkbox"
                                        checked={user.is_performer}
                                        onChange={() => { }}
                                    />
                                    <label htmlFor="cb-1"
                                        onClick={(e) => changeBox(e, user.id, !user.is_performer)}
                                    ></label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="task-performers-buttons">
                        <button onClick={() => setCheckedValue("setPerfromers")}>select all</button>
                        <button onClick={() => setCheckedValue("unsetPerformers")}>unselect all</button>
                    </div>
                </div>
            </div>
        , document.body)
    )
}

export default TaskSettingsComponent
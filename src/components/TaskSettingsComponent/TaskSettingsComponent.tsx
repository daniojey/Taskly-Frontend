import { useEffect, useState } from "react";
import { api } from "../../../api";
import '../../common/Styles/ModelWindow.css'
import './TaskSettingsComponent.css'
import { createPortal } from "react-dom";
import { useModalClose } from "../../common/hooks/closeOverlay";
import { getAccessToken } from "../../../tokens_func";


interface UserItem {
    id: number;
    username: string;
    is_performer: boolean;
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

    const updateUsers =async (usersNewData: UserItem[]) => {
        try {
            const userIds = usersNewData.filter(user => user.is_performer).map(user => user.id)

            const response =await api.post(
                `api/v1/performers/${taskId}/change_performers/?group=${groupId}`,
                {usersIds: userIds},
                {headers: {Authorization: getAccessToken()}}
            )

            console.log(response)
        } catch (error) {
            console.error(error)
        }
    }

    const changeBox = async (e: React.ChangeEvent<HTMLInputElement>, user_id: number, is_performer: boolean) => {
        e.target.checked = is_performer

        const newData = usersData.map(user => user.id === user_id ? {...user, is_performer: is_performer} : user)
        console.log(newData)
        setUsersData(newData)
        await updateUsers(newData)
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

        return () => {
            const getUsersData = null
        }
    },[])

    return (
        createPortal(
            <div 
            className={`window-overlay ${isClosing ? 'close': 'open'}`}
            style={{ zIndex: 1100 }}
            onClick={handleCloseWindow}>
                <div className="window-body">
                    <h2>Settings</h2>
                    <div className="performers-body">
                        {usersData.length > 0 && usersData.map(item => (
                            <div className="user-item-card">
                                <p>{item.username}</p>

                                <input 
                                type="checkbox"
                                checked={item.is_performer}
                                onChange={(e => changeBox(e, item.id, e.target.checked))}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        , document.body)
    )
}

export default TaskSettingsComponent
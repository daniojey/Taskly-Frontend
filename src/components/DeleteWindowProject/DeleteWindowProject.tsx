import { useNavigate } from 'react-router'
import './DeleteWindowProject.css'
import { api } from '../../../api'
import { getAccessToken } from '../../../tokens_func'

interface DeleteWindowProjectProps {
    projectId: string | undefined;
    onClose: () => void;
}

function DeleteWindowProject({ projectId, onClose}: DeleteWindowProjectProps) {
    const navigate = useNavigate()


    const projectDelete = async (projectId: string | undefined) => {
        try {
            const response = await api.delete(`api/v1/groups-projects/${projectId}/`,
                {headers: {
                    Authorization: getAccessToken()
                }}
            )

            navigate('/groups/')
        } catch (error) {
            return false
        }
    }

    return (
        <div className='delete-window'>
            <h2>You realy want to delete ?</h2>
            <div className='delete-window__body'>
                <button id='cancel' onClick={onClose}>Cancel</button>
                <button id='delete' onClick={() => projectDelete(projectId)}>Delete</button>
            </div>
        </div>
    )   
}


export default DeleteWindowProject
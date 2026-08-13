import { useNavigate } from 'react-router'
import './DeleteWindowProject.css'
import { api } from '../../../api'
import { getAccessToken } from '../../../tokens_func'
import DeleteWindow from '../DeleteWindow/DeleteWindow'

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

    const data = {
        onClose: () => onClose(),
        onDelete: () => projectDelete(projectId)
    }

    return (
        <DeleteWindow data={data}/>
    )   
}


export default DeleteWindowProject
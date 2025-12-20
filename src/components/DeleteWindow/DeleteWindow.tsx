import { api } from '../../../api'
import { getAccessToken } from '../../../tokens_func'
import { useQueryClient } from '@tanstack/react-query';
import './DeleteWindow.css'

interface DeleteWindowProps {
    data: any;
    onClose: () => void;
    onCloseWindow: () => void;
}

function DeleteWindow({ data, onClose, onCloseWindow }: DeleteWindowProps) {
    const queryClient = useQueryClient();

    const deleteTask = async () => {
        try{
            const response = await api.delete(`api/v1/tasks/${data.id}/`,
                {headers: {
                    Authorization: getAccessToken()
                }}
            )

            console.log('TASK DELETE', response)
            console.log(await queryClient.invalidateQueries({ queryKey: ['updateTasks'] }));
            onClose()
            onCloseWindow()
        } catch (error) {
            console.error(error)
        }
        
    }


    return (
        <div className='delete-window'>
            <h2>You realy want to delete ?</h2>
            <div className='delete-window__body'>
                <button id='cancel' onClick={onClose}>Cancel</button>
                <button id='delete' onClick={deleteTask}>Delete</button>
            </div>
        </div>
    )
}

export default DeleteWindow
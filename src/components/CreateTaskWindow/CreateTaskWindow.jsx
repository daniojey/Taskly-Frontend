import './CreateTaskWindow.css'
import { useForm } from 'react-hook-form'
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup'
import { useContext, useState } from 'react';
import { AuthContext} from '../../AuthContext'
import { api } from '../../../api';
import { getAccessToken } from '../../../tokens_func';


function CreateTaskWindow({ onClose, onUpdate, projectId }) {
    const { user } = useContext(AuthContext)
    const [close, setClose] = useState(false)

    const schema = yup.object({
        name: yup.string().min(3).max(30).required(),
        description: yup.string().min(0).max(500),
        status: yup.string().test(
            'testbase',
            (value, context) => {
                console.log(value)
                console.log(context)

                return value
            }
        )

    })

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    })


    const CloseWindow = () => {
        setClose(true)

        setTimeout(() => {
            onClose()
            console.log(close)
        }, 400)
    }



    const submitForm = async (data) => {
        // e.preventDefault()
        console.log(user)
        console.log('form NOt fetch', data)
        data = {
            ...data,
            project_id: projectId,
            created_by: user.id
        }

        console.log('UPDATED data', data)
        
        const createTask = async (data) => {
            try {
                const response = await api.post(
                    `api/v1/projects/${projectId}/tasks/`,
                    {...data},
                    {headers: {
                        Authorization: getAccessToken()
                    }}
                )

                console.log("RESPONSE",response)
                CloseWindow()
                onUpdate()
            } catch (error) {
                console.error(error)
            }
        }


        createTask(data)
    }



    const clickOverlay = (e) => {

        console.log(e.target.className)

        if (e.target.className.includes('create-task-overlay')) {
            CloseWindow()
        }
    }


    return (
        <div className={`create-task-overlay ${close ? "close" : 'open'}`} onClick={clickOverlay}>
            <div className='create-task__body'>
                <div className='create-task__title'>
                    <h2>Create Task</h2>
                    <label onClick={CloseWindow}>x</label>
                </div>
                <form onSubmit={handleSubmit(submitForm)} className='create-task__form'>
                    <input 
                    className='neomorphism-input' 
                    type="text" 
                    id="name" 
                    name='name' 
                    placeholder='task name' 
                    {...register('name')}
                    />

                    <textarea 
                    id='description'
                    name='description'
                    className='neomorphism-input'  
                    placeholder='description' 
                    {...register('description')}
                    ></textarea>
                    
                    <label htmlFor="status">Status</label>
                    <select name="status" className='neomorphism-input' defaultValue="NS" id="status" {...register('status')}>
                        <option value="NS">No status</option>
                        <option value="BS">Base status</option>
                        <option value="US">Urgent status</option>
                    </select>

                    <label htmlFor="deadline">Deadline</label>
                    <input
                    className='neomorphism-input'  
                    type="datetime-local" 
                    onFocus={(e) => e.target.showPicker()} 
                    name='deadline' 
                    id='deadline' 
                    {...register('deadline')}/>
                    <button type='submit'>Create Task</button>
                </form>
            </div>
        </div>
    )
}


export default CreateTaskWindow
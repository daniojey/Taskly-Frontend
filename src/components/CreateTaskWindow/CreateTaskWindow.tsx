import './CreateTaskWindow.css'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup'
import { useContext, useState } from 'react';
import { AuthContext} from '../../AuthContext'
import { api } from '../../../api';
import { getAccessToken } from '../../../tokens_func';

interface CreateTaskWindowProps {
    onClose: () => void;
    onUpdate: () => void;
    projectId: number;
}

type TaskStatus = 'NS' | 'BS'| 'US'

interface YupFormData {
    name: string;
    description?: string;
    status: TaskStatus;
    deadline: string;
}

interface FormData extends YupFormData {
    project_id: number;
    created_by: number;
}


function CreateTaskWindow({ onClose, onUpdate, projectId }: CreateTaskWindowProps) {
    const { user } = useContext(AuthContext)
    const [close, setClose] = useState<boolean>(false)

    const schema = yup.object({
        name: yup.string().min(3).max(30).required(),
        description: yup.string().min(0).max(500),
        status: yup.mixed<TaskStatus>().oneOf(['NS', 'BS', 'US'] as const).defined(),
        deadline: yup.string().required(),
    })

    type TaskData = yup.InferType<typeof schema>

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TaskData>({
        resolver: yupResolver(schema) as Resolver<TaskData>,
        defaultValues: {
            description: '',
            status: 'NS'
        }
    })


    const CloseWindow = () => {
        setClose(true)

        setTimeout(() => {
            onClose()
            console.log(close)
        }, 400)
    }



    const submitForm: SubmitHandler<YupFormData> = async (data) => {
        // e.preventDefault()
        console.log(user)
        console.log('form NOt fetch', data)
        const formData: FormData = {
            ...data,
            project_id: projectId,
            created_by: user.id
        }

        console.log('UPDATED data', data)
        
        const createTask = async (formData: FormData) => {
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


        createTask(formData)
    }



    const clickOverlay = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement

        console.log(target.className)

        if (target.className.includes('create-task-overlay')) {
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
                    placeholder='task name' 
                    {...register('name')}
                    />

                    <textarea 
                    id='description'
                    className='neomorphism-input'  
                    placeholder='description' 
                    {...register('description')}
                    ></textarea>
                    
                    <label htmlFor="status">Status</label>
                    <select className='neomorphism-input' defaultValue="NS" id="status" {...register('status')}>
                        <option value="NS">No status</option>
                        <option value="BS">Base status</option>
                        <option value="US">Urgent status</option>
                    </select>

                    <label htmlFor="deadline">Deadline</label>
                    <input
                    className='neomorphism-input'  
                    type="datetime-local" 
                    onFocus={(e) => e.target.showPicker()} 
                    id='deadline' 
                    {...register('deadline')}/>
                    <button type='submit'>Create Task</button>
                </form>
            </div>
        </div>
    )
}


export default CreateTaskWindow
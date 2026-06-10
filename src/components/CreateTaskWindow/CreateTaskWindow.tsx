import './CreateTaskWindow.css'
import '../../common/Styles/ModelWindow.css'
import '../../index.css'
import { Resolver, SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup'
import { useContext} from 'react';
import { AuthContext} from '../../AuthContext'
import { useModalClose } from '../../common/hooks/closeOverlay';
import { createTask } from './common/create_task';
import { useNotify } from '../../common/stores/NotifyStore';

interface CreateTaskWindowProps {
    onClose: () => void;
    onUpdate: () => void;
    projectId: string | undefined;
}

type TaskStatus = 'NS' | 'BS'| 'US'

interface YupFormData {
    name: string;
    description?: string;
    status: TaskStatus;
    deadline: string;
}

interface FormData extends YupFormData {
    project_id: string | undefined;
    created_by: number;
}


function CreateTaskWindow({ onClose, onUpdate, projectId }: CreateTaskWindowProps) {
    const { user } = useContext(AuthContext)
    const { addNotify } = useNotify()
    const { isClosing, handleCloseWindow, closeWindow} = useModalClose({ onClose: onClose, delay: 400, className: 'window-overlay'})

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


    const submitForm: SubmitHandler<YupFormData> = async (data) => {
        const formData: FormData = {
            ...data,
            project_id: projectId,
            created_by: user.id
        }
        
        const result = await createTask(formData, projectId, { closeWindow: closeWindow, onUpdate: onUpdate})

        if (result instanceof Error) {
            addNotify(result.message, 'error')
        }
    }



    return (
        <div 
            className={`window-overlay ${isClosing ? "close" : 'open'}`} 
            onClick={handleCloseWindow}
        >
            <div className='window-body'
                style={{ maxHeight: '450px', minHeight: '250px'}}>
                <div className='create-task__title'>
                    <h2>Create Task</h2>
                    <label onClick={closeWindow}>+</label>
                </div>
                <form onSubmit={handleSubmit(submitForm)} className='create-task__form'>
                    <div className='create-task__form-first'>
                        <label htmlFor="name">Task Name</label>
                        <input 
                        className='holy_input' 
                        type="text" 
                        id="name" 
                        placeholder='task name' 
                        {...register('name')}
                        />

                        <label htmlFor="description">Task Description</label>
                        <textarea 
                        style={{ resize: 'none'}}
                        id='description'
                        className='holy_input'  
                        placeholder='description' 
                        {...register('description')}
                        ></textarea>
                    </div>
                    
                    <div className='create-task__form-second'>
                        <label htmlFor="status">Status</label>
                        <select className='holy_select' defaultValue="NS" id="status" {...register('status')}>
                            <option value="NS">No status</option>
                            <option value="BS">Base status</option>
                            <option value="US">Urgent status</option>
                        </select>

                        <label htmlFor="deadline">Deadline</label>
                        <input
                        className='holy_select'  
                        type="datetime-local" 
                        onFocus={(e) => e.target.showPicker()} 
                        id='deadline' 
                        {...register('deadline')}/>
                    </div>
                    
                    <button type='submit'>Create Task</button>
                </form>
            </div>
        </div>
    )
}


export default CreateTaskWindow
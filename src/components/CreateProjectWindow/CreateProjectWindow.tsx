import { createPortal } from 'react-dom'
import './CreateProjectWindow.css'
import '../CreateTaskWindow/CreateTaskWindow.css'
import { useContext, useState } from 'react'
import * as yup from 'yup'
import { useForm, SubmitHandler, Resolver } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { api } from '../../../api'
import { getAccessToken } from '../../../tokens_func'
import { AuthContext } from '../../AuthContext'

interface CreateProjectWindowProps {
    groupId: string;
    onClose: () => void;
    onUpdate: () => void;
}



function CreateProjectWindow({ groupId, onClose, onUpdate }: CreateProjectWindowProps) {
    const [close, setClose] = useState<boolean>(false)
    const { user } = useContext(AuthContext)

    const schema = yup.object({
        title: yup.string().min(4),
        description: yup.string().max(400)
    })

    type ProjectData = yup.InferType<typeof schema>

    interface FormData extends ProjectData {
        group: string;
        owner: number;
    }

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<ProjectData>({
        resolver: yupResolver(schema) as Resolver<ProjectData>,
        defaultValues: {
            title: '',
            description: ''
        }
    })

    // const formSubmit

    console.log('ID группы', groupId)

    const CloseWindow = () => {
        setClose(true)

        setTimeout(() => {
            onClose()
            console.log(close)
        }, 400)
    }

    const clickOverlay = (e: React.MouseEvent<HTMLElement>) => {
        
        const target = e.target as HTMLElement


        if (target.className.includes('create-task-overlay')) {
            CloseWindow()
        }
    }


    const handleForm: SubmitHandler<ProjectData> = async (data) => {
        console.log(data)

        const apiData: FormData = {
            ...data,
            group: groupId,
            owner: user.id
        }

        const createProject = async (apiData: FormData) => {
            try {
                const response = await api.post(
                    'api/v1/groups-projects/',
                    {...apiData},
                    {headers: {
                        Authorization: getAccessToken()
                    }}
                )

                console.log(response)
                console.log(response.status)

                if (response.status === 201) {
                    onUpdate()
                    CloseWindow()
                }
                
                
            } catch (error) {
                console.error(error)
            }
        }


        createProject(apiData)
    }

    return (
        createPortal(
            <div className={`create-task-overlay ${close ? "close" : 'open'}`} onClick={clickOverlay}>
                <div className='create-task__body'>
                    <div className='create-task__title'>
                        <h2>Create Project</h2>
                        <label onClick={CloseWindow}>x</label>
                    </div>
                    <form className='create-task__form' onSubmit={handleSubmit(handleForm)}>
                        <input 
                        className='neomorphism-input'
                        type="text" 
                        id='title' 
                        placeholder='title'
                        { ...register('title')}
                        />

                        <textarea 
                        className='neomorphism-input'
                        id="description" 
                        placeholder='description'
                        {...register('description')}
                        ></textarea>

                        <button type='submit'>Create</button>
                    </form>
                </div>
            </div>,
            document.body
        )
    )
}

export default CreateProjectWindow
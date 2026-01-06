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
import { useModalClose } from '../../common/hooks/closeOverlay'

interface CreateProjectWindowProps {
    groupId: string;
    onClose: () => void;
    onUpdate: () => void;
}



function CreateProjectWindow({ groupId, onClose, onUpdate }: CreateProjectWindowProps) {
    const { user } = useContext(AuthContext)
    const { 
        handleCloseWindow,
        closeWindow, 
        isClosing 
    } = useModalClose({ onClose: onClose, delay: 400, className: "create-task-overlay"})

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
                    closeWindow()
                }
                
                
            } catch (error) {
                console.error(error)
            }
        }


        createProject(apiData)
    }

    return (
        createPortal(
            <div className={`create-task-overlay ${isClosing ? "close" : 'open'}`} onClick={handleCloseWindow}>
                <div className='create-task__body'>
                    <div className='create-task__title'>
                        <h2>Create Project</h2>
                        <label onClick={closeWindow}>x</label>
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
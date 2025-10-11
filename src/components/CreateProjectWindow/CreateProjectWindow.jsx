import { createPortal } from 'react-dom'
import './CreateProjectWindow.css'
import '../CreateTaskWindow/CreateTaskWindow.css'
import { useState } from 'react'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { api } from '../../../api'
import { getAccessToken } from '../../../tokens_func'



function CreateProjectWindow({ groupId, onClose, onUpdate }) {
    const [close, setClose] = useState(false)

    const schema = yup.object({
        title: yup.string().min(4),
        description: yup.string().max(400)
    })

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
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

    const clickOverlay = (e) => {

        if (e.target.className.includes('create-task-overlay')) {
            CloseWindow()
        }
    }


    const handleForm = async (data) => {
        console.log(data)

        data = {
            ...data,
            group: groupId
        }

        const createProject = async (data) => {
            try {
                const response = await api.post(
                    'api/v1/groups-projects/',
                    {...data},
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


        createProject(data)
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
                        name='title' 
                        id='title' 
                        placeholder='title'
                        { ...register('title')}
                        />

                        <textarea 
                        className='neomorphism-input'
                        name="description" 
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
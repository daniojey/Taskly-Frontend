import { useModalClose } from "../../common/hooks/closeOverlay"
import "./CreateSubTask.css"
import { CreateSubTaskProps } from "./types"
import * as yup from "yup"
import { useForm, SubmitHandler, Resolver } from 'react-hook-form'
import { yupResolver } from "@hookform/resolvers/yup"
import { createPortal } from "react-dom"
import { useState } from "react"
import { useApi } from "../../common/api_query"
import { useNotify } from "../../common/stores/NotifyStore"
import { SubTaskItem } from "../SubTasksComponent/TypesSubTasks"


function CreateSubTask({onClose, taskId, onUpdate} : CreateSubTaskProps) {
    const { addNotify } = useNotify()
    const [ loading, setLoading] = useState<boolean>(false)
    const { isClosing, handleCloseWindow, closeWindow } = useModalClose({onClose: onClose, delay: 400, className: 'window-overlay'})

    const schema = yup.object({
        title: yup.string().min(4),
        description: yup.string().max(500)
    })

    type SubTaskData = yup.InferType<typeof schema>

    interface FormData extends SubTaskData {
        task: number;
    }

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm<SubTaskData>({
        resolver: yupResolver(schema) as Resolver<SubTaskData>,
        defaultValues: {
            title: '',
            description: ''
        }
    })

    const handleForm: SubmitHandler<SubTaskData> = async (data) => {
        const apiData: FormData = {
            ...data,
            task: taskId
        }

        const result = await useApi<SubTaskItem>(
            "api/v1/subtasks/",
            "post",
            apiData
        )

        if (result["success"]) {
            onUpdate(result['data'])
        } else {
            addNotify("Server return error when processing", "error")
        }
    }


    return (
        createPortal(
            <div 
            className={`window-overlay ${isClosing ? 'close' : 'open'}`}
            style={{
                zIndex: 99999
            }}
            onClick={handleCloseWindow}>
                <div className="window-body" style={{
                    maxWidth: '400px',
                    maxHeight: '350px',
                    minHeight: '350px',
                }}>
                    <div
                    className="subtask-create__title">
                        <h2>Create Subtask</h2>
                    </div>

                    <form className="subtask-create__form-body" onSubmit={handleSubmit(handleForm)}>
                        <div>
                            <input 
                            className='holy_input'
                            style={{
                                maxWidth: '100%'
                            }}
                            type="text" 
                            {...register("title")}
                            placeholder='title'
                            />
                        </div>

                        <div>
                            <textarea
                            className='holy_input' 
                            placeholder='description'
                            style={{ maxWidth: '100%', maxHeight: '100px', height: '100px', resize: "none"}}
                            {...register('description')}
                            />
                        </div>

                        <div
                        className="subtask-create__button-body">
                            <button 
                            id={`${loading ? 'subtask-create-button' : ''}`}
                            type="submit">
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        , document.body)
        
    )
}


export default CreateSubTask
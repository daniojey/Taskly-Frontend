import { useEffect, useState } from 'react'
import './DetailTaskWindow.css'
import { createPortal } from 'react-dom'
import DeleteWindow from '../DeleteWindow/DeleteWindow'
import { api } from '../../../api'
import { getAccessToken } from '../../../tokens_func'



function DetailTaskWindow({ data, onClose }) {
    const [close, setClose] = useState(false)
    const [deleteWindow, setDeleteWindow] = useState(false)
    const [taskStatuses, setTaskStatuses] = useState([])
    const [taskData, setTaskData] = useState(data);

    // console.log(data)

    const statusMap = {
        US: 'Urgent status',
        BS: 'Base status',
        NS: 'No status'
    }


    const {
        create_at,
        deadline,
        description,
        group,
        id,
        name,
        project_name,
        status,
        username,
    } = taskData


    useEffect(() => {
        const getTaskInfo = async () => {
            try {
                const response = await api.get(`api/v1/tasks/${id}`,
                    {headers: {
                        Authorization: getAccessToken()
                    }}
                )

                 setTaskData(response.data.result);
            } catch (error) {
                console.error(error)
            }
        }

        getTaskInfo()
    }, [])


    const CloseWindow = () => {
        setClose(true)

        setTimeout(() => {
            onClose()
            console.log(close)
        }, 400)
    }

    const closeOverlay = (e) => {

        if (e.target.className.includes('task-detail__overlay')) {
            CloseWindow()
        } else if (e.target.className.includes('task-detail__opacity-filter') && deleteWindow) {
            setDeleteWindow()
        }
    }
    

    return (
        createPortal(
            <div className={`task-detail__overlay ${close ? 'close' : 'open'}`} onClick={closeOverlay}>
                {deleteWindow && (
                    <DeleteWindow data={data} onClose={() => setDeleteWindow(false)} onCloseWindow={onClose}/>
                )}



                <div className={`task-detail__body ${deleteWindow ? 'hide' : ''}`}>
                    <div className={`task-detail__opacity-filter ${deleteWindow ? 'show' : ''}`}></div>

                    <div className='task-detail__body-sides'>
                        <div className='task-detail__info'>
                            <h2>{data?.name}</h2>
                            <label>Description:</label>
                            <p>{description}</p>
                            <label>Create at:</label>
                            <p>{create_at}</p>
                            <label>Status now:</label>
                            <p>{statusMap[status]}</p>
                            <label>Deadline:</label>
                            <p>{deadline}</p>
                        </div>

                        <div className='task-detail__update'>
                            <h2>Status</h2>
                            {taskStatuses.length !== 0 ? taskStatuses.map((item, index) => (
                                <div>{item}</div>
                            )) : (
                                <h2>No updated status</h2>
                            )}
                        </div>
                    </div>

                    <div className='task-detail__button-container'>
                            <button id='more'>More</button>

                            <button id='delete' onClick={(e) => setDeleteWindow(!deleteWindow)}>Delete Task</button>
                    </div>
                </div>
            </div>,
            document.body
        )
    )
}


export default DetailTaskWindow
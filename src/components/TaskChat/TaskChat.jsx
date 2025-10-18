import { createPortal } from "react-dom"
import { useState, useEffect } from "react"

function TaskChat({ data, onClose }) {
    const [close, setClose] = useState(false)
    const [messages, setMessages] = useState([])
    const [taskData, setTaskData] = useState(data);

    const token = localStorage.getItem('accessToken')

    const webSocketConnection = new WebSocket(
        'ws://'
        + 'localhost:8000'
        + `/ws/chat/${taskData.id}`
        + `/?token=${token}`
    )

    useEffect(
        () => {
            const onOpen = () => console.log("Opened");
            const onError = () => console.log("Error");
            const onMessage = (e) => {
                console.log('EDATA', JSON.parse(e.data)?.message)
            }

            webSocketConnection.addEventListener("open", onOpen);
            webSocketConnection.addEventListener('message', onMessage)
            webSocketConnection.addEventListener("error", onError);

            return () => {
                webSocketConnection.removeEventListener("open", onOpen);
                webSocketConnection.removeEventListener("error", onError);

                webSocketConnection.close();

                // In case it hasn't been established yet before trying to close
                webSocketConnection.addEventListener(
                    "open",
                    event => event.currentTarget.close()
                );
            };
        },
        [webSocketConnection]
    );

    const CloseWindow = () => {
        setClose(true)

        setTimeout(() => {
            onClose()
            console.log(close)
        }, 400)
    }

    const closeOverlay = (e) => {

        if (e.target.className.includes('create-task-overlay ')) {
            CloseWindow()
        } else if (e.target.className.includes('task-detail__opacity-filter') && deleteWindow) {
            setDeleteWindow()
        }
    }

    const change = () => {
        webSocketConnection.send(JSON.stringify({'message': 'BOBIK'}))
    }

    return (
        createPortal(
            <div className={`create-task-overlay ${close ? "close" : 'open'}`} onClick={closeOverlay}>
                <div className='create-task__body'>
                    <div className='create-task__title'>
                        <h2>Chat</h2>
                        <input type="text" onChange={change}/>
                    </div>
                </div>
            </div>,
            document.body
        )

    )
}


export default TaskChat
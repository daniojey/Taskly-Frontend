import { createPortal } from "react-dom"
import { useState, useEffect, useCallback } from "react"
import { useContext } from "react"
import { AuthContext } from '../../AuthContext'
import { useRef } from "react"
import './TaskChat.css'
import DynamicSvgIcon from "../UI/icons/DynamicSvgIcon"
import { api } from "../../../api"

function TaskChat({ data, onClose }) {
    const { user } = useContext(AuthContext)

    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
    }

    const [close, setClose] = useState(false)
    const [messages, setMessages] = useState([])
    const [taskData, setTaskData] = useState(data);
    const [messageValue , setMessageValue] = useState(null)
    const webSocketRef = useRef(null)

    const messagesEndRef = useRef(null) 
    const messagesStartRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const textInputRef = useRef(null)

    const token = localStorage.getItem('accessToken')

    useEffect( () => {
        // Прокручиваем в самый низ страничку
        const getMessages = async () => {
            try {
                const response =await api.get(`api/v1/chat-messages/${taskData.id}`)
                setMessages(response.data.results)
            } catch (error) {
                console.error(error)
            }
        }
        
        getMessages()
    }, [])


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])


    const callbackFunc = useCallback((entries) => {
        const [ entry ] = entries
        console.log('entry', entry.isIntersecting)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(callbackFunc, {
            root: messagesContainerRef.current, // root - контейнер со скроллом
            threshold: 0.1,
        });

        if (messagesStartRef.current) {
            observer.observe(messagesStartRef.current);
        }

        return () => {
            if (messagesStartRef.current) {
                observer.unobserve(messagesStartRef.current);
            }
        };
    }, [callbackFunc]);

    useEffect(
        () => {
            const webSocketConnection = new WebSocket(
                'ws://'
                + 'localhost:8000'
                + `/ws/chat/${taskData.id}`
                + `/?token=${token}`
            )

            const onOpen = () => console.log("Opened");
            const onError = () => console.log("Error");
            const onMessage = (e) => {
                console.log('EDATA', JSON.parse(e.data))
                const data = JSON.parse(e.data)
                setMessages((messages => [...messages, data]))
                // textRef.current.textContent =  textRef.current.textContent + JSON.parse(e.data)?.message + '\n'
            }

            webSocketConnection.addEventListener("open", onOpen);
            webSocketConnection.addEventListener('message', onMessage)
            webSocketConnection.addEventListener("error", onError);

            webSocketRef.current = webSocketConnection

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
        [token, taskData.id]
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

    const change = (e) => {
        e.preventDefault()
        if (webSocketRef.current && webSocketRef.current.readyState == WebSocket.OPEN) {
            webSocketRef.current.send(JSON.stringify({'message': messageValue, 'taskID': taskData.id}))
            textInputRef.current.value = ''
        }
    }


    return (
        createPortal(
            <div className={`create-task-overlay ${close ? "close" : 'open'}`} onClick={closeOverlay}>
                <div className='chat-task__body'>
                    <div className='task-chat__title'>
                        <h2>{taskData?.name}</h2>
                    </div>

                    <div className="task-chat__field" ref={messagesContainerRef}>
                        <div ref={messagesStartRef}></div>
                        {messages.length > 0 && messages.map((item, index) => (
                            <div className={`task-chat__message-body ${item?.user?.id === user.id ? 'user' : ''}`} key={index}>
                                <p className="task-chat__message-username">{item?.user?.id !== user.id ? item?.user?.username : ''}</p>
                                <p className={`task-chat__message ${item?.user?.id ? 'user' : ''}`}>{item?.message}</p>
                            </div>
                        ))}
                        <div ref={messagesEndRef}/>
                    </div>

                        <form className="task-chat__form" onSubmit={change} >
                            <input ref={textInputRef} className="task-chat__input" type="text" onChange={(e) => setMessageValue(e.target.value)}/>
                            {/* <button type="submit">send</button> */}
                            <DynamicSvgIcon size={28} className="sendIcon" color="#ffffffff" onClick={change}>
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </DynamicSvgIcon>
                        </form>
                </div>
            </div>,
            document.body
        )

    )
}


export default TaskChat
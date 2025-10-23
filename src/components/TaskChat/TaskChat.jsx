import { createPortal } from "react-dom"
import { useState, useEffect, useCallback, useReducer } from "react"
import { useContext } from "react"
import { AuthContext } from '../../AuthContext'
import { useRef } from "react"
import './TaskChat.css'
import DynamicSvgIcon from "../UI/icons/DynamicSvgIcon"
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"


async function loadMoreMessages(nextUrl) {

    try {
        const response = await api.get(
            nextUrl.replace(import.meta.env.VITE_REACT_APP_API_BASE_URL, ''),
            {
                headers: {
                    Authorization: getAccessToken()
                }
            }
        )

        console.log(response.data)
        return response.data  // ← Возвращаем data, а не response
    } catch (error) {
        console.error('Error loading more messages:', error)
        return null  // ← Явно возвращаем null в случае ошибки
    }

}

const initialState = {
    messages: [],
    nextPage: null,
    loading: true,
    isHistoryLoading: false,
    error: null
};

function messageReduce(state, action) {
    switch (action.type) {
        case "SET_MESSAGE_RESPONSE":
            return {
                ...state,
                messages: action.payload.results.reverse(),
                nextPage: action.payload.next,
            }

        case "START_LOADING":
            return { ...state, loading: true }

        case "END_LOADING":
            return { ...state, loading: false }

        case "UPDATE_MESSAGES":
            return { ...state, messages: [...state.messages, action.payload] }

        case "LOAD_MORE_MESSAGES":
            console.log('Загрузка дополнительных сообщений', action.payload.results)
            return {
                ...state,
                messages: [...action.payload.results.reverse() , ...state.messages],
                nextPage: action.payload.next,
                loading: false,
                isHistoryLoading: true
            }

         case "RESET_HISTORY_LOADING_FLAG":
            return {
                ...state,
                isHistoryLoading: false
            }
    }
}

function TaskChat({ data, onClose }) {
    const { user } = useContext(AuthContext)

    const [close, setClose] = useState(false)
    const [taskData, setTaskData] = useState(data);
    const [messageText, setMessageText] = useState(null)
    const [state, dispatch] = useReducer(messageReduce, initialState)

    const webSocketRef = useRef(null)

    const messagesEndRef = useRef(null)
    const messagesStartRef = useRef(null)
    const messagesContainerRef = useRef(null)

    const textInputRef = useRef(null)
    const loadingRef = useRef(false)
    const nextPageRef = useRef(null)
    const scrollPositionRef = useRef(0)

    const token = localStorage.getItem('accessToken')


    // Сохраняем позицию скролла перед загрузкой новых сообщений
    const saveScrollPosition = () => {
        if (messagesContainerRef.current) {
            scrollPositionRef.current = messagesContainerRef.current.scrollHeight - messagesContainerRef.current.scrollTop + 20;
        }
    }

    // Восстанавливаем позицию скролла после обновления сообщений
    const restoreScrollPosition = () => {
        if (messagesContainerRef.current && scrollPositionRef.current > 0) {
            const newScrollTop = messagesContainerRef.current.scrollHeight - scrollPositionRef.current;
            messagesContainerRef.current.scrollTop = newScrollTop;
        }
    }

    useEffect(() => {
        if (state.isHistoryLoading) {
            // Восстанавливаем позицию после подгрузки истории
            restoreScrollPosition();
            dispatch({ type: 'RESET_HISTORY_LOADING_FLAG' });
        }
    }, [state.messages, state.isHistoryLoading]); // Срабатывает при изменении messages


    useEffect(() => {
        dispatch({ type: 'START_LOADING' })
        // Прокручиваем в самый низ страничку
        loadingRef.current = true

        console.log('LOADING', loadingRef)
        const getMessages = async () => {
            try {
                const response = await api.get(`api/v1/chat-messages/${taskData.id}/`)
                console.log('RESPONSE ', response)
                // setMessages(response.data.results.reverse())
                dispatch({ type: "SET_MESSAGE_RESPONSE", payload: response.data })
                nextPageRef.current = response.data.next
            } catch (error) {
                console.error(error)
            }
        }

        getMessages()

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
        }, 300)

        setTimeout(() => {
            loadingRef.current = false
        }, 400)
    }, [])



    const callbackFunc = useCallback(async (entries) => {
        const [entry] = entries

        console.log(loadingRef)

        const container = messagesContainerRef.current
        const hasScroll = container && container.scrollHeight > container.clientHeight


         if (loadingRef.current === false && hasScroll && nextPageRef.current) {
            console.log(entry.isIntersecting)

            saveScrollPosition();

            const result = await loadMoreMessages(nextPageRef.current)
            console.log(result)
            
            if (result) {
                dispatch({ type: 'LOAD_MORE_MESSAGES', payload: result })
                nextPageRef.current = result?.next
            } else {
                console.error(result)
            }
        }

    }, [])


    useEffect(() => {
        const observer = new IntersectionObserver(callbackFunc, {
            root: messagesContainerRef.current,
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
                // setMessages(messages => [...messages, data])
                dispatch({ type: 'UPDATE_MESSAGES', payload: data })
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
            webSocketRef.current.send(JSON.stringify({ 'message': messageText, 'taskID': taskData.id }))
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
                        {state.messages.length > 0 && state.messages.map((item, index) => (
                            <div className={`task-chat__message-body ${item?.user?.id === user.id ? 'user' : ''}`} key={index}>
                                <p className="task-chat__message-username">{item?.user?.id !== user.id ? item?.user?.username : ''}</p>
                                <p className={`task-chat__message ${item?.user?.id ? 'user' : ''}`}>{item?.message}</p>
                            </div>
                        ))}
                        <div ref={messagesEndRef}/>
                    </div>

                    <form className="task-chat__form" onSubmit={change} >
                        <input ref={textInputRef} className="task-chat__input" type="text" onChange={(e) => setMessageText(e.target.value)} />
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
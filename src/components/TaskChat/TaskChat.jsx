import { createPortal } from "react-dom"
import { useState, useEffect, useCallback, useReducer } from "react"
import { useContext } from "react"
import { AuthContext } from '../../AuthContext'
import { useRef } from "react"
import './TaskChat.css'
import DynamicSvgIcon from "../UI/icons/DynamicSvgIcon"
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"
import DynamicPngIcon from "../UI/icons/DynamicPngIcon"
import FullscreenImage from "../FullscreenImage/FullscreenImage"
import RightClickMenuComponent from "../RightClickMenuComponent/RightClickMenuComponent"
import TaskSettingsComponent from "../TaskSettingsComponent/TaskSettingsComponent"
import TaskTimerComponent from "../TaskTimerComponent/TaskTimerComponent"
import TaskStatisticModelWindow from "../TaskStatisticModelWindow/TaskStatisticModelWindow"


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
        return response.data 
    } catch (error) {
        console.error('Error loading more messages:', error)
        return null
    }

}

const initialState = {
    messages: [],
    nextPage: null,
    loading: true,
    isHistoryLoading: false,
    error: null,
    inputFiles: [],
    contextMenuData: null,
    answerMessage: new Map(),
    openTaskSettings: false,
    openTaskStatistic: false,
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

            let fix_images = action.payload?.images_urls.map(item => {
                return {
                ...item,
                "url": `${import.meta.env.VITE_REACT_APP_API_BASE_URL_IMAGES}${item.url}`
            }})
            console.log(fix_images)
            let message = action.payload
            message.images_urls = fix_images
            return { ...state, messages: [...state.messages, message] }

        case "LOAD_MORE_MESSAGES":
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
        
        case 'SET_INPUT_FILES':
            return {...state, inputFiles: action.payload}

        case 'DELETE_INPUT_FILE':
            return {...state, inputFiles: state.inputFiles.filter(value => value.index !== action.payload)}

        case 'CLEAR_INPUT_FILES':
            return {...state, inputFiles: []}

        case "SET_CONTEXT_MENU_DATA":
            return {...state, contextMenuData: action.payload}

        case 'SET_ANSWER_MESSAGE':
            return {...state, answerMessage: action.payload}

        case "SET_TASK_SETTINGS_WINDOW":
            return {...state, openTaskSettings: action.payload}

        case 'SET_TASK_STATISTIC_WINDOW':
            return {...state, openTaskStatistic: action.payload}

        default:
            return {...state}
    }
}

function TaskChat({ data, onClose, groupId, projectId }) {
    const { user } = useContext(AuthContext)

    const [close, setClose] = useState(false)
    const [taskData, setTaskData] = useState(data);
    const [messageText, setMessageText] = useState(null)
    const [state, dispatch] = useReducer(messageReduce, initialState)
    const [activeImageWindow, setActiveImageWindow] = useState(false)

    const webSocketRef = useRef(null)

    const messagesEndRef = useRef(null)
    const messagesStartRef = useRef(null)
    const messagesContainerRef = useRef(null)

    const textInputRef = useRef(null)
    const loadingRef = useRef(false)
    const nextPageRef = useRef(null)
    const scrollPositionRef = useRef(0)
    const inputFilesRef = useRef(null)
    const activeImageRef = useRef(null)

    const token = localStorage.getItem('accessToken')

    // Сохраняем позицию скролла перед загрузкой новых сообщений
    const saveScrollPosition = () => {
        if (messagesContainerRef.current) {
            scrollPositionRef.current = messagesContainerRef.current.scrollHeight - messagesContainerRef.current.scrollTop + 30;
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

        const container = messagesContainerRef.current
        const hasScroll = container && container.scrollHeight > container.clientHeight


        if (loadingRef.current === false && hasScroll && nextPageRef.current && entry.isIntersecting) {
            loadingRef.current = true

            saveScrollPosition();

            const result = await loadMoreMessages(nextPageRef.current)
            
            if (result) {
                dispatch({ type: 'LOAD_MORE_MESSAGES', payload: result })
                nextPageRef.current = result?.next
                loadingRef.current = false
            } else {
                console.error(result)
                loadingRef.current = false
            }
        }

    }, [])


    useEffect(() => {
        const observer = new IntersectionObserver(callbackFunc, {
            root: messagesContainerRef.current,
            rootMargin: '100px 0px 0px 0px',
            threshold: 0,
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
                dispatch({ type: 'UPDATE_MESSAGES', payload: data?.message })

                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
                }, 400)
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
        }, 400)
    }


    const closeOverlay = (e) => {
        if (state.answerMessage && !e.target.className.includes('context-right-menu')) {
            dispatch({ type: 'SET_CONTEXT_MENU_DATA', payload: null})
        }

        if (e.target.className.includes('create-task-overlay ')) {
            CloseWindow()
        } else if (e.target.className.includes('task-detail__opacity-filter') && deleteWindow) {
            setDeleteWindow()
        }
    }

    const change = async (e) => {
        e.preventDefault()

        if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            
            let metadata = {
                    type: 'message_metadata',
                    message: messageText,
                    taskId: taskData.id,
                    filesCount: state.inputFiles.length,
                    messageId: Date.now()
                }
            
            if (state.answerMessage.size > 0) {
                console.log(state.answerMessage)
                metadata = {...metadata, answerToMessage: {
                    'id': state.answerMessage.get('id'),
                    'text': state.answerMessage.get('text')
                }}
            }
            

            webSocketRef.current.send(JSON.stringify(metadata));


            for (let i = 0; i < state.inputFiles.length; i++) {
                const file = state.inputFiles[i];


                const fileMetadata = {
                    type: 'file_metadata',
                    messageId: metadata.messageId,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    fileIndex: i
                }

                webSocketRef.current.send(JSON.stringify(fileMetadata))
                
                const arrayBuffer = await file.file.arrayBuffer();
                webSocketRef.current.send(arrayBuffer)
            }

            webSocketRef.current.send(JSON.stringify({
                type: 'message_complete',
                messageId: metadata.messageId
            }));

            textInputRef.current.value = '';
            dispatch({ type: 'CLEAR_INPUT_FILES' })
            dispatch({ type: 'SET_ANSWER_MESSAGE', payload: new Map()})

        }
    }


    const changeSelectFiles = (e) => {
        const filesArray = Array.from(e.target.files);
        const maxSize = 5 * 1024 * 1024;
        const maxFiles = 10;

        if (filesArray.length > maxFiles) {
            return null
        }

        const filesWithPreview = filesArray.map((file, index) => { 

            return {
                index: index,
                file: file,
                preview: URL.createObjectURL(file), // создаём временный URL
                name: file.name
        }});

        dispatch({ type: 'SET_INPUT_FILES', payload: filesWithPreview})
    }

    const deleteFile = (fileIndex) => {
        dispatch({ type: 'DELETE_INPUT_FILE', payload: fileIndex})
    } 

    const setAnswerMessage = (message_data) => {
        dispatch({ type: 'SET_ANSWER_MESSAGE', payload: message_data})
    }

    const handleContextMenu = (e) => {
        if (e.target.tagName == 'P' && !e.target.className.includes('task-chat__message-username')) {
            e.preventDefault()
            dispatch({ type: 'SET_CONTEXT_MENU_DATA', payload: e})
        }
    }

    return (
        createPortal(
            <div className={`create-task-overlay ${close ? "close" : 'open'}`} onClick={closeOverlay}>

                {activeImageWindow && (
                    <FullscreenImage imageData={activeImageRef.current} onClose={() => setActiveImageWindow(false)}/>
                )}

                {state.contextMenuData && (
                    <RightClickMenuComponent event={state.contextMenuData} setMessage={setAnswerMessage}/>
                )}

                {state.openTaskStatistic && (
                    <TaskStatisticModelWindow 
                    taskId={taskData.id}
                    onClose={() => dispatch({ type: 'SET_TASK_STATISTIC_WINDOW', payload: false})}
                    />
                )}

                {state.openTaskSettings && (
                    <TaskSettingsComponent 
                    onClose={() => dispatch({ type: 'SET_TASK_SETTINGS_WINDOW', payload: false})}
                    taskId={taskData.id}
                    projectId={projectId}
                    groupId={groupId}
                    />
                )}


                <div className='chat-task__body'>
                    <div className='task-chat__title'>
                        <h2>{taskData?.name}</h2>
                        <div className="task-chat__admin-icons">
                            <TaskTimerComponent taskId={taskData.id} taskName={taskData.name}/>
                            <DynamicPngIcon iconName="statisticIcon"onClick={() => dispatch({ type: 'SET_TASK_STATISTIC_WINDOW', payload: true})}/>
                            <DynamicPngIcon iconName="settingsIcon" onClick={() => dispatch({ type: 'SET_TASK_SETTINGS_WINDOW', payload: true})}/>
                        </div>
                    </div>

                    <div className="task-chat__field" ref={messagesContainerRef} onContextMenu={handleContextMenu}>
                        <div ref={messagesStartRef}></div>
                        {state.messages.length > 0 && state.messages.map(item => (
                            <div className={`task-chat__message-body ${item?.user?.id === user.id ? 'user' : ''}`} key={item.id}>

                                <div className="task-chat__images-body">
                                    {item?.images_urls && item.images_urls.map(item => (
                                        <img src={item.url} key={item.id} onClick={() => {
                                            activeImageRef.current = item
                                            setActiveImageWindow(true)
                                        }}></img>
                                    ))}
                                </div>

                                
                                <div className={`task-chat__message-content ${item?.user?.id == user.id ? 'user' : ''}`}>
                                    {Object.keys(item.answer_to).length > 0 && (
                                        <p className="task-chat__answer" key={item.answer_to.id}>{item.answer_to.text}</p>
                                    )}

                                    <p className={`task-chat__message ${item?.user?.id ? 'user' : ''}`} id={item.id}>{item?.message}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef}/>
                    </div>
                    
                    { state.inputFiles && (
                         <div className={`task-chat__files-preview-body ${state.inputFiles.length > 0 ? 'open' : ''}`}>
                            {state.inputFiles.map((item, index) => (
                                <div className="files-preview-container" key={index}>
                                    <span onClick={() => deleteFile(item.index)}>X</span>
                                    <img src={item.preview} alt="" className="preview-file-image" style={{ animationDelay: `${0.1*index}s`}}/>
                                </div>
                            ))}
                        </div>
                    )}
                   
                    
                    {state.answerMessage && (
                        <div className="task-chat__answer-body">
                            <div className={`task-chat__answer-content ${state.answerMessage.get('text') ? 'open': ''}`}>
                                <div className="task-chat__answer-title">{state.answerMessage.get('text')}</div>
                            </div>
                        </div>
                    )}

                    <form className="task-chat__form" onSubmit={change} >
                        <input ref={inputFilesRef} type="file" accept="image/*" onChange={changeSelectFiles} multiple/>
                        <input ref={textInputRef} className="task-chat__input" type="text" onChange={(e) => setMessageText(e.target.value)} />
                        {/* <button type="submit">send</button> */}
                        <DynamicPngIcon iconName='clipsFile' height={24} width={24} className="clips-file-icon" onClick={() => inputFilesRef.current.click()}/>
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
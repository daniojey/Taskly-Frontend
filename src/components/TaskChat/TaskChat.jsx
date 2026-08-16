import { createPortal } from "react-dom"
import { useState, useEffect, useRef, useReducer } from "react"
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
import { Virtuoso } from "react-virtuoso"
import MessageComponent from "../MessageComponent/MessageComponent"
import { useNotify } from "../../common/stores/NotifyStore"

const MAX_MESSAGES = 45

const initialState = {
    messages: [],
    boundaryCursors: [], 
    loading: true,
    inputFiles: [],
    contextMenuData: null,
    answerMessage: new Map(),
    openTaskSettings: false,
    openTaskStatistic: false,
    firstItemIndex: 100000,
}

function messageReduce(state, action) {
    switch (action.type) {
        case "SET_MESSAGE_RESPONSE":
            return {
                ...state,
                messages: action.payload.results.reverse(),
                boundaryCursors: [{
                    olderCursor: action.payload.next,
                    newerCursor: action.payload.previous,
                    count: action.payload.results.length,
                }],
                loading: false,
            }

        case "START_LOADING":
            return { ...state, loading: true }

        case "END_LOADING":
            return { ...state, loading: false }

        case "UPDATE_MESSAGES": {
            const fixImages = action.payload?.images_urls.map(item => ({
                ...item,
                url: `${import.meta.env.VITE_REACT_APP_API_BASE_URL_IMAGES}${item.url}`
            }))
            const message = { ...action.payload, images_urls: fixImages }
            return { ...state, messages: [...state.messages, message] }
        }

        case "LOAD_OLD_MESSAGES": {
            let messages = [...action.payload.results.reverse(), ...state.messages]
            let boundaryCursors = [
                {
                    olderCursor: action.payload.next,
                    newerCursor: action.payload.previous,
                    count: action.payload.results.length,
                },
                ...state.boundaryCursors,
            ]
            let firstItemIndex = state.firstItemIndex - action.payload.results.length


            while (messages.length > MAX_MESSAGES && boundaryCursors.length > 1) {
                const evicted = boundaryCursors.pop()
                messages = messages.slice(0, messages.length - evicted.count)
            }

            return { ...state, messages, boundaryCursors, firstItemIndex, loading: false }
        }

        case "LOAD_NEW_MESSAGES": {
            let messages = [...state.messages, ...action.payload.results.reverse()]
            let boundaryCursors = [
                ...state.boundaryCursors,
                {
                    olderCursor: action.payload.next,
                    newerCursor: action.payload.previous,
                    count: action.payload.results.length,
                },
            ]
            let firstItemIndex = state.firstItemIndex

            while (messages.length > MAX_MESSAGES && boundaryCursors.length > 1) {
                const evicted = boundaryCursors.shift()
                messages = messages.slice(evicted.count)
                firstItemIndex += evicted.count
            }

            return { ...state, messages, boundaryCursors, firstItemIndex, loading: false }
        }

        case 'SET_INPUT_FILES':
            return { ...state, inputFiles: action.payload }

        case 'DELETE_INPUT_FILE':
            return { ...state, inputFiles: state.inputFiles.filter(v => v.index !== action.payload) }

        case 'CLEAR_INPUT_FILES':
            return { ...state, inputFiles: [] }

        case "SET_CONTEXT_MENU_DATA":
            return { ...state, contextMenuData: action.payload }

        case 'SET_ANSWER_MESSAGE':
            return { ...state, answerMessage: action.payload }

        case "SET_TASK_SETTINGS_WINDOW":
            return { ...state, openTaskSettings: action.payload }

        case 'SET_TASK_STATISTIC_WINDOW':
            return { ...state, openTaskStatistic: action.payload }

        default:
            return state
    }
}

function TaskChat({ data, onClose, groupId, projectId }) {
    const addNotify = useNotify((state) => state.addNotify)
    const [close, setClose] = useState(false)
    const [taskData] = useState(data)
    const [messageText, setMessageText] = useState(null)
    const [state, dispatch] = useReducer(messageReduce, initialState)
    const [activeImageWindow, setActiveImageWindow] = useState(false)
    const [isActiveTask, setIsActiveTask] = useState(false)

    const webSocketRef = useRef(null)
    const messagesEndRef = useRef(null)
    const loadingRef = useRef(false)
    const textInputRef = useRef(null)
    const inputFilesRef = useRef(null)
    const activeImageRef = useRef(null)

    const token = localStorage.getItem('accessToken')

    async function loadMoreMessages() {
        const cursor = state.boundaryCursors[0]?.olderCursor
        if (loadingRef.current || !cursor) return null
        loadingRef.current = true

        try {
            const response = await api.get(
                cursor.replace(import.meta.env.VITE_REACT_APP_API_BASE_URL, ''),
                { headers: { Authorization: getAccessToken() } }
            )
            dispatch({ type: "LOAD_OLD_MESSAGES", payload: response.data })
        } catch (error) {
            console.error('Error loading old messages:', error)
        } finally {
            loadingRef.current = false
        }
    }

    async function loadActualMessages() {
        const cursor = state.boundaryCursors.at(-1)?.newerCursor
        if (loadingRef.current || !cursor) return null
        loadingRef.current = true

        try {
            const response = await api.get(
                cursor.replace(import.meta.env.VITE_REACT_APP_API_BASE_URL, ''),
                { headers: { Authorization: getAccessToken() } }
            )
            dispatch({ type: "LOAD_NEW_MESSAGES", payload: response.data })
        } catch (error) {
            console.error('Error loading new messages:', error)
        } finally {
            loadingRef.current = false
        }
    }

    useEffect(() => {
        dispatch({ type: 'START_LOADING' })
        loadingRef.current = true

        const getMessages = async () => {
            try {
                const response = await api.get(`api/v1/chat-messages/${taskData.id}/`)
                dispatch({ type: "SET_MESSAGE_RESPONSE", payload: response.data })
            } catch (error) {
                console.error(error)
            }
        }

        const getIsActiveTask = async () => {
            try {
                const response = await api.get(
                    `api/v1/tasks/${taskData.id}/get_is_active_task/`,
                    { headers: { Authorization: getAccessToken() } }
                )
                setIsActiveTask(response.data?.results)
            } catch (error) {
                throw error
            }
        }

        getIsActiveTask()
        getMessages()

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
        }, 300)

        setTimeout(() => {
            loadingRef.current = false
        }, 400)
    }, [])

    const protocol = window.location.protocol === "https:" ? 'wss://' : 'ws://'
    console.log(protocol)
    useEffect(() => {
        const webSocketConnection = new WebSocket(
            protocol + import.meta.env.VITE_WEB_SOCKET + `/ws/chat/${taskData.id}` + `/?token=${token}`
        )

        const onOpen = () => console.log("Opened")
        const onError = () => console.log("Error")
        const onMessage = (e) => {
            const data = JSON.parse(e.data)
            dispatch({ type: 'UPDATE_MESSAGES', payload: data?.message })
        }

        webSocketConnection.addEventListener("open", onOpen)
        webSocketConnection.addEventListener('message', onMessage)
        webSocketConnection.addEventListener("error", onError)

        webSocketRef.current = webSocketConnection

        return () => {
            webSocketConnection.removeEventListener("open", onOpen)
            webSocketConnection.removeEventListener("error", onError)
            webSocketConnection.close()
            webSocketConnection.addEventListener("open", event => event.currentTarget.close())
        }
    }, [token, taskData.id])

    const CloseWindow = () => {
        setClose(true)
        setTimeout(() => onClose(), 400)
    }

    const closeOverlay = (e) => {
        if (state.answerMessage && !e.target.className.includes('context-right-menu')) {
            dispatch({ type: 'SET_CONTEXT_MENU_DATA', payload: null })
        }

        if (e.target.className.includes('window-overlay ')) {
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
                metadata = {
                    ...metadata, answerToMessage: {
                        'id': state.answerMessage.get('id'),
                        'text': state.answerMessage.get('text')
                    }
                }
            }

            webSocketRef.current.send(JSON.stringify(metadata))

            for (let i = 0; i < state.inputFiles.length; i++) {
                const file = state.inputFiles[i]

                const fileMetadata = {
                    type: 'file_metadata',
                    messageId: metadata.messageId,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    fileIndex: i
                }

                webSocketRef.current.send(JSON.stringify(fileMetadata))

                const arrayBuffer = await file.file.arrayBuffer()
                webSocketRef.current.send(arrayBuffer)
            }

            webSocketRef.current.send(JSON.stringify({
                type: 'message_complete',
                messageId: metadata.messageId
            }))

            textInputRef.current.value = ''
            dispatch({ type: 'CLEAR_INPUT_FILES' })
            dispatch({ type: 'SET_ANSWER_MESSAGE', payload: new Map() })
            setMessageText(null)
        }
    }

    const changeSelectFiles = (e) => {
        const filesArray = Array.from(e.target.files)
        const maxFiles = 10

        if (filesArray.length > maxFiles) return null

        const filesWithPreview = filesArray.map((file, index) => ({
            index,
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }))

        dispatch({ type: 'SET_INPUT_FILES', payload: filesWithPreview })
    }

    const deleteFile = (fileIndex) => {
        dispatch({ type: 'DELETE_INPUT_FILE', payload: fileIndex })
    }

    const setAnswerMessage = (message_data) => {
        dispatch({ type: 'SET_ANSWER_MESSAGE', payload: message_data })
    }

    const changeIsActiveTask = async () => {
        try {
            const response = await api.post(
                `api/v1/tasks/${taskData.id}/change_active_task/`,
                {},
                { headers: { Authorization: getAccessToken() } }
            )
            setIsActiveTask(response.data.status)
            addNotify(response.data.results, "success")
        } catch (error) {
            addNotify('Error in process change task status', "error")
            throw error
        }
    }


    return createPortal(
        <div className={`window-overlay ${close ? "close" : 'open'}`} onClick={closeOverlay}>
            {activeImageWindow && (
                <FullscreenImage imageData={activeImageRef.current} onClose={() => setActiveImageWindow(false)} />
            )}

            {state.contextMenuData && (
                <RightClickMenuComponent event={state.contextMenuData} setMessage={setAnswerMessage} />
            )}

            {state.openTaskStatistic && (
                <TaskStatisticModelWindow
                    taskId={taskData.id}
                    onClose={() => dispatch({ type: 'SET_TASK_STATISTIC_WINDOW', payload: false })}
                />
            )}

            {state.openTaskSettings && (
                <TaskSettingsComponent
                    onClose={() => dispatch({ type: 'SET_TASK_SETTINGS_WINDOW', payload: false })}
                    taskId={taskData.id}
                    projectId={projectId}
                    groupId={groupId}
                />
            )}

            <div className='window-body'>
                <div className='task-chat__title'>
                    <h2>{taskData?.name}</h2>
                    <div className="task-chat__admin-icons">
                        <TaskTimerComponent taskId={taskData.id} taskName={taskData.name} />
                        <DynamicPngIcon iconName={isActiveTask ? 'kidStar' : 'kidStarHollow'} onClick={changeIsActiveTask} />
                        <DynamicPngIcon iconName="statisticIcon" onClick={() => dispatch({ type: 'SET_TASK_STATISTIC_WINDOW', payload: true })} />
                        <DynamicPngIcon iconName="settingsIcon" onClick={() => dispatch({ type: 'SET_TASK_SETTINGS_WINDOW', payload: true })} />
                    </div>
                </div>

                <Virtuoso
                    style={{ height: "100vh" }}
                    data={state.messages}
                    startReached={loadMoreMessages}
                    endReached={loadActualMessages}
                    firstItemIndex={state.firstItemIndex}
                    computeItemKey={(_, item) => item.id}
                    initialTopMostItemIndex={state.messages.length - 1}
                    increaseViewportBy={{ top: 400, bottom: 400 }}
                    itemContent={(_, item) => (
                        <MessageComponent messageData={item} activeImageRef={activeImageRef} setActiveImage={setActiveImageWindow} />
                    )}
                />

                {state.inputFiles && (
                    <div className={`task-chat__files-preview-body ${state.inputFiles.length > 0 ? 'open' : ''}`}>
                        {state.inputFiles.map((item, index) => (
                            <div className="files-preview-container" key={index}>
                                <span onClick={() => deleteFile(item.index)}>X</span>
                                <img src={item.preview} alt="" className="preview-file-image" style={{ animationDelay: `${0.1 * index}s` }} />
                            </div>
                        ))}
                    </div>
                )}

                {state.answerMessage && (
                    <div className="task-chat__answer-body">
                        <div className={`task-chat__answer-content ${state.answerMessage.get('text') ? 'open' : ''}`}>
                            <div className="task-chat__answer-title">{state.answerMessage.get('text')}</div>
                        </div>
                    </div>
                )}

                <form className="task-chat__form" onSubmit={change}>
                    <input ref={inputFilesRef} type="file" accept="image/*" onChange={changeSelectFiles} multiple />
                    <input ref={textInputRef} className="holy_input" style={{ maxWidth: '100%' }} type="text" onChange={(e) => setMessageText(e.target.value)} />
                    <DynamicPngIcon iconName='clipsFile' height={24} width={24} className="clips-file-icon" onClick={() => inputFilesRef.current.click()} />
                    <DynamicSvgIcon size={28} className="sendIcon" color="#ffffffff" onClick={change}>
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </DynamicSvgIcon>
                </form>
            </div>
        </div>,
        document.body
    )
}

export default TaskChat
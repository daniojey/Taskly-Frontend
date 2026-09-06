import { Virtuoso } from "react-virtuoso"
import "./TaskChat.css"
import MessageComponent from "../MessageComponent/MessageComponent"
import { useNotify } from "../../common/stores/NotifyStore"
import { useEffect, useReducer, useRef, useState } from "react"
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"
import FullscreenImage from "../FullscreenImage/FullscreenImage"
import { FileItem, MessageItem } from "./TaskTypes"
import Icon from "../UI/icons/icon"

const MAX_MESSAGES = 45

interface InitialStateTypes {
    messages: MessageItem[],
    boundaryCursors: [],
    loading: boolean,
    inputFiles: FileItem[],
    contextMenuData: null,
    answerMessage: any,
    firstItemIndex: number;
    isUploadMessage: boolean
}

const initialState: InitialStateTypes  = {
    messages: [],
    boundaryCursors: [],
    loading: true,
    inputFiles: [],
    contextMenuData: null,
    answerMessage: new Map(),
    firstItemIndex: 100000,
    isUploadMessage: false
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


            console.log("EVENT OLD", messages.length, boundaryCursors.length)
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

        case 'SET_IS_UPLOAD_MESSAGE':
            return { ...state, isUploadMessage: action.payload }

        default:
            return state
    }
}

function TaskChat({ data }) {
    const [taskData] = useState(data)
    const addNotify = useNotify((state) => state.addNotify)
    const [messageText, setMessageText] = useState<string | null>(null)
    const [state, dispatch] = useReducer(messageReduce, initialState)
    const [activeImageWindow, setActiveImageWindow] = useState(false)

    const webSocketRef = useRef<WebSocket>(null)
    const loadingRef = useRef(false)
    const textInputRef = useRef<HTMLInputElement>(null)
    const inputFilesRef = useRef<HTMLInputElement>(null)
    const activeImageRef = useRef(null)

    async function loadMoreMessages() {
        const cursor = state.boundaryCursors[0]?.olderCursor
        if (loadingRef.current || !cursor) return null
        loadingRef.current = true

        try {
            const response = await api.get(
                cursor.replace(import.meta.env.VITE_REACT_APP_API_BASE_URL, ''),
                { headers: { Authorization: getAccessToken() } }
            )
            console.log(response.data)
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

    const token = localStorage.getItem('accessToken')
    const protocol = window.location.protocol === "https:" ? 'wss://' : 'ws://'
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
            webSocketConnection.addEventListener("open", event => (event.currentTarget as HTMLDialogElement).close())
        }
    }, [token, taskData.id])

    useEffect(() => {
        dispatch({ type: 'START_LOADING' })
        loadingRef.current = true

        const getMessages = async () => {
            try {
                const response = await api.get(`api/v1/chat-messages/${taskData.id}/`)
                dispatch({ type: "SET_MESSAGE_RESPONSE", payload: response.data })
            } catch (error) {
                console.error(error)
            } finally {
                loadingRef.current = false
            }
        }


        getMessages()
    }, [])

    const change = async (e) => {
        e.preventDefault()
        console.log(state.isUploadMessage)
        if (state.isUploadMessage) return null
        if (!messageText) return null

        if (state.inputFiles.length > 0) {
            try {
                dispatch({ type: "SET_IS_UPLOAD_MESSAGE", payload: true})
                const filesArray = new FormData()

                state.inputFiles.forEach((item: FileItem) => {
                    console.log(item)
                    filesArray.append('images', item.file)
                })

                const response = await api.post("api/v1/upload-chat-images/",
                    filesArray,
                    {headers: { 
                        Authorization: getAccessToken(),
                        "Content-Type": 'multipart/form-data'
                    }}
                )

                if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
                    console.log('WEB SOCK START')
                    let metadata = {
                        message: messageText || '',
                        taskId: taskData.id,
                        messageId: Date.now(),
                        images: response.data.results.map(item => item.id)
                    }

                    webSocketRef.current.send(JSON.stringify(metadata))

                }
            } catch (e) {
                console.error(e)
            }
        } else {
            dispatch({ type: "SET_IS_UPLOAD_MESSAGE", payload: true})
            if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {

                let metadata = {
                    message: messageText,
                    taskId: taskData.id,
                    messageId: Date.now()
                }

                webSocketRef.current.send(JSON.stringify(metadata))

            }
        }

        if (textInputRef.current) textInputRef.current.value = ''
        dispatch({ type: 'CLEAR_INPUT_FILES' })
        dispatch({ type: 'SET_ANSWER_MESSAGE', payload: new Map() })
        setMessageText(null)
        dispatch({ type: "SET_IS_UPLOAD_MESSAGE", payload: false})
    }

    const changeSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const maxFiles = 10

        if (e.target.files) {
            const filesArray = Array.from(e.target.files)

            if (filesArray.length > maxFiles) return null

            const filesWithPreview = filesArray.map((file, index) => ({
                index,
                file,
                preview: URL.createObjectURL(file),
                name: file.name
            }))

            dispatch({ type: 'SET_INPUT_FILES', payload: filesWithPreview })
        }

        addNotify("Error in process added files", "error")

        return null
    }

    const deleteFile = (fileIndex) => {
        dispatch({ type: 'DELETE_INPUT_FILE', payload: fileIndex })
    }

    const setAnswerMessage = (message_data) => {
        dispatch({ type: 'SET_ANSWER_MESSAGE', payload: message_data })
    }

    return (
        <div className="task-chat__window">
            {activeImageWindow && activeImageRef.current && (
                <FullscreenImage imageData={activeImageRef.current} onClose={() => setActiveImageWindow(false)} />
            )}

            <Virtuoso
                style={{ height: "100%"}}
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
                <input 
                ref={inputFilesRef} 
                type="file" 
                accept="image/*" 
                onChange={changeSelectFiles} 
                multiple 
                />

                <input 
                ref={textInputRef} 
                className="holy_input" 
                style={{ maxWidth: '100%', height: "100%" }} 
                type="text" 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageText(e.target.value)} 
                />

                <Icon 
                name='clipsFile' 
                size={30} 
                className="clips-file-icon" 
                onClick={() => {
                    if (inputFilesRef.current) inputFilesRef.current.click()
                }} 
                />

                <Icon 
                size={28} 
                name="sendMessage"
                id={`${!messageText ? "disabled": ""}`} 
                className="sendIcon" 
                onClick={change}/>
            </form>
        </div>
    )
}

export default TaskChat
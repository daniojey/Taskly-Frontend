
import "./MessageComponent.css"
import { useUser } from "../../common/stores/AuthStore"
import { truncateString } from "../../common/truncate"
import { useState } from "react";

interface TaskItem {
    id: number;
    status: "NS" | "BS" | "US";
    created_by: string;
    name: string;
    description: string;
    deadline: string;
    created_at: string;
    updated_at: string;
    performers: [];
}

interface AnswerTo {
    id: number;
    text: string;
}

interface UserItem {
    id: number;
    username: string;
}

interface urlItem {
    id: string;
    url: string;
    filename: string;
}

interface MessageItem {
    user: UserItem;
    task: TaskItem;
    id: number;
    message: string;
    created_at: string;
    updated_at: string;
    answer_to: AnswerTo;
    images_urls: urlItem[];
}

interface MessageComponentProps {
    messageData: MessageItem;
    activeImageRef: any;
    setActiveImage: (bool: boolean) => void;
}


function MessageComponent({ messageData, activeImageRef, setActiveImage } : MessageComponentProps) {
    const [messageItem, setMessageItem] = useState<MessageItem>(messageData)
    const user = useUser((state) => state.user)

    const isOwn = messageItem.user.id === user.id

    return (
        <div className="task-chat__message-wrapper">
            <div className={`task-chat__message-body ${messageItem?.user?.id === user.id ? 'user' : ''}`} key={messageItem.id}>

                <div className="task-chat__images-body">
                    {messageItem?.images_urls && messageItem.images_urls.map(item => (
                        <img src={item.url} key={item.id} onClick={() => {
                            activeImageRef.current = item
                            setActiveImage(true)
                        }}></img>
                    ))}
                </div>

                {messageItem?.message && (

                    <div className={`task-chat__message-content ${messageItem?.user?.id == user.id ? 'user' : ''}`}>
                        {Object.keys(messageItem.answer_to).length > 0 && (
                            <p className="task-chat__answer" key={messageItem.answer_to.id}>{truncateString(messageItem.answer_to.text, 50)}</p>
                        )}


                        <p className={`task-chat__message ${messageItem?.user?.id ? 'user' : ''}`} id={String(messageItem.id)}>{messageItem?.message}</p>
                    </div>
                )}

            </div>
        </div>

    )
}

export default MessageComponent
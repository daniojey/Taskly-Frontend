import { useEffect, useState, useContext, useRef } from "react";
import { useSearchParams } from "react-router";
import './Notification.css'
import { AuthContext } from "../../AuthContext";
import { useWebSocket } from "../../common/hooks/webSocketHook";

interface NotificationData {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  timestamp?: string;
}

function Notification() {
    const token = localStorage.getItem('accessToken')
    const [notify, setNotify] = useState<string | null>(null)
    const [hideNotify, setHideNotify] = useState(false)
    const {updateNotify} = useContext(AuthContext)


    const { isConnected } = useWebSocket({
        url: 'ws://'
                + 'localhost:8000'
                + '/ws/notifi'
                + `/?token=${token}`,

        enabled: !!token,
        onMessage:  async (e: MessageEvent) => {
                console.log('EDATA',JSON.parse(e.data)?.message)
                const dataNotify = e.data
                
                await updateNotify()
                setHideNotify(false)
                setNotify(JSON.parse(dataNotify)?.message)
                const timer = setTimeout(() => {
                    setHideNotify(true)
                }, 6000)
            },

        onOpen: () => console.log('Уведомления подключены'),
        onError: (error) => console.error('Ошибка уведомлений:', error),
        onClose: () => console.log('Уведомления отключены'),

        reconnectInterval: 600,
        maxReconnectAttempt: 10,

    })
  
    return (
        <>
            {notify && (
                <div className={`push-notify-body ${hideNotify ? 'closed' : 'open'}`}>
                    {notify}
                </div>
            )}
        </>
    )
}


export default Notification
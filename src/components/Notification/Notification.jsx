import { useEffect, useState, useContext, useRef } from "react";
import { useSearchParams } from "react-router";
import './Notification.css'
import { AuthContext } from "../../AuthContext";

function Notification() {
    const token = localStorage.getItem('accessToken')

    const [notify, setNotify] = useState(null)
    const [hideNotify, setHideNotify] = useState(false)
    const {updateNotify} = useContext(AuthContext)

    const webRef = useRef(null)


    useEffect(
        () => {
            const onOpen = () => console.log("Opened");
            const onError = () => console.log("Error");
            const onMessage =  async (e) => {
                console.log('EDATA',JSON.parse(e.data)?.message)
                
                await updateNotify()
                setHideNotify(false)
                setNotify(JSON.parse(e.data)?.message)
                const timer = setTimeout(() => {
                    setHideNotify(true)
                }, 6000)
            }
            

            const ws = new WebSocket(
                'ws://'
                + 'localhost:8000'
                + '/ws/notifi'
                + `/?token=${token}`
            )

            webRef.current = ws

            ws.addEventListener("open", onOpen);
            ws.addEventListener('message', onMessage)
            ws.addEventListener("error", onError);

            return () => {
                console.log("Cleaning up WebSocket")
                ws.removeEventListener("open", onOpen)
                ws.removeEventListener("message", onMessage)
                ws.removeEventListener("error", onError)
                
                // Закрываем соединение, если оно открыто
                if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                    ws.close()
                }
            };
        },
        []
    );


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
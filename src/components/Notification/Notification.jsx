import { useEffect, useState } from "react";
import './Notification.css'

function Notification() {
    const token = localStorage.getItem('accessToken')

    // const webSocketConnection = new WebSocket(
    //     'ws://'
    //     + 'localhost:8000'
    //     + '/ws/chat/'
    //     + 'bobiks'
    //     + `/?token=${token}`,

    // )

    const webSocketConnection = new WebSocket(
        'ws://'
        + 'localhost:8000'
        + '/ws/notifi'
        + `/?token=${token}`
    )

    const [notify, setNotify] = useState(null)
    const [hideNotify, setHideNotify] = useState(false)

    const timers = new Map()


    useEffect(
        () => {
            const onOpen = () => console.log("Opened");
            const onError = () => console.log("Error");
            const onMessage = (e) => {
                console.log('EDATA',JSON.parse(e.data)?.message)

                setHideNotify(false)
                setNotify(JSON.parse(e.data)?.message)
                const timer = setTimeout(() => {
                    setHideNotify(true)
                }, 6000)
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
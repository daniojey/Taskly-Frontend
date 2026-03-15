import { createPortal } from "react-dom"
import { useNotify } from "../../common/stores/NotifyStore"
import './NotifyPopUp.css'


function NotifyPopUp() {
    const { notifications, removeNotify } = useNotify()

    return (
        createPortal(
            <>
                {notifications.length > 0 && notifications.map((item, index) => (
                    <div
                        key={item.id}
                        className="notify-popup__wrapper"
                        style={{ 
                            position: 'fixed',
                            right: '20px',
                            bottom: `${20 + index * 50}px`,
                            transition: 'bottom 0.3s ease',
                        }}
                    >
                        <div className={`notify-popup__message ${item.hidden ? 'close' : ''} ${item.type}`}>
                            {item.message}
                            <p onClick={() => removeNotify(item.id)}>✖</p>
                        </div>
                    </div>
                ))}
            </>
        , document.body)
        
    )
}


export default NotifyPopUp
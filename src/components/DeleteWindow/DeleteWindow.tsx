import { createPortal } from "react-dom"
import "../../common/Styles/ModelWindow.css"
import "./DeleteWindow.css"
import { useModalClose } from "../../common/hooks/closeOverlay"

type Status = "task" | "project" | "group"

interface DeleteWindowProps {
    data: {
        onClose: () => void;
        onDelete: () => void;
    }
}

function DeleteWindow({ data } : DeleteWindowProps) {
    const {onClose, onDelete} = data

    const { isClosing, handleCloseWindow} = useModalClose({ 
        onClose: onClose, 
        delay: 400, 
        className: "window-overlay"
    })

    return (createPortal(
       <div className={`window-overlay ${isClosing ? "close": "open"}`} onClick={handleCloseWindow}>
            <div className='window-body'
            style={{
                maxWidth: "400px",
                maxHeight: "200px",
                minHeight: "200px"
                }}>
                <div className="delete-window__body-container">
                    <h2>You realy want to delete ?</h2>
                    <div className="delete-window__buttons">
                        <button id='cancel' onClick={() => onClose()}>Cancel</button>
                        <button id='delete' onClick={() => onDelete()}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    , document.body))
}


export default DeleteWindow
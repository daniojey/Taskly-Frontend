import { createPortal } from "react-dom"
import "../../common/Styles/ModelWindow.css"
import "./DeleteWindow.css"

type Status = "task" | "project" | "group"

interface DeleteWindowProps {
    data: {
        onClose: () => void;
        onDelete: () => void;
    }
}

function DeleteWindow({ data } : DeleteWindowProps) {
    const {
        onClose, 
        onDelete,
    } = data

    return (createPortal(
       <div className='window-overlay open' onClick={() => onClose()}>
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
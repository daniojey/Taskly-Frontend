import { createPortal } from "react-dom"
import { useState } from "react"
import '../../common/Styles/ModelWindow.css'
import './DeleteWindowConfirmation.css'
import { delete_user_in_group } from "../../common/delete_member_in_group"


interface DeleteWindowConfirmationProps {
    groupId: number;
    userId: number;
    username: string;
    onClose: () => void;
    onUpdate: () => void;
}


function DeleteWindowConfirmation ({ groupId, userId, username, onClose, onUpdate}: DeleteWindowConfirmationProps) {
    const [closeWindow, setCloseWindow] = useState(false)

    const onCloseWindow =  () => {
        setCloseWindow(true)

        setTimeout(() => {
            onClose()
        }, 500)
    }
    
    const handleClickOverlay = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.className.includes('window-overlay')) {
            onCloseWindow()
        }
    }

    const onClickDeleteButton = async (userId: number, groupId: number) => {
        console.log('DELETE')

        const result = await delete_user_in_group(userId, groupId)

        console.log(result)

        if (result === 200) {
            onUpdate()
            onCloseWindow()
        }
        
    }

    return (
         createPortal(
            <div 
            className={`window-overlay ${closeWindow ? 'close' : 'open'}`} 
            onClick={handleClickOverlay}
            >

                <div className="delete-confirmation-window__body">
                    <h2>Do you really want to exclude {username} ?</h2>

                    <div className="delete-confirmation-button__container">
                        <button id="active" onClick={() => onClickDeleteButton(userId, groupId)}>Yes</button>
                        <button id="cancel" onClick={onCloseWindow}>No.. Cancel</button>
                    </div>
                </div>
            </div>
        ,document.body)
    )

}


export default DeleteWindowConfirmation
import { createPortal } from "react-dom"
import { useState } from "react"
import '../../common/Styles/ModelWindow.css'
import './DeleteWindowConfirmation.css'
import { delete_user_in_group } from "../../common/delete_member_in_group"
import { useModalClose } from "../../common/hooks/closeOverlay"


interface DeleteWindowConfirmationProps {
    groupId: string;
    userId: number;
    username: string;
    onClose: () => void;
    onUpdate: () => void;
}


function DeleteWindowConfirmation ({ groupId, userId, username, onClose, onUpdate}: DeleteWindowConfirmationProps) {
    const { closeWindow, handleCloseWindow, isClosing} = useModalClose({ onClose: onClose, delay: 500, className: 'window-overlay'})


    const onClickDeleteButton = async (userId: number, groupId: string) => {
        console.log('DELETE')

        const result = await delete_user_in_group(userId, groupId)

        console.log(result)

        if (result === 200) {
            onUpdate()
            closeWindow()
        }
        
    }

    return (
         createPortal(
            <div 
            className={`window-overlay ${isClosing ? 'close' : 'open'}`} 
            onClick={handleCloseWindow}
            >

                <div className="delete-confirmation-window__body">
                    <h2>Do you really want to exclude {username} ?</h2>

                    <div className="delete-confirmation-button__container">
                        <button id="active" onClick={() => onClickDeleteButton(userId, groupId)}>Yes</button>
                        <button id="cancel" onClick={closeWindow}>No.. Cancel</button>
                    </div>
                </div>
            </div>
        ,document.body)
    )

}


export default DeleteWindowConfirmation
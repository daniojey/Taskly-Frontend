import { createPortal } from "react-dom";
import "./DeleteSubTask.css"
import { useApi } from "../../common/api_query";
import { useNotify } from "../../common/stores/NotifyStore";
import { useModalClose } from "../../common/hooks/closeOverlay";


interface DeleteSubTaskProps {
    subTaskId: number;
    onClose: () => void;
    onUpdate: () => void;
}

function DeleteSubTask({subTaskId, onClose, onUpdate}) {
    const {isClosing, handleCloseWindow, closeWindow} = useModalClose({ onClose: onClose, "delay": 400, "className": 'window-overlay'})
    const { addNotify } = useNotify()

    const deleteSubTask = async () => {
        const result = await useApi(
            `api/v1/subtasks/${subTaskId}/`,
            "delete",
        )

        if (result["success"]) {
            onUpdate()
            closeWindow()
        } else {
            addNotify("Delete error", 'error')
        }
    }


    return (
        createPortal(
            <div className={`window-overlay ${isClosing ? 'close' : 'open'}`}
            style={{
                zIndex: 99999
            }}
            onClick={handleCloseWindow}
            >
                <div 
                className="window-body"
                style={{
                    maxWidth: '400px',
                    maxHeight: '300px',
                    minHeight: '200px',
                }}>

                    <div className="subtask-delete__body">
                        <h2>You realy want to delete it ?</h2>

                        <div className="subtask-delete__buttons">
                            <button onClick={() => closeWindow()}>
                                Cancel
                            </button>
                            <button
                            id="subtask-delete-button" 
                            onClick={() => deleteSubTask()}>
                                Delete
                            </button>
                        </div>
                    </div>

                </div>
            </div>,
            document.body
        )
    )
}

export default DeleteSubTask
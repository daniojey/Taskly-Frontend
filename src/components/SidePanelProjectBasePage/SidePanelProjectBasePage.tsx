import { useModalClose } from "../../common/hooks/closeOverlay";
import "./SidePaneProjectBasePage.css"

interface SidePaneProjectBasePageProps {
    onDelete: () => void;
    onCreate: () => void;
    isClose: boolean;
}

function SidePaneProjectBasePage({onDelete, onCreate, isClose} : SidePaneProjectBasePageProps) {
    return (
        <div 
        className={`project-page__side-panel ${isClose ? 'close' : 'open'}`}
        >
            <button id='createTask' onClick={onCreate}>Create task</button>
            <button id='delete' onClick={onDelete}>Delete Project</button>
        </div>
    )
}


export default SidePaneProjectBasePage

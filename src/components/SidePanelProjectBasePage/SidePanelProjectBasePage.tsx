import { useModalClose } from "../../common/hooks/closeOverlay";
import "./SidePaneProjectBasePage.css"

interface SidePaneProjectBasePageProps {
    onDelete: () => void;
    onCreate: () => void;
    isClose: boolean;
    onAi: () => void;
}

function SidePaneProjectBasePage({onDelete, onCreate, isClose, onAi} : SidePaneProjectBasePageProps) {
    return (
        <div 
        className={`project-page__side-panel ${isClose ? 'close' : 'open'}`}
        >
            <button id='taskHelper' onClick={onAi}>Ai Task helper</button>
            <button id='createTask' onClick={onCreate}>Create task</button>
            <button id='delete' onClick={onDelete}>Delete Project</button>
        </div>
    )
}


export default SidePaneProjectBasePage

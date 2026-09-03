import { useState } from "react"
import "./AICreatorTask.css"
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"
import { useLoader } from "../../common/hooks/loaderHook";
import LoaderComponent from "../LoaderComponent/LoaderComponent";
import { createPortal } from "react-dom";
import { useModalClose } from "../../common/hooks/closeOverlay";

interface SubTask {
    title: string;
    description: string;
}

interface ApiResponse {
    title: string,
    subtasks: SubTask[],
}

interface AICreatorTaskProps {
    onClose: () => void;
    projectId: string | undefined;
    onUpdate: () => void;
}

type statusType  = "NS" | "BS" | "US"

function AICreatorTask({ onClose, projectId, onUpdate} : AICreatorTaskProps) {
    const [userInput, setUserInput] = useState<string | null>(null)
    const [deadline, setDeadline] = useState<string>()
    const [status, setStatus] = useState<statusType>()
    const {loading, closeLoading, setLoading,  onCloseLoading} = useLoader(false)
    const [helperResponse, setHelperResponse] = useState<ApiResponse>()
    const {isClosing, handleCloseWindow, closeWindow} = useModalClose({ onClose: onClose, delay: 400, className: 'window-overlay'})

    const getResponse = async () => {
        if (loading) return;
        if (userInput && userInput?.length <= 1) return;


        setLoading(true)

        try {
            const response = await api.post(
                'api/v1/task-helper/', 
                {input: userInput}, 
                {headers: {Authorization:getAccessToken()}}
            )

            console.log(response)
            setHelperResponse(response.data.results.task)
        } catch (error) {
            console.log(error)
        } finally {
            onCloseLoading()
        }
    }    

    const createTask = async () => {
        if (loading) return;
        if (!helperResponse && !deadline && !status) return;

        setLoading(true)

        try {
            const response = await api.post("api/v1/task-helper/created_task/",
                {
                    taskData: helperResponse,
                    deadLine: deadline,
                    status: status,
                    projectId: projectId
                },
                {headers: {Authorization: getAccessToken()}}
            )

            console.log(response)
            onUpdate()
            closeWindow()
        } catch (error) {
            console.error(error)
        } finally {
            onCloseLoading()
        }
    }


    return (
        createPortal(
        <div
            className={`window-overlay ${isClosing ? 'close': 'open'}`}
            onClick={handleCloseWindow}
            >
            <div className="window-body">
                 {!loading && !helperResponse && (
                    <div className="ai-button-container">
                        <h2>Task helper</h2>

                        <h1></h1>

                        <form>
                            <input 
                            type="text"
                            value={userInput as string}
                            style={{ maxWidth: '100%'}}
                            className="holy_input"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserInput(e.target.value)} 
                            placeholder="what's the task for today?" />

                            <button  
                            onClick={() => getResponse()}
                            type="submit"
                            >Generate</button>
                        </form>
                    </div>
                )}

                {loading && (
                    <div className="ai-loader-body">
                        <LoaderComponent  onClose={closeLoading}/>
                    </div>
                )}


                {helperResponse && (
                    <>
                        <div className="ai-response-body">
                            <p className="ai-created-task">{helperResponse.title}</p>
                            {helperResponse.subtasks.map((item, index) => (
                                <div key={index} className="ai-created-subtask">
                                    <p>{item.title}</p>
                                    <p>{item.description}</p>
                                </div>
                            ))}
                        </div>

                        <form className="ai-additional-task-data">
                                <div className="data-field">
                                    <label htmlFor="status">Status</label>
                                    <select className='holy_select' defaultValue="NS" id="status"
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.currentTarget.value as statusType)}>
                                        <option value="NS">No status</option>
                                        <option value="BS">Base status</option>
                                        <option value="US">Urgent status</option>
                                    </select>
                                </div>
                                
                                <div className="data-field">
                                    <label htmlFor="deadline">Deadline</label>
                                    <input
                                    className='holy_select'
                                    type="datetime-local" 
                                    onClick={(e) => {
                                        e.currentTarget.showPicker()
                                    }}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeadline(e.currentTarget.value as string)}
                                    id='deadline'/>
                                </div>
                                
                                <div className="ai-data-buttons">
                                    <button
                                    type="button"
                                    onClick={createTask}
                                    >Create Task</button>
                                </div>
                        </form>
                    </>
                    
                )}
            </div>
        </div>
        , document.body)
    )

}

export default AICreatorTask
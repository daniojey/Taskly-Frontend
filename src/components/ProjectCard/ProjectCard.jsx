import "./ProjectCard.css"
import { Link, useNavigate } from "react-router"


function ProjectCard({ props, groupId }) {
    const { id, title, tasks, created_at} = props
    const navigate = useNavigate()

    const clickCard = async(e) => {
        
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
            return;
        }

        console.log('CLICK CARD')
        console.log(e.target.tagName)
        navigate(`/projects/${id}/group/${groupId}/`)
    }

    return (
        <>
            <div className="project-card" onClick={clickCard}>
                <div className="project-card__title">
                    <h2>{title}</h2>
                </div>

                <div className="project-card__body">
                    <label>Tasks</label>
                    {tasks && tasks.length > 0 ? tasks.map((task, index) => (
                        <div className="project-card__task-card" key={index}>
                            <p className="title-task">Title: {task.name}</p>
                            <p>{task.description}</p>
                        </div>
                    )): (
                        <div className="project-card__task-not-found">
                            <h2>Not found tasks</h2>
                            <Link to={`/projects/${id}/`}>Create</Link>
                        </div>
                    )}
                </div>
                <p className="created_date">{created_at}</p>
            </div>
        </>
    )
}


export default ProjectCard

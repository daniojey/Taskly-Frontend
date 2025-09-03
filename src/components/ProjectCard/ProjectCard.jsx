import "./ProjectCard.css"
import { Link } from "react-router"


function ProjectCard({ props }) {
    const { id, title, tasks, create_at} = props

    return (
        <>
            <div className="project-card">
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
                            <Link to={`/projeects/${id}/`}>Create</Link>
                        </div>
                    )}
                </div>
                <p className="created_date">{create_at}</p>
            </div>
        </>
    )
}


export default ProjectCard

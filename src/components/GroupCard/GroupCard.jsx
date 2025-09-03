import { useNavigate } from "react-router"
import DynamicPngIcon from "../UI/icons/DynamicPngIcon"
import './GroupCard.css'

function GroupCard({ props }) {
    const { index , id, name, members, projects } = props
    const navigate = useNavigate()
    // console.log(props)

    const groupNavigate = (e) => {
        console.log('CLIK')
        navigate(`/groups/${id}/`)
    }

    return (
        <>
            <div 
            onClick={groupNavigate}
            className={props?.created ? "group-card__body created" : "group-card__body" }
            style={{ animationDelay: `${index * 0.15}s` }} 
            >
                <DynamicPngIcon iconName="groupIcon" className="groupIcon"/>
                <div className="group-card__body-text">
                    <h3>{name}</h3>
                    <p>members: {members ? Object.keys(members).length : Error}</p>
                    <p>projects: {projects ? Object.keys(projects).length: Error}</p>
                </div>
            </div>
        </>
    )
}


export default GroupCard
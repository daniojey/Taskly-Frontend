import { useNavigate } from "react-router"
import DynamicPngIcon from "../UI/icons/DynamicPngIcon"
import './GroupCard.css'

interface Members {
    email: string;
    first_name: string;
    id: number;
    image_profile: string | null;
    image_profile_url: string | null;
    in_group: boolean;
    in_invite_send: boolean;
    last_login: string;
    last_name: string;
    username: string
}

interface Projects {
    created_at: string;
    description: string;
    group_name: string;
    id: number;
    title: string;
}

interface GroupCardProps {
   props: {
    index: number;
    id: number;
    name: string;
    members: Members[];
    projects: Projects[];
    created: true | null
   }
}

function GroupCard({ props}: GroupCardProps) {
    const { index , id, name, members, projects } = props
    const navigate = useNavigate()
    // console.log(props)

    const groupNavigate = (e: React.MouseEvent<HTMLElement>) => {
        console.log('CLIK')
        navigate(`/groups/${id}/`)
    }

    const membersGet = members ? Object.keys(members).length: 0
    const projectsGet = projects ? Object.keys(projects).length : 0

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
                    <p>members: {membersGet}</p>
                    <p>projects: {projectsGet}</p>
                </div>
            </div>
        </>
    )
}


export default GroupCard
import { useNavigate } from "react-router"
import DynamicPngIcon from "../UI/icons/DynamicPngIcon"
import './GroupCard.css'

interface GroupCardProps {
   props: {
    index: number;
    id: number;
    name: string;
    count_members: number;
    count_projects: number;
    created: true | null
   }
}

function GroupCard({ props}: GroupCardProps) {
    const { index , id, name, count_members, count_projects } = props
    const navigate = useNavigate()
    // console.log(props)

    const groupNavigate = (e: React.MouseEvent<HTMLElement>) => {
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
                    <p>members: {count_members}</p>
                    <p>projects: {count_projects}</p>
                </div>
            </div>
        </>
    )
}


export default GroupCard
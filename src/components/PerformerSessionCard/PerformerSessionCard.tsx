import './PerformerSessionCard.css'

interface User {
    id: number
    username: string;
    image_profile_url: string;
}

interface PerformerSessionItem {
    id: number;
    duration: string;
    user: User;
    is_active: boolean;
    
}

interface PerformerSessionCardProps {
    data: PerformerSessionItem;
    index: number
}

const images_url = import.meta.env.VITE_REACT_APP_API_BASE_URL_IMAGES

function PerformerSessionCard({ data, index }: PerformerSessionCardProps) {
    const { id, duration, user} = data

    return (
        <div 
        className="performer-session__card"
        style={{ animationDelay: `${0.1 * index}s`}}
        >
            <div className="performer-session__title">
                {user?.image_profile_url && (
                    <img src={`${images_url}${user.image_profile_url}`} className='image-profile'/>
                )}
                <h3>{user.username}</h3>
            </div>
            <div className="performer-session__body">
                <p>Session duration {duration}</p>
            </div>
        </div>
    )
}

export default PerformerSessionCard
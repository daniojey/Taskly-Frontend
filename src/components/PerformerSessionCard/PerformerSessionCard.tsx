import DynamicPngIcon from '../UI/icons/DynamicPngIcon';
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
    created_at: number;
}

interface PerformerSessionCardProps {
    data: PerformerSessionItem;
    index: number
}

const formatted_duration = (duration) => {
    // split and remove nulls in list
    const [hours, minutes, seconds] = duration.split(":").map(Number)

    const parts = [
        { value: hours, label: 'hour' },
        { value: minutes, label: 'minute' },
        { value: seconds, label: 'second' },
    ].filter(({ value }) => value > 0);

    if (parts.length === 0) return "without time";

    return parts
        .map(({ value, label }) => `${value} ${label}${value === 1 ? "" : "s"}`)
        .join(", ");
}

const images_url = import.meta.env.VITE_REACT_APP_API_BASE_URL_IMAGES

function PerformerSessionCard({ data, index }: PerformerSessionCardProps) {
    const { id, duration, user, created_at, is_active } = data



    const formatted_date = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: 'long',
        year: 'numeric'
    }).format(new Date(created_at))

    return (
        <div
            className="performer-session__card"
            style={{ animationDelay: `${0.1 * index}s` }}
        >
            <div className="performer-session__title">
                <div className='performer-session__user-image'>
                    {user?.image_profile_url && (
                        <img src={`${images_url}${user.image_profile_url}`} className='image-profile' />
                    ) || (
                            <DynamicPngIcon iconName={"defaultImageProfile"} />
                        )}
                </div>

                <h3>{user.username}</h3>
            </div>
            <div className="performer-session__body">
                <p>Session duration: {formatted_duration(duration)}</p>
                <p>Is active: {is_active ? 'Yes' : 'No'}</p>
            </div>
            <div className='performer-session__date_created'>{formatted_date}</div>
        </div>
    )
}

export default PerformerSessionCard
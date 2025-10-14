import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../AuthContext"
import './NotificationPage.css'
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"

function NotificationPage() {
    const { user } = useContext(AuthContext)
    const [notify, setNotify] = useState([])


    useEffect(() => {

        const getNotify = async () => {
            try {
                const response = await api.get(
                    'api/v1/notifications/',
                    {
                        headers: {
                            Authorization: getAccessToken()
                        }
                    }
                )

                console.log('ПОЛУЧЕННИЕ УВЕДОМЛЕНИЯ', response.data.results)
                setNotify(response.data.results)
            } catch (error) {
                console.error(error)
            }
        }

        getNotify()
    }, [])


    const notifiType = {
        task: 'task',
        project: 'project'
    }

    return (
        <div className="notifications-root">
            <div className="notifications-body">
                {notify && notify.length !== 0 && notify.map((item, index) => (
                    <div key={index} className="notification-Item" style={{ animationDelay: `${index * 0.14}s`}}>
                        <h2 className={`notification-type ${notifiType[item?.type] || ''}`}>{item?.type || <>other</>}</h2>
                        <h3 className="notification-date">{item.created_date}</h3>

                        <h3>{item.message}</h3>
                        <p>description message</p>
                    </div>
                ))}
            </div>
        </div>
    )
}


export default NotificationPage
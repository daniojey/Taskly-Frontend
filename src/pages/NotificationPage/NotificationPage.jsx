import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../AuthContext"
import './NotificationPage.css'
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"
import { useSearchParams } from "react-router"
import { buildUrl } from "./common/build_url"

function NotificationPage() {
    const { user } = useContext(AuthContext)
    const [notify, setNotify] = useState([])
    const [searchParams, setSearchParams] = useSearchParams()
    const [pages, setPages] = useState([]) 

    const page = searchParams.get('page') || '1'
    

    useEffect(() => {

        const getNotify = async () => {
            try {
                const response = await api.get(
                    buildUrl(page),
                    {
                        headers: {
                            Authorization: getAccessToken()
                        }
                    }
                )

                {/* set pagination pages */}
                const countPages = Math.ceil( response.data.count / response.data.items_per_page )
                const allPages = Array.from({'length': countPages}, (_, i) => i + 1)
                setPages(allPages)

                {/* set Notification */}
                setNotify(response.data.results)
            } catch (error) {
                console.error(error)
            }
        }

        getNotify()
    }, [page])


    {/* function set page in pagination */}
    const handleSetPage = (pageNumber) => {
        const params = new URLSearchParams()
        params.set('page', pageNumber)
        setSearchParams(params)
    }


    const notifiType = {
        task: 'task',
        project: 'project'
    }

    return (
        <>
            <div className="notifications-root">
                <div className="notifications-base-container">
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
                {pages?.length > 0 && (
                    <div className="pagination">
                        {/* <button 
                        className="pagination-button"
                        onClick={handlePrevPage} 
                        disabled={!state.data.previous}
                        >
                        Назад
                        </button> */}
                        
                        {pages.map(num => (
                            <button 
                            key={num} 
                            value={num} 
                            onClick={(e) => handleSetPage(e.target.value)}
                            className={`pagination-button`}
                            disabled={String(page) === String(num)}
                            >
                            {num}</button>
                        ))}
                        
                        {/* <button 
                        onClick={handleNextPage} 
                        disabled={!state.data.next}
                        className="pagination-button"
                        >
                        Вперед
                        </button> */}
                    </div>
                )}
            </div>
        </>
    )
}


export default NotificationPage
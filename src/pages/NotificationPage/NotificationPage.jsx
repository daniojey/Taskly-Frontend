import { useContext, useEffect, useReducer, useState } from "react"
import { AuthContext } from "../../AuthContext"
import './NotificationPage.css'
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"
import { useSearchParams } from "react-router"
import { buildUrl } from "./common/build_url"
import { getVisiblePages } from "./common/getVisiblePages"



const initialState = {
    data: {
        count: null,
        next: null,
        previous: null,
        results: []
    },
    pages: []
}


const ACTIONS = {
    SET_PAGES: 'SET_PAGES',
    SET_DATA: 'SET_DATA',
    SET_CURRENT_PAGE: 'SET_CURRENT_PAGE'
}


function reducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_PAGES:
            console.log('УСТАНОВКА СТРАНИЦ')
            return { ...state, pages: action.payload }

        case ACTIONS.SET_DATA:
            console.log('УСТАНОВКА ДАННЫХ', action.payload)
            return {...state, data: action.payload }
    }
}



function NotificationPage() {
    const { user } = useContext(AuthContext)
    const [searchParams, setSearchParams] = useSearchParams()
    const [state, dispatch] = useReducer(reducer, initialState)

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

                {/* set pagination pages */ }
                const countPages = Math.ceil(response.data.count / response.data.items_per_page)
                const allPages = Array.from({ 'length': countPages }, (_, i) => i + 1)
                dispatch({ type: ACTIONS.SET_PAGES, payload: allPages })

                {/* set Notification */ }
                // setNotify(response.data.results)
                dispatch({ type: ACTIONS.SET_DATA, payload: response.data})
            } catch (error) {
                console.error(error)
            }
        }

        getNotify()
    }, [page])


    {/* function set page in pagination */ }
    const handleSetPage = (pageNumber) => {
        const params = new URLSearchParams()
        params.set('page', pageNumber)
        setSearchParams(params)
    }

    const handlePreviousPage = () => {
        if (state.data.previous) {
            const newPage = new URL(state.data.previous).searchParams.get('page') || '1'
            const params = new URLSearchParams()

            params.set('page', newPage)
            setSearchParams(params)
        }
    }

    const handleNextPage = () => {
        if (state.data.next) {
            const newPage = new URL(state.data.next).searchParams.get('page') || '1'
            const params = new URLSearchParams()

            params.set('page', newPage)
            setSearchParams(params)
        }
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
                        {state.data.results && state.data.results.length !== 0 && state.data.results.map((item, index) => (
                            <div key={index} className="notification-Item" style={{ animationDelay: `${index * 0.14}s` }}>
                                <h2 className={`notification-type ${notifiType[item?.type] || ''}`}>{item?.type || <>other</>}</h2>
                                <h3 className="notification-date">{item.created_date}</h3>

                                <h3>{item.message}</h3>
                                <p>description message</p>
                            </div>
                        ))}
                    </div>
                </div>
                {state.pages?.length > 0 && (
                    <div className="pagination">
                        <button 
                        onClick={handlePreviousPage}
                        className="pagination-button"
                        disabled={!state.data.previous}
                        >
                        Назад
                        </button>

                        {getVisiblePages(parseInt(page), state.pages.length).map((item, index) => (
                        item === '...' ? (
                            <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                        ) : (
                            <button 
                            key={item} 
                            value={item} 
                            onClick={(e) => handleSetPage(e.target.value)}
                            className={`pagination-button ${state.currentPage === item ? 'active': ''}`}
                            disabled={state.currentPage === item}
                            >
                            {item}
                            </button>
                        )
                        ))}

                        <button 
                        onClick={handleNextPage}
                        disabled={!state.data.next}
                        className="pagination-button"
                        >
                        Вперед
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}


export default NotificationPage
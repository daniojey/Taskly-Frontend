import { useParams, useSearchParams } from "react-router"
import { useEffect, useState } from "react"
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"
import './GroupLogsPage.css'
import DynamicPngIcon from "../../components/UI/icons/DynamicPngIcon"
import * as yup from 'yup'
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import GroupLogsCard from "../../components/GroupLogsCard/GroupLogsCard"

function GroupLogsPage () {
    const [logs, setLogs] = useState([])
    const [openFilters, setOpenFilters] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const [showContextLogs, setShowContextLogs] = useState(false)

    const schema = yup.object({
        'date-start': yup.string(),
        'date-out': yup.string(),
        'username': yup.string().max(255),
        'group-name': yup.string().max(155),
        'event-type': yup.string(),
    })

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema)
    })

    const { groupId } = useParams()

    const page = searchParams.get('page') || '1'
    const dateStart = searchParams.get('date-start') || null
    const dateOut = searchParams.get('date-out') || null
    const username = searchParams.get('username') || null
    const groupName = searchParams.get('group-name') || null
    const eventType = searchParams.get('event-type') || null

    const buildUrl = (page, dateStart, dateOut, username, groupName, eventType) => {
        const url = `api/v1/group/${groupId}/logs`
        const params = new URLSearchParams()

        if (page) params.set('page', page)
        if (dateStart) params.set('date-start', dateStart)
        if (dateOut) params.set('date-out', dateOut)
        if (username) params.set('username', username)
        if (groupName) params.set('group-name', groupName)
        if (eventType) params.set('event-type', eventType)
        const queryParam = params.toString()

        console.log(queryParam)

        return queryParam ? `${url}?${queryParam}` : url
    }

    useEffect(() => {
        const getGroupLogs = async () => {
            try {
                const response = await api.get(
                    buildUrl(page, dateStart, dateOut, username, groupName, eventType),
                    {headers: {
                        Authorization: getAccessToken()
                    }}
                )
                
                console.log(response)
                setLogs(response.data.results)
            } catch (error) {
                console.error(error)
            }
        }


        getGroupLogs()
    }, [page, searchParams])

    const checkOpenFilters = (e) => {

        if (openFilters && e.target.className.includes('logs-base-container')) {
            setOpenFilters(false)
        }
    }

    const openDateTimeWidget = async (e) => {
        e.target.showPicker()
    }

    const submitFilters = async (data) => {
        console.log(data)
        const params = new URLSearchParams

        for (let item in data) {
            if (data[item]) {
                params.set(item, data[item])
            }
        }

        setSearchParams(params)
    }

    return (
        <>
            <div className={`logs__filters-base-container ${openFilters ? 'active' : ''}`}>
                <div className="logs__filters-title-container">
                    <h2>Filters</h2>
                    <button onClick={() => setOpenFilters(false)}>X</button>
                </div>

                <form onSubmit={handleSubmit(submitFilters)} id="filter-form" className="logs__filters-body">
                    <div className="logs__filters-body-row">
                        <label htmlFor="date-start">Date start</label>
                        <input
                        {...register('date-start')} 
                        onClick={openDateTimeWidget} 
                        className="datetime-base-style"
                        type="datetime-local" 
                        name="date-start" 
                        id="date-start" 
                        />
                    </div>
                    
                    <div className="logs__filters-body-row">
                        <label htmlFor="date-out">Date out</label>
                        <input
                        {...register('date-out')}
                        className="datetime-base-style"  
                        onClick={openDateTimeWidget} 
                        type="datetime-local" 
                        name="date-out" 
                        id="date-out"
                        />
                    </div>

                    <div className="logs__filters-body-row">
                        <label htmlFor="username">Username</label>
                        <input
                        {...register('username')} 
                        type="text"
                        className='neomorphism-input' 
                        name="username" 
                        id="username" 
                        />
                    </div>

                    <div className="logs__filters-body-row">
                        <label htmlFor="group-name">Group name</label>
                        <input
                        {...register('group-name')} 
                        type="text"
                        className='neomorphism-input'
                        name="group-name" 
                        id="group-name"
                        />
                    </div>

                    <div className="logs__filters-body-row">
                        <label htmlFor="event-type">Event type</label>
                        <select
                        {...register('event-type')} 
                        name="event-type" 
                        id="event-type"
                        >
                            <option value="">select..</option>
                            <option value="Add member">add member</option>
                            <option value="Kicked member">kicked member</option>
                            <option value="Change settings">change settings</option>
                            <option value="Invite member">invite member</option>
                            <option value="Invite deflected">invite deflected</option>
                        </select>
                    </div>
                </form>

                <div className="logs__filters-button-container">
                    <button type="submit" form="filter-form">Submit</button>
                </div>
            </div>

            <div className="logs__filters-button-title">
                <DynamicPngIcon iconName='filtersIcon' height={32} width={32} onClick={() => setOpenFilters(!openFilters)}/>
                
                <div>
                    <label>Show context</label>
                    <input type="checkbox" checked={showContextLogs} onChange={(e) => setShowContextLogs(e.target.checked)}/>
                </div>
            </div>

            <div className="logs-base-container" onClick={checkOpenFilters}>
                {logs && logs.length > 0 && logs.map((item) => (
                    <GroupLogsCard data={item} key={item.id} showContext={showContextLogs}/>
                ))}
            </div>
        </>
    )
}


export default GroupLogsPage
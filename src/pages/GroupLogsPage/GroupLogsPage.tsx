import { useParams, useSearchParams } from "react-router"
import { useEffect, useState } from "react"
import { api } from "../../../api"
import { getAccessToken } from "../../../tokens_func"
import './GroupLogsPage.css'
import DynamicPngIcon from "../../components/UI/icons/DynamicPngIcon"
import * as yup from 'yup'
import { Resolver, SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import GroupLogsCard from "../../components/GroupLogsCard/GroupLogsCard"

interface LogItem {
    id: number;
    event: string;
    event_type: string;
    group_name: string;
    anchor_username: string;
    created_at: string;
    data?: {};
}

interface UrlParams {
    page: string;
    dateStart: string | null;
    dateOut: string | null; 
    username: string | null;
    groupName: string | null;
    eventType: string | null;
}

interface YupFormData {
    'date-start': string;
    'date-out': string;
    'username': string;
    'group-name': string;
    'event-type': string;
}

function GroupLogsPage () {
    const [logs, setLogs] = useState<LogItem[]>([])
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
    } = useForm<YupFormData>({
        resolver: yupResolver(schema) as Resolver<YupFormData>
    })

    const { groupId } = useParams()

    const page = searchParams.get('page') || '1'
    const dateStart = searchParams.get('date-start') || null
    const dateOut = searchParams.get('date-out') || null
    const username = searchParams.get('username') || null
    const groupName = searchParams.get('group-name') || null
    const eventType = searchParams.get('event-type') || null

    const buildUrl = ({page, dateStart, dateOut, username, groupName, eventType} : UrlParams) => {
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
                    buildUrl({
                        page: page, 
                        dateStart: dateStart, 
                        dateOut: dateOut, 
                        username: username, 
                        groupName: groupName, 
                        eventType: eventType
                    }),
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

    const checkOpenFilters = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement

        if (openFilters && target.className.includes('logs-base-container')) {
            setOpenFilters(false)
        }
    }


    const submitFilters = async (data: YupFormData) => {
        console.log(data)
        const params = new URLSearchParams

        for (let item in data) {
                 const key = item as keyof YupFormData
                 const value = data[key]
            if (value && typeof value === 'string') {
                params.set(key, value)
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
                        onClick={(e) => {
                            const target = e.target as HTMLInputElement
                            target.showPicker()
                        }} 
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
                        onClick={(e) => {
                            const target = e.target as HTMLInputElement
                            target.showPicker()
                        }}  
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
                {logs.length > 0 && logs.map((item) => (
                    <GroupLogsCard data={item} key={item.id} showContext={showContextLogs}/>
                ))}
            </div>
        </>
    )
}


export default GroupLogsPage
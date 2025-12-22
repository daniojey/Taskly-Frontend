import { RefObject, useEffect, useRef, useState } from 'react'
import './GroupLogsCard.css'
import DynamicPngIcon from '../UI/icons/DynamicPngIcon'

interface GroupLogsCardProps {
    data: {
        event: string;
        event_type: string;
        anchor_username: string;
        data?: {} | null,
        created_at: string;
        };
    showContext: boolean
}

function GroupLogsCard ({ data, showContext }: GroupLogsCardProps) {
    const {
        event,
        event_type,
        anchor_username,
        data : logData,
        created_at,
    } = data

    const [context, setContext] = useState(showContext)
    const [contentHeight, setContentHeight] = useState<number>(0);
    const contextRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setContentHeight(contextRef.current?.scrollHeight || 0);

    }, [data]);

    useEffect(() => {
        setContext(showContext)
    }, [showContext])

    return (
        <div className='group-logs-card-body'>
            <div className='group-logs-card-title'>
                <h3>{event_type}</h3>
                <DynamicPngIcon 
                iconName='arrowDownWhite'
                height={16}
                width={16} 
                onClick={() => setContext(!context)}/>
            </div>

            <div
            style={{
                height: context ? `${contentHeight}px` : '0px'
            }} 
            ref={contextRef} 
            className={`group-logs-context-body ${context ? 'active' : ''}`}
            >
                <p>{event}</p>

                {anchor_username && (
                    <p>Trigger event: {anchor_username}</p>
                )}
            </div>
            <p id='created_date'>{created_at}</p>
        </div>
    )
}

export default GroupLogsCard
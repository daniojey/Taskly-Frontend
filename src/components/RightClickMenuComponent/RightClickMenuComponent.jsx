import { createPortal } from 'react-dom'
import './RightClickMenuComponent.css'

function RightClickMenuComponent ({ event, setMessage }) {
    const { pageX, pageY } = event
    console.log(pageX, pageY)

    const messageData = new Map()
    messageData.set('id', event.target.id)
    messageData.set('text', event.target.textContent)


    console.log(messageData)

    return (
        createPortal(
            <div className='context-right-menu__body'
                style={{top: `${pageY}px`, left: `${pageX}px`}}>
                <div className='context-right-menu__title'>
                    Context Menu
                </div>

                <div className='context-right-menu__content'>
                    <button onClick={() => setMessage(messageData)}>answer</button>
                </div>
            </div>
        , document.body)
        
    )
}

export default RightClickMenuComponent
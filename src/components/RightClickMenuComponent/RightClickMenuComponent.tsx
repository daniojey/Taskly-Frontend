import { createPortal } from 'react-dom'
import './RightClickMenuComponent.css'
import { MouseEvent, Dispatch, SetStateAction } from 'react'

// Интерфейс для пропсов компонента
interface RightClickMenuComponentProps {
  event: MouseEvent<HTMLElement>; // или конкретного элемента
  setMessage: Dispatch<SetStateAction<Map<string, string | null>>>;
}

function RightClickMenuComponent({ event, setMessage}: RightClickMenuComponentProps) {
    const { pageX, pageY } = event
    console.log(pageX, pageY)

    const target = event.target as HTMLElement

    const messageData = new Map<string, string | null>()
    messageData.set('id', target.id || '')
    messageData.set('text', target.textContent)


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
import './LoaderComponent.css'

function LoaderComponent({ onClose = false }: {onClose?: boolean}) {
    return (
        <div className={`loader-body ${onClose ? 'close' : ''}`}>
            <div className="loader"></div>
        </div>
    )
}

export default LoaderComponent
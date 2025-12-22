import { createPortal } from "react-dom"
import './FullscreenImage.css'
import { useState } from "react"
import DynamicPngIcon from "../UI/icons/DynamicPngIcon"
import { api } from "../../../api"
import { truncateString } from "../../common/truncate"

interface ImageData {
    id: number;
    url: string;
    filename: string;
}

interface FullscreenImageProps<T> {
    imageData: T;
    onClose: () => void;
}

function FullscreenImage ({ imageData, onClose }: FullscreenImageProps<ImageData>) {
    const { id, url, filename} = imageData

    const [closeWindow, setCloseWindow] = useState<boolean>(false)

    const handleClose = () => {
        setCloseWindow(true)

        setTimeout(() => {
            onClose()
        }, 400)
    }

    const handleCloseOverlay = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.className.includes('full-screen-image__body') || target.className.includes('full-screen-image__image')) {
            handleClose()
        }
    }

    const clickDownloadImage = async () => {
        try {
            const response = await api.get(`api/v1/download/${id}/`, {
                responseType: 'blob',
            })

            console.log(response)
            // Извлекаем имя файла из заголовка (Django FileResponse отдаёт его в Content-Disposition)
            let fileName = 'image.jpg'; // дефолт
            if (filename) {
                fileName = filename
            }

            // Создаём Blob и URL
            const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);

            // Скачиваем
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            // Чистим
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('Файл успешно скачан');
        } catch (error) {
            console.error(error)
        }
    }


    console.log(filename)
    console.log(url)
    return (
        <>
            {createPortal(
                <div className={`full-screen-image__body ${closeWindow ? 'close' : ''}`} onClick={handleCloseOverlay}>
                    <div className="full-screen-image__header">
                        <div className="full-screen-image__header-title">{truncateString(filename, 50)}</div>

                        <div className="full-screen-image__haeder-body">
                            <DynamicPngIcon iconName="downloadIcon" onClick={() => clickDownloadImage()}/>

                            <div onClick={() => onClose()}>X</div>
                        </div>
                    </div>
                    <img className="full-screen-image__image" src={url}/>
                </div>
            , document.body)}
        </>
    )   
}

export default FullscreenImage
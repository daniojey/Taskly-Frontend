import { UniqueIdentifier } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from '@dnd-kit/utilities'

import './SortableItem.css'
import { truncateString } from "../../common/truncate"
import DetailTaskWindow from "../../components/DetailTaskWindow/DetailTaskWindow"
import { useState } from "react"

export function SortableItem({
  id,
  content,
  status,
  deadline,
  name,
  activeId,
  data,
}: {
  id: UniqueIdentifier,
  content: string,
  name: string,
  status: string,
  deadline: string,
  activeId: UniqueIdentifier | null
  data: {}
}) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const [openWindow, setOpenWindow] = useState(false)

  const logFunc = (e) =>  {
    console.log('click item', e.target)
  }

  const style = {
    border: "1px solid white",
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <>

    { openWindow && (
      <DetailTaskWindow  data={data} onClose={() => setOpenWindow(false)} />
    )}

    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={activeId === id ? "draggble-item unactive" : 'draggble-item'}
      onClick={() => setOpenWindow(true)}
    >
      <div className="draggble-item__container">
        <span className="draggble-item__name">{truncateString(name, 10)}</span>
        <span className="draggble-item__deadline">{deadline}</span>
      </div>
    </li>

    </>
  )
}
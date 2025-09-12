import { UniqueIdentifier } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from '@dnd-kit/utilities'

import './SortableItem.css'

export function SortableItem({
  id,
  content,
  name,
  activeId,
}: {
  id: UniqueIdentifier,
  content: string,
  name: string,
  activeId: UniqueIdentifier | null
}) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    border: "1px solid white",
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={activeId === id ? "draggble-item unactive" : 'draggble-item'}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500 dark:text-gray-400">
          ⋮
        </span>
        <span className="dark:text-gray-200">{name}</span>
      </div>
    </li>
  )
}
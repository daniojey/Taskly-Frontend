import { UniqueIdentifier } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from '@dnd-kit/utilities'

import './SortableItem.css'
import { truncateString } from "../../common/truncate"
import DetailTaskWindow from "../../components/DetailTaskWindow/DetailTaskWindow"
import { useState } from "react"
import TaskChat from "../../components/TaskChat/TaskChat"
import TaskWindowComponent from "../../components/TaskWindowComponent/TaskWindowComponent"

type TaskStatus = "US" | "NS"| "BS"
interface TaskData {
    created_at: string;
    deadline: string;
    description: string;
    id: number;
    is_performer: boolean
    name: string;
    project: number;
    project_name: string;
    status: TaskStatus
}

export function SortableItem({
  id,
  status,
  deadline,
  name,
  activeId,
  data,
  groupId,
  projectId
}: {
  id: UniqueIdentifier,
  name: string,
  status: string,
  deadline: string,
  activeId: UniqueIdentifier | null
  data: TaskData
  groupId: string | undefined
  projectId: string | undefined
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

  // const logFunc = (e) =>  {
  //   console.log('click item', e.target)
  // }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <>

    { openWindow && groupId && projectId && (
      // <DetailTaskWindow  data={data} onClose={() => setOpenWindow(false)} />
      <TaskWindowComponent onClose={() => setOpenWindow(false)} data={data} groupId={groupId} projectId={projectId}/>
      // <TaskChat data={data} onClose={() => setOpenWindow(false)} groupId={groupId} projectId={projectId}/>
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
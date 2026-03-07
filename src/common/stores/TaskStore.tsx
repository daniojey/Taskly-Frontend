import { create } from "zustand";

interface State {
    taskId: number | null,
    timerActive: boolean
}

interface Actions {
    setTaskId: (taskId: number) => void;
    removeTaskId: () => void;
    setActiveTimer: (data: boolean) => void;
    removeActiveTimer: () => void;
}


export const useTaskTimer = create<State & Actions>((set) => ({
    taskId: null,
    timerActive: false,
    setTaskId: (taskId) => set({ taskId: taskId}),
    removeTaskId: () => set({taskId: null}),
    setActiveTimer: (data) => set({timerActive: data}),
    removeActiveTimer: () => set({ timerActive: false})
}))
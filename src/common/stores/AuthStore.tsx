import { create } from "zustand"

export interface UserItem {
    id: number,
    username: string,
}
interface UserStore {
    user: UserItem | null,
    setUser: (data: UserItem) => void;
    removeUser: () => void
}


export const useUser = create<UserStore>((set) => ({
    user: null,
    setUser: (data) => set((state) => ({ user: data })),
    removeUser: () => set(() => ({ user: null}))
})) 

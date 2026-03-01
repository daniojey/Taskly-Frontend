import { create } from "zustand"


export const useUser = create((set) => ({
    user: null,
    setUser: (data) => set((state) => ({ user: data })),
    removeUser: () => set(() => ({ user: null}))
})) 

export const useLogin = create((set) => ({
    user: null
}))
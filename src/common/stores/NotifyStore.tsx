import { create } from "zustand";

interface MessageObj {
    id: number;
    message: string;
    type: string;
    hidden: boolean;
}

interface Notify {
    notifications: MessageObj[];
}

interface Actions {
    addNotify: (message: string, type: string) => void;
    reduceNotify: () => void;
    removeNotify: (notifyId: number) => void;
}

export const useNotify = create<Notify & Actions>((set, get) => ({
    notifications: [],
    addNotify: (message, type) => {
        const id = Date.now()

        if (get().notifications.length >= 5) {
            const first = get().notifications.at(0)

            set((state) => ({ notifications: state.notifications.map(item => 
                item.id === first?.id
                    ? {...item, hidden: true}
                    : item
            )}))

            setTimeout(() => {
                set((state) => ({ notifications: state.notifications.filter(itemId => itemId.id !== first?.id)}))
            }, 400)
        }

        set((state) => ({ notifications: [...state.notifications, {id, message, type, hidden: false} ] }))

        setTimeout(() => {
            set((state) => ({ notifications: state.notifications.map(item => 
                item.id === id
                    ? {...item, hidden: true}
                    : item
            )}))

            setTimeout(() => {
                set((state) => ({ notifications: state.notifications.filter(itemId => itemId.id !== id)}))
            }, 400)
        }, 20000)
    },
    reduceNotify: () => set((state) => ({ notifications: state.notifications})),
    removeNotify: (notifyId) => {
        set((state) => ({ notifications: state.notifications.map(item => (
            item.id === notifyId
            ? {...item, hidden: true}
            : item
        )) }))

        setTimeout(() => {
            set((state) => ({ notifications: state.notifications.filter(itemId => itemId.id !== notifyId)}))
        }, 400)
    }
}))

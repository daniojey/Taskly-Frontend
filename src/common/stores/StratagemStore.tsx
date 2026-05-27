import { create } from "zustand"


interface StratagemItem {
    id: number,
    name: string,
    url: string,
    combination: number[],
    is_match: boolean,
    is_base?: boolean,
    active: boolean,
}

interface State {
    stratagems: StratagemItem[]
}

interface Actions {
    setStratagemsStore: (stratagems: StratagemItem[]) => void;
    updateStratagemsStore: (stratagem: StratagemItem) => void;
    removeStratagemStore: (stratagem: StratagemItem) => void;
    removeStratagemsStore: () => void;
}

export const useStratagemStore = create<State & Actions>((set, get) => ({
    stratagems: [],
    setStratagemsStore: (stratagems => set({ stratagems: stratagems.filter(item => item.active).map(item => ({...item, is_match: false}))})),
    updateStratagemsStore: ((stratagem: StratagemItem) => set({ stratagems: get().stratagems.map(item => {
        if (item.id === stratagem.id) {
            return {...item, active: stratagem.active}
        } else {
            return item
        }
    })})),
    removeStratagemStore: ((stratagem: StratagemItem) => set({ stratagems: get().stratagems.filter(
        item => item.id !== stratagem.id
    )})),
    removeStratagemsStore: (() => set({ stratagems: []}))
}))
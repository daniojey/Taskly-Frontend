import { create } from "zustand"


interface StratagemItem {
    name: string,
    url: string,
    combination: number[],
    is_match: boolean,
    is_base?: boolean
}

interface State {
    stratagems: StratagemItem[]
}

interface Actions {
    setStratagemsStore: (stratagems: StratagemItem[]) => void;
}

export const useStratagemStore = create<State & Actions>((set) => ({
    stratagems: [],
    setStratagemsStore: (stratagems => set({ stratagems: stratagems.map(item => ({...item, is_match: false}))}))
}))
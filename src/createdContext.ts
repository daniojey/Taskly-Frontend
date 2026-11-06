import { createContext } from "react";
import { UserItem } from "./common/stores/AuthStore";
import { MessageObj } from "./common/stores/NotifyStore";

type AuthContextType = {
  user: UserItem | null
  login: (username: string | null, password: string | null) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  isLogin: boolean
  error: string | null
  showLoading: boolean
  notifications: MessageObj[] | null
  updateNotify: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)
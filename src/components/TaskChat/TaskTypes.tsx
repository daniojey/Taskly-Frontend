interface TaskItem {
    id: number;
    status: "NS" | "BS" | "US";
    created_by: string;
    name: string;
    description: string;
    deadline: string;
    created_at: string;
    updated_at: string;
    performers: [];
}

interface AnswerTo {
    id: number;
    text: string;
}

interface UserItem {
    id: number;
    username: string;
}

interface urlItem {
    id: string;
    url: string;
    filename: string;
}


export interface MessageItem {
    user: UserItem;
    task: TaskItem;
    id: number;
    message: string;
    created_at: string;
    updated_at: string;
    answer_to: AnswerTo;
    images_urls: urlItem[];
}

export interface FileItem {
    index: number;
    file: File;
    preview: Blob | MediaSource;
    name: string;
}
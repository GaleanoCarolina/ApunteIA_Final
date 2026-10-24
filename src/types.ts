export type Subject = {
    id: string;
    user_id: string;
    name: string;
    color: string;
    description: string | null;
    archived: boolean;
    created_at: string;
};
export type Folder = {
    id: string;
    user_id: string;
    subject_id: string;
    parent_id: string | null;
    name: string;
    created_at: string;
};
export type Note = {
    id: string;
    user_id: string;
    subject_id: string | null;
    folder_id: string | null;
    title: string;
    raw_text: string;
    edited_text: string;
    ai_summary: string;
    processing_status: string;
    favorite: boolean;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};
export type Asset = {
    id: string;
    note_id: string;
    user_id: string;
    storage_path: string;
    page_order: number;
    mime: string;
};
export type Flashcard = {
    id: string;
    note_id: string;
    user_id: string;
    question: string;
    answer: string;
    interval_days: number;
    due_at: string;
};

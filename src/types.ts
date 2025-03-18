export interface Task {
  id: number;
  title: string;
  priority: "низкий" | "средний" | "высокий";
  due_date: string;
  created_at: string;
  updated_at: string;
  status: "к выполнению" | "выполняется" | "выполнена" | "отменена";
  creator_id: number;
  creator_role?: string | null; // Добавлено creator_role
  assignee_id: number;
  assignee_name?: string;
  first_name?: string;
  last_name?: string;
}

  
  export type GroupingType = "date" | "responsible" | "none";

export interface AuthContextType {
    token: string | null;
    user: { id: number; first_name: string; last_name: string; manager_id: number | null; hasSubordinates: boolean; } | null; // Данные пользователя
    isLoading: boolean;
    login: (token: string, user: any) => void;
    logout: () => void;
}  
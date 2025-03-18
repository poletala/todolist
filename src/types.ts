export interface Task {
  id: string;
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
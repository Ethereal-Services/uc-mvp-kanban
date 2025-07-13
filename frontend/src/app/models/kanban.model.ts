export interface KanbanTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  labels: string[];
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Date;
  updatedAt: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  tickets: KanbanTicket[];
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  labels: string[];
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  labels?: string[];
  status?: 'todo' | 'in-progress' | 'done';
}

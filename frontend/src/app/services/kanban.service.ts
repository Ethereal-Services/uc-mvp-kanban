import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { KanbanTicket, KanbanColumn, CreateTicketRequest, UpdateTicketRequest } from '../models/kanban.model';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private apiUrl = 'http://localhost:5001/api';
  private ticketsSubject = new BehaviorSubject<KanbanTicket[]>([]);
  public tickets$ = this.ticketsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTickets();
  }

  // Get all tickets
  getTickets(): Observable<KanbanTicket[]> {
    return this.http.get<{tickets: KanbanTicket[]}>(`${this.apiUrl}/tickets`)
      .pipe(map(response => response.tickets));
  }

  // Create a new ticket
  createTicket(ticket: CreateTicketRequest): Observable<KanbanTicket> {
    return this.http.post<{ticket: KanbanTicket}>(`${this.apiUrl}/tickets`, ticket)
      .pipe(map(response => {
        this.loadTickets(); // Refresh the tickets
        return response.ticket;
      }));
  }

  // Update a ticket
  updateTicket(id: string, updates: UpdateTicketRequest): Observable<KanbanTicket> {
    return this.http.put<{ticket: KanbanTicket}>(`${this.apiUrl}/tickets/${id}`, updates)
      .pipe(map(response => {
        this.loadTickets(); // Refresh the tickets
        return response.ticket;
      }));
  }

  // Delete a ticket
  deleteTicket(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tickets/${id}`)
      .pipe(map(() => {
        this.loadTickets(); // Refresh the tickets
      }));
  }

  // Move ticket to different column
  moveTicket(id: string, newStatus: 'todo' | 'in-progress' | 'done'): Observable<KanbanTicket> {
    return this.updateTicket(id, { status: newStatus });
  }

  // Get columns with tickets organized by status
  getColumns(): Observable<KanbanColumn[]> {
    return this.tickets$.pipe(
      map(tickets => {
        const columns: KanbanColumn[] = [
          {
            id: 'todo',
            title: 'To Do',
            status: 'todo',
            tickets: tickets.filter(t => t.status === 'todo')
          },
          {
            id: 'in-progress',
            title: 'In Progress',
            status: 'in-progress',
            tickets: tickets.filter(t => t.status === 'in-progress')
          },
          {
            id: 'done',
            title: 'Done',
            status: 'done',
            tickets: tickets.filter(t => t.status === 'done')
          }
        ];
        return columns;
      })
    );
  }

  // Load tickets from API
  private loadTickets(): void {
    this.getTickets().subscribe(tickets => {
      this.ticketsSubject.next(tickets);
    });
  }

  // For demo purposes - add some mock data if backend not ready
  getMockTickets(): KanbanTicket[] {
    return [
      {
        id: '1',
        title: 'Setup Authentication',
        description: 'Implement JWT authentication with login and register',
        priority: 'high',
        labels: ['backend', 'security'],
        status: 'done',
        createdAt: new Date('2025-07-12'),
        updatedAt: new Date('2025-07-13')
      },
      {
        id: '2',
        title: 'Create User Dashboard',
        description: 'Design and implement user dashboard with profile management',
        priority: 'medium',
        labels: ['frontend', 'ui'],
        status: 'in-progress',
        createdAt: new Date('2025-07-13'),
        updatedAt: new Date('2025-07-13')
      },
      {
        id: '3',
        title: 'Database Migration',
        description: 'Switch from SQLite to MySQL database',
        priority: 'high',
        labels: ['database', 'migration'],
        status: 'done',
        createdAt: new Date('2025-07-13'),
        updatedAt: new Date('2025-07-13')
      },
      {
        id: '4',
        title: 'API Documentation',
        description: 'Create comprehensive API documentation using OpenAPI/Swagger',
        priority: 'low',
        labels: ['documentation', 'api'],
        status: 'todo',
        createdAt: new Date('2025-07-13'),
        updatedAt: new Date('2025-07-13')
      },
      {
        id: '5',
        title: 'Unit Tests',
        description: 'Write unit tests for authentication service and components',
        priority: 'medium',
        labels: ['testing', 'quality'],
        status: 'todo',
        createdAt: new Date('2025-07-13'),
        updatedAt: new Date('2025-07-13')
      }
    ];
  }

  // Initialize with mock data for demo
  initializeMockData(): void {
    this.ticketsSubject.next(this.getMockTickets());
  }
}

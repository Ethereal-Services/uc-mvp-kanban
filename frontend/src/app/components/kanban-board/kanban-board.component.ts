import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { KanbanService } from '../../services/kanban.service';
import { KanbanColumn, KanbanTicket } from '../../models/kanban.model';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { CreateTicketModalComponent } from '../create-ticket-modal/create-ticket-modal.component';
import { EditTicketModalComponent } from '../edit-ticket-modal/edit-ticket-modal.component';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, KanbanColumnComponent, CreateTicketModalComponent, EditTicketModalComponent],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  columns: KanbanColumn[] = [];
  showCreateModal = false;
  showEditModal = false;
  ticketToEdit: KanbanTicket | null = null;
  private destroy$ = new Subject<void>();

  constructor(private kanbanService: KanbanService) {}

  ngOnInit(): void {
    // Subscribe to columns data
    this.kanbanService.getColumns()
      .pipe(takeUntil(this.destroy$))
      .subscribe(columns => {
        this.columns = columns;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCreateTicket(): void {
    this.showCreateModal = true;
  }

  onModalClose(): void {
    this.showCreateModal = false;
  }

  onTicketCreated(): void {
    this.showCreateModal = false;
    // Tickets will be automatically updated through the service
  }

  onTicketMoved(event: { ticketId: string, newStatus: 'todo' | 'in-progress' | 'done' }): void {
    console.log('🎯 Board received ticket moved event:', event);
    
    // Add some validation
    if (!event.ticketId) {
      console.error('❌ No ticket ID provided');
      return;
    }
    
    if (!event.newStatus) {
      console.error('❌ No new status provided');
      return;
    }
    
    console.log('🔄 Calling moveTicket service...');
    this.kanbanService.moveTicket(event.ticketId, event.newStatus).subscribe({
      next: (result) => {
        console.log('✅ Ticket moved successfully:', result);
      },
      error: (error) => {
        console.error('❌ Error moving ticket:', error);
        console.error('Error details:', error.error);
        console.error('Status:', error.status);
      }
    });
  }

  onTicketDeleted(ticketId: string): void {
    this.kanbanService.deleteTicket(ticketId).subscribe();
  }

  onTicketEdit(ticket: KanbanTicket): void {
    this.ticketToEdit = ticket;
    this.showEditModal = true;
  }

  onEditModalClose(): void {
    this.showEditModal = false;
    this.ticketToEdit = null;
  }

  onTicketUpdated(): void {
    this.showEditModal = false;
    this.ticketToEdit = null;
    // Tickets will be automatically updated through the service
  }
}

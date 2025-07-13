import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanColumn, KanbanTicket } from '../../models/kanban.model';
import { KanbanTicketComponent } from '../kanban-ticket/kanban-ticket.component';

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [CommonModule, KanbanTicketComponent],
  templateUrl: './kanban-column.component.html',
  styleUrls: ['./kanban-column.component.scss']
})
export class KanbanColumnComponent {
  @Input() column!: KanbanColumn;
  @Output() ticketMoved = new EventEmitter<{ ticketId: string, newStatus: 'todo' | 'in-progress' | 'done' }>();
  @Output() ticketDeleted = new EventEmitter<string>();
  @Output() ticketEdit = new EventEmitter<KanbanTicket>();

  isDraggedOver = false;

  onTicketMoved(event: { ticketId: string, newStatus: 'todo' | 'in-progress' | 'done' }): void {
    this.ticketMoved.emit(event);
  }

  onTicketDeleted(ticketId: string): void {
    this.ticketDeleted.emit(ticketId);
  }

  onTicketEdit(ticket: KanbanTicket): void {
    this.ticketEdit.emit(ticket);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Set the drop effect
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    
    // Add visual feedback for valid drop zone
    const element = event.currentTarget as HTMLElement;
    if (!element.classList.contains('drag-over')) {
      element.classList.add('drag-over');
      this.isDraggedOver = true;
      console.log('🔵 Drag over column:', this.column.status);
    }
  }

  onDragLeave(event: DragEvent): void {
    // Only remove highlight if we're actually leaving the column
    // Check if the related target is not a child of the column
    const element = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    if (!element.contains(relatedTarget)) {
      element.classList.remove('drag-over');
      this.isDraggedOver = false;
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🟠 Drop event triggered on column:', this.column.status, this.column.title);
    
    // Remove visual feedback
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('drag-over');
    this.isDraggedOver = false;
    
    let ticketId: string | null = null;
    
    // Try to get ticket ID from multiple sources
    if (event.dataTransfer) {
      ticketId = event.dataTransfer.getData('text/plain');
      console.log('🎫 Ticket ID from text/plain:', ticketId);
      
      if (!ticketId) {
        try {
          const jsonData = event.dataTransfer.getData('application/json');
          if (jsonData) {
            const data = JSON.parse(jsonData);
            ticketId = data.id;
            console.log('🎫 Ticket ID from JSON:', ticketId);
          }
        } catch (error) {
          console.log('📝 No JSON data available');
        }
      }
    }
    
    // Fallback to global variable
    if (!ticketId) {
      ticketId = (window as any).draggedTicketId;
      console.log('🎫 Ticket ID from global fallback:', ticketId);
    }
    
    if (ticketId) {
      console.log('🚀 Emitting ticket moved event:', { ticketId, newStatus: this.column.status });
      this.ticketMoved.emit({ ticketId, newStatus: this.column.status });
      
      // Clean up global variable
      (window as any).draggedTicketId = null;
    } else {
      console.error('❌ No ticket ID found in drop data');
    }
  }

  getColumnColor(): string {
    switch (this.column.status) {
      case 'todo':
        return '#e3f2fd';
      case 'in-progress':
        return '#fff3e0';
      case 'done':
        return '#e8f5e8';
      default:
        return '#f5f5f5';
    }
  }

  getColumnHeaderColor(): string {
    switch (this.column.status) {
      case 'todo':
        return '#1976d2';
      case 'in-progress':
        return '#f57c00';
      case 'done':
        return '#388e3c';
      default:
        return '#666';
    }
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanTicket } from '../../models/kanban.model';

@Component({
  selector: 'app-kanban-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kanban-ticket.component.html',
  styleUrls: ['./kanban-ticket.component.scss']
})
export class KanbanTicketComponent {
  @Input() ticket!: KanbanTicket;
  @Output() ticketMoved = new EventEmitter<{ ticketId: string, newStatus: 'todo' | 'in-progress' | 'done' }>();
  @Output() ticketDeleted = new EventEmitter<string>();
  @Output() ticketEdit = new EventEmitter<KanbanTicket>();

  onDragStart(event: DragEvent): void {
    console.log('🟢 Drag started for ticket:', this.ticket.id, this.ticket.title);
    console.log('🟢 Ticket current status:', this.ticket.status);
    
    if (!event.dataTransfer) {
      console.error('❌ No dataTransfer available');
      return;
    }
    
    // Try multiple data formats for better compatibility
    try {
      event.dataTransfer.setData('text/plain', this.ticket.id);
      event.dataTransfer.setData('application/json', JSON.stringify({
        id: this.ticket.id,
        title: this.ticket.title,
        status: this.ticket.status
      }));
      event.dataTransfer.effectAllowed = 'move';
      
      console.log('✅ Drag data set successfully');
    } catch (error) {
      console.error('❌ Error setting drag data:', error);
    }
    
    // Add visual feedback
    const element = event.currentTarget as HTMLElement;
    element.classList.add('dragging');
    
    // Store the ticket ID globally as a backup
    (window as any).draggedTicketId = this.ticket.id;
  }

  onDragEnd(event: DragEvent): void {
    console.log('Drag ended for ticket:', this.ticket.id);
    // Remove visual feedback
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('dragging');
  }

  // Touch support for mobile drag-and-drop
  onTouchStart(event: TouchEvent): void {
    const element = event.currentTarget as HTMLElement;
    element.classList.add('dragging');
  }

  onTouchEnd(event: TouchEvent): void {
    const element = event.currentTarget as HTMLElement;
    element.classList.remove('dragging');
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this ticket?')) {
      this.ticketDeleted.emit(this.ticket.id);
    }
  }

  onEdit(): void {
    this.ticketEdit.emit(this.ticket);
  }

  getPriorityColor(): string {
    switch (this.ticket.priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#666';
    }
  }

  getPriorityIcon(): string {
    switch (this.ticket.priority) {
      case 'high':
        return 'fas fa-exclamation-triangle';
      case 'medium':
        return 'fas fa-minus';
      case 'low':
        return 'fas fa-arrow-down';
      default:
        return 'fas fa-minus';
    }
  }

  getLabelColor(label: string): string {
    // Simple hash function to generate colors for labels
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#f44336', '#607d8b'];
    return colors[Math.abs(hash) % colors.length];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Temporary test method
  testMove(): void {
    console.log('🧪 Testing ticket move without drag-and-drop');
    this.ticketMoved.emit({ ticketId: this.ticket.id, newStatus: 'in-progress' });
  }
}

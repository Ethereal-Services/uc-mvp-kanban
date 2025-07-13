import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { KanbanService } from '../../services/kanban.service';
import { KanbanTicket, UpdateTicketRequest } from '../../models/kanban.model';

@Component({
  selector: 'app-edit-ticket-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-ticket-modal.component.html',
  styleUrls: ['./edit-ticket-modal.component.scss']
})
export class EditTicketModalComponent implements OnInit {
  @Input() ticket!: KanbanTicket;
  @Output() close = new EventEmitter<void>();
  @Output() ticketUpdated = new EventEmitter<void>();

  ticketForm: FormGroup;
  isSubmitting = false;
  error = '';
  newLabel = '';

  priorities = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' }
  ];

  statuses = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private kanbanService: KanbanService
  ) {
    this.ticketForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['medium', [Validators.required]],
      status: ['todo', [Validators.required]],
      labels: [[]]
    });
  }

  ngOnInit(): void {
    if (this.ticket) {
      this.ticketForm.patchValue({
        title: this.ticket.title,
        description: this.ticket.description,
        priority: this.ticket.priority,
        status: this.ticket.status,
        labels: [...this.ticket.labels]
      });
    }
  }

  get labels(): string[] {
    return this.ticketForm.get('labels')?.value || [];
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      this.isSubmitting = true;
      this.error = '';

      const updates: UpdateTicketRequest = {};
      
      // Only include changed fields
      if (this.ticketForm.value.title !== this.ticket.title) {
        updates.title = this.ticketForm.value.title;
      }
      if (this.ticketForm.value.description !== this.ticket.description) {
        updates.description = this.ticketForm.value.description;
      }
      if (this.ticketForm.value.priority !== this.ticket.priority) {
        updates.priority = this.ticketForm.value.priority;
      }
      if (this.ticketForm.value.status !== this.ticket.status) {
        updates.status = this.ticketForm.value.status;
      }
      if (JSON.stringify(this.ticketForm.value.labels) !== JSON.stringify(this.ticket.labels)) {
        updates.labels = this.ticketForm.value.labels;
      }

      // Only make API call if there are changes
      if (Object.keys(updates).length > 0) {
        this.kanbanService.updateTicket(this.ticket.id, updates).subscribe({
          next: () => {
            this.ticketUpdated.emit();
            this.isSubmitting = false;
          },
          error: (error) => {
            this.error = error.error?.message || 'Failed to update ticket';
            this.isSubmitting = false;
          }
        });
      } else {
        // No changes, just close
        this.close.emit();
      }
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onAddLabel(): void {
    if (this.newLabel.trim() && !this.labels.includes(this.newLabel.trim())) {
      const currentLabels = this.labels;
      currentLabels.push(this.newLabel.trim());
      this.ticketForm.patchValue({ labels: currentLabels });
      this.newLabel = '';
    }
  }

  onRemoveLabel(label: string): void {
    const currentLabels = this.labels.filter(l => l !== label);
    this.ticketForm.patchValue({ labels: currentLabels });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onAddLabel();
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
}

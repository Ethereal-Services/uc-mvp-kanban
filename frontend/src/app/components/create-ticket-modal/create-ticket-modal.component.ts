import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { KanbanService } from '../../services/kanban.service';
import { CreateTicketRequest } from '../../models/kanban.model';

@Component({
  selector: 'app-create-ticket-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-ticket-modal.component.html',
  styleUrls: ['./create-ticket-modal.component.scss']
})
export class CreateTicketModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() ticketCreated = new EventEmitter<void>();

  ticketForm: FormGroup;
  isSubmitting = false;
  error = '';
  newLabel = '';

  priorities = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private kanbanService: KanbanService
  ) {
    this.ticketForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['medium', [Validators.required]],
      labels: [[]]
    });
  }

  get labels(): string[] {
    return this.ticketForm.get('labels')?.value || [];
  }

  onSubmit(): void {
    if (this.ticketForm.valid) {
      this.isSubmitting = true;
      this.error = '';

      const ticketData: CreateTicketRequest = {
        title: this.ticketForm.value.title,
        description: this.ticketForm.value.description,
        priority: this.ticketForm.value.priority,
        labels: this.ticketForm.value.labels
      };

      this.kanbanService.createTicket(ticketData).subscribe({
        next: () => {
          this.ticketCreated.emit();
          this.isSubmitting = false;
        },
        error: (error) => {
          this.error = error.error?.message || 'Failed to create ticket';
          this.isSubmitting = false;
        }
      });
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

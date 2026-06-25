import { CATEGORIES, PRIORITIES, STATUSES, READINESS, AGENTS } from '../../data/constants';
import { Input, Textarea, Select, Button } from '../ui/Card';

export function TicketForm({ initialData, onSubmit, onCancel, submitLabel = 'Save', showAssignee, showStatus, showReadiness, showResolution }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
      title: form.get('title'),
      description: form.get('description'),
      category: form.get('category'),
      priority: form.get('priority'),
      assignee: form.get('assignee') || '',
      status: form.get('status'),
      readiness: form.get('readiness'),
      resolutionNotes: form.get('resolutionNotes') || '',
    };

    if (!data.title?.trim()) return onSubmit(null, 'Title is required.');
    if (!data.description?.trim()) return onSubmit(null, 'Description is required.');
    if (!data.category) return onSubmit(null, 'Category is required.');
    if (!data.priority) return onSubmit(null, 'Priority is required.');

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        name="title"
        defaultValue={initialData?.title || ''}
        placeholder="Brief summary of the issue"
        required
      />
      <Textarea
        label="Description"
        name="description"
        defaultValue={initialData?.description || ''}
        placeholder="Detailed description of the request..."
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Category"
          name="category"
          defaultValue={initialData?.category || CATEGORIES[0]}
          options={CATEGORIES}
          required
        />
        <Select
          label="Priority"
          name="priority"
          defaultValue={initialData?.priority || 'Medium'}
          options={PRIORITIES}
          required
        />
      </div>

      {showAssignee && (
        <Select
          label="Assignee"
          name="assignee"
          defaultValue={initialData?.assignee || ''}
          options={[{ value: '', label: 'Unassigned' }, ...AGENTS.map((a) => ({ value: a, label: a }))]}
        />
      )}

      {showStatus && (
        <Select
          label="Status"
          name="status"
          defaultValue={initialData?.status || 'New'}
          options={STATUSES}
        />
      )}

      {showReadiness && (
        <Select
          label="Readiness"
          name="readiness"
          defaultValue={initialData?.readiness || 'Not Ready'}
          options={READINESS}
        />
      )}

      {showResolution && (
        <Textarea
          label="Resolution Notes"
          name="resolutionNotes"
          defaultValue={initialData?.resolutionNotes || ''}
          placeholder="Describe how the issue was resolved..."
        />
      )}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReviewStatusBadge } from '../ui/Badge';
import { Button, Input, Select, Textarea } from '../ui/Card';
import { Modal, ConfirmDialog } from '../ui/Modal';
import { REVIEW_STATUSES, VERIFICATION_STATUSES } from '../../data/constants';
import { formatDate } from '../../utils/ticketHelpers';

export function VerificationRecordsTable() {
  const {
    verificationRecords,
    createVerificationRecord,
    updateVerificationRecord,
    deleteVerificationRecord,
    currentUser,
  } = useApp();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
      featureName: form.get('featureName'),
      reviewStatus: form.get('reviewStatus'),
      verificationStatus: form.get('verificationStatus'),
      reviewer: form.get('reviewer') || currentUser,
      notes: form.get('notes'),
      date: form.get('date') || new Date().toISOString(),
    };

    if (!data.featureName?.trim()) return;

    if (editing) {
      updateVerificationRecord(editing.id, data);
    } else {
      createVerificationRecord(data);
    }

    setFormOpen(false);
    setEditing(null);
  };

  const openEdit = (record) => {
    setEditing(record);
    setFormOpen(true);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus size={16} /> Add Record
        </Button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-900/50">
                <th className="px-4 py-3 font-medium text-slate-500">Feature Name</th>
                <th className="px-4 py-3 font-medium text-slate-500">Review Status</th>
                <th className="px-4 py-3 font-medium text-slate-500">Verification</th>
                <th className="px-4 py-3 font-medium text-slate-500">Reviewer</th>
                <th className="px-4 py-3 font-medium text-slate-500">Notes</th>
                <th className="px-4 py-3 font-medium text-slate-500">Date</th>
                <th className="px-4 py-3 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {verificationRecords.map((record) => (
                <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium">{record.featureName}</td>
                  <td className="px-4 py-3">
                    <ReviewStatusBadge status={record.reviewStatus} />
                  </td>
                  <td className="px-4 py-3">{record.verificationStatus}</td>
                  <td className="px-4 py-3">{record.reviewer}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-slate-600 dark:text-slate-400">
                    {record.notes || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(record.date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" onClick={() => openEdit(record)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" onClick={() => setDeleteId(record.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!verificationRecords.length && (
          <p className="p-8 text-center text-sm text-slate-500">No verification records yet.</p>
        )}
      </div>

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        title={editing ? 'Edit Verification Record' : 'New Verification Record'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Feature Name"
            name="featureName"
            defaultValue={editing?.featureName || ''}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Review Status"
              name="reviewStatus"
              defaultValue={editing?.reviewStatus || 'Needs Revision'}
              options={REVIEW_STATUSES}
            />
            <Select
              label="Verification Status"
              name="verificationStatus"
              defaultValue={editing?.verificationStatus || 'Pending'}
              options={VERIFICATION_STATUSES}
            />
          </div>
          <Input
            label="Reviewer"
            name="reviewer"
            defaultValue={editing?.reviewer || currentUser}
          />
          <Textarea
            label="Notes"
            name="notes"
            defaultValue={editing?.notes || ''}
            rows={3}
          />
          <Input
            label="Verification Date"
            name="date"
            type="date"
            defaultValue={editing?.date ? editing.date.slice(0, 10) : new Date().toISOString().slice(0, 10)}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? 'Save Changes' : 'Create Record'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          deleteVerificationRecord(deleteId);
          setDeleteId(null);
        }}
        title="Delete Record"
        message="Are you sure you want to delete this verification record?"
        confirmLabel="Delete"
        danger
      />
    </>
  );
}

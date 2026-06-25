import { useState } from 'react';
import { Lock, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/ticketHelpers';
import { Button, Textarea } from '../ui/Card';

export function TicketComments({ ticket, canAddInternal }) {
  const { addComment, currentUser } = useApp();
  const [content, setContent] = useState('');
  const [type, setType] = useState('public');
  const [error, setError] = useState('');

  const visibleComments = ticket.comments
    .filter((c) => canAddInternal || c.type === 'public')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = addComment(ticket.id, content, type, currentUser);
    if (result.success) {
      setContent('');
      setError('');
    } else {
      setError(result.error);
    }
  };

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold">Comments</h3>

      <div className="mb-4 space-y-3">
        {visibleComments.length === 0 && (
          <p className="text-sm text-slate-500">No comments yet.</p>
        )}
        {visibleComments.map((comment) => (
          <div
            key={comment.id}
            className={`rounded-lg border p-3 ${
              comment.type === 'internal'
                ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
                : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
            }`}
          >
            <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
              {comment.type === 'internal' ? (
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                  <Lock size={12} /> Internal Note
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <MessageCircle size={12} /> Public
                </span>
              )}
              <span>·</span>
              <span>{comment.author}</span>
              <span>·</span>
              <span>{formatDateTime(comment.createdAt)}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {canAddInternal && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('public')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                type === 'public'
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Public Comment
            </button>
            <button
              type="button"
              onClick={() => setType('internal')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                type === 'internal'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Internal Note
            </button>
          </div>
        )}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={type === 'internal' ? 'Add an internal note...' : 'Add a public comment...'}
          rows={3}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" disabled={!content.trim()}>
          Add {type === 'internal' ? 'Internal Note' : 'Comment'}
        </Button>
      </form>
    </div>
  );
}

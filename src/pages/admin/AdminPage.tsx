import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ApiError,
  blockAuthor,
  deleteComment,
  setCommentHidden,
  unblockAuthor,
} from '@/api';
import { ActionLog } from '@/components/admin/ActionLog';
import { AdminSection } from '@/components/admin/AdminSection';
import { AdminCommentRow } from '@/components/admin/AdminCommentRow';
import { BlockedAuthorList } from '@/components/admin/BlockedAuthorList';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ScrapeRunList } from '@/components/admin/ScrapeRunList';
import { Pagination } from '@/components/comments/Pagination';
import { PageShell } from '@/components/layout/PageShell';
import { useAdminData } from '@/hooks/useAdminData';
import type { AdminComment, PendingAction } from '@/types';

type Dialog =
  | { kind: 'delete'; commentId: number }
  | { kind: 'block'; authorId: number; commentId: number }
  | null;

export function AdminPage() {
  const [query, setQuery] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [actionError, setActionError] = useState('');
  const [dialog, setDialog] = useState<Dialog>(null);
  const navigate = useNavigate();

  const onUnauthorized = useCallback(() => navigate('/admin/login'), [navigate]);
  const { comments, blocked, actions, runs, totalPages, reload } = useAdminData({
    page,
    q: query,
    author,
    source,
    onClamp: setPage,
    onUnauthorized,
  });

  const reloadIfChanged = async (result: unknown) => {
    if (
      result !== null &&
      typeof result === 'object' &&
      'changed' in result &&
      result.changed === false
    ) {
      return;
    }
    await reload();
  };

  const handleActionError = (caught: unknown) => {
    if (caught instanceof ApiError && caught.status === 401) {
      navigate('/admin/login');
      return;
    }
    setActionError(caught instanceof ApiError ? caught.message : 'Action failed.');
  };

  const toggleHidden = async (comment: AdminComment) => {
    setActionError('');
    setPending({ kind: 'hide', commentId: comment.id });
    try {
      const result = await setCommentHidden(comment.id, !comment.isHidden);
      await reloadIfChanged(result);
    } catch (caught) {
      handleActionError(caught);
    } finally {
      setPending(null);
      setDialog(null);
    }
  };

  const confirmDialog = async () => {
    if (!dialog) return;
    const current = dialog;
    setActionError('');
    setPending({ kind: current.kind, commentId: current.commentId });
    try {
      if (current.kind === 'delete') {
        await deleteComment(current.commentId);
        await reload();
      } else {
        const result = await blockAuthor(current.authorId);
        await reloadIfChanged(result);
      }
    } catch (caught) {
      handleActionError(caught);
    } finally {
      setPending(null);
      setDialog(null);
    }
  };

  const unblock = async (id: number) => {
    setActionError('');
    setPending({ kind: 'unblock', authorId: id });
    try {
      const result = await unblockAuthor(id);
      await reloadIfChanged(result);
    } catch (caught) {
      handleActionError(caught);
    } finally {
      setPending(null);
      setDialog(null);
    }
  };

  const search = (event: FormEvent) => {
    event.preventDefault();
    if (page !== 1) {
      setPage(1);
      return;
    }
    void reload();
  };

  const pendingAuthorId = pending?.kind === 'unblock' ? pending.authorId : null;

  return (
    <>
      <PageShell bar="admin" mainClassName="admin-page">
        <div className="admin-heading">
          <p className="eyebrow">Owner tools</p>
          <h1>Admin</h1>
        </div>
        {actionError ? <p role="alert">{actionError}</p> : null}

        <AdminSection title="Comments">
        <form onSubmit={search} className="admin-search">
          <div className="field">
            <label htmlFor="admin-q">Search comments</label>
            <input
              id="admin-q"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="admin-author">Author</label>
            <input
              id="admin-author"
              type="search"
              value={author}
              onChange={(event) => {
                setAuthor(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="admin-source">Source</label>
            <input
              id="admin-source"
              type="search"
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <button type="submit">Search</button>
        </form>

        <ul aria-label="Admin comments" className="admin-list" aria-live="polite">
          {comments.map((comment) => {
            const rowPending =
              pending !== null && 'commentId' in pending && pending.commentId === comment.id;
            return (
              <AdminCommentRow
                key={comment.id}
                comment={comment}
                pending={rowPending}
                onToggleHidden={() => void toggleHidden(comment)}
                onDelete={() => setDialog({ kind: 'delete', commentId: comment.id })}
                onBlock={() =>
                  setDialog({
                    kind: 'block',
                    authorId: comment.author.id,
                    commentId: comment.id,
                  })
                }
              />
            );
          })}
        </ul>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </AdminSection>

        <div className="admin-grid">
          <AdminSection title="Blocked authors">
          <BlockedAuthorList
            authors={blocked}
            pendingAuthorId={pendingAuthorId}
            onUnblock={(id) => void unblock(id)}
          />
          </AdminSection>

          <AdminSection title="Action log">
          <ActionLog actions={actions} />
          </AdminSection>

          <AdminSection title="Collection status">
          <ScrapeRunList runs={runs} />
          </AdminSection>
        </div>
      </PageShell>
      {dialog ? (
        <ConfirmDialog
          message={dialog.kind === 'delete' ? 'Delete this comment?' : 'Block this author?'}
          onConfirm={() => void confirmDialog()}
          onCancel={() => setDialog(null)}
          busy={pending !== null}
        />
      ) : null}
    </>
  );
}

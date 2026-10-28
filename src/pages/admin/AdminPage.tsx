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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminData } from '@/hooks/useAdminData';
import type { AdminComment, PendingAction } from '@/types';
import { en } from '@/locales/en';

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
    setActionError(caught instanceof ApiError ? caught.message : en.admin.actionFailed);
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
      <PageShell
        bar="admin"
        mainClassName="mx-auto w-full max-w-[1180px] px-[clamp(1rem,3vw,2rem)] pb-14 pt-8"
      >
        <div className="mb-6">
          <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-primary">
            {en.admin.toolsEyebrow}
          </p>
          <h1 className="m-0 text-[clamp(1.8rem,2.8vw,2.35rem)] font-bold tracking-[-0.035em]">
            {en.admin.title}
          </h1>
        </div>
        {actionError ? (
          <p
            className="mb-4 rounded-sm border border-[#f0cbc7] bg-[#fef3f2] px-4 py-3 text-sm font-semibold text-[#b42318]"
            role="alert"
          >
            {actionError}
          </p>
        ) : null}

        <AdminSection title={en.admin.comments}>
        <form
          onSubmit={search}
          className="mb-4 grid grid-cols-[repeat(3,minmax(0,1fr))_auto] items-end gap-3 max-[900px]:grid-cols-2 max-[767px]:grid-cols-1"
        >
          <div className="grid gap-1">
            <label
              className="text-[0.7rem] font-bold uppercase tracking-wide text-muted-foreground"
              htmlFor="admin-q"
            >
              {en.search.label}
            </label>
            <Input
              id="admin-q"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="grid gap-1">
            <label
              className="text-[0.7rem] font-bold uppercase tracking-wide text-muted-foreground"
              htmlFor="admin-author"
            >
              {en.admin.authors}
            </label>
            <Input
              id="admin-author"
              type="search"
              value={author}
              onChange={(event) => {
                setAuthor(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="grid gap-1">
            <label
              className="text-[0.7rem] font-bold uppercase tracking-wide text-muted-foreground"
              htmlFor="admin-source"
            >
              {en.admin.source}
            </label>
            <Input
              id="admin-source"
              type="search"
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button
            type="submit"
            className="border-primary bg-primary text-white hover:border-[#0a4656] hover:bg-[#0a4656] hover:text-white max-[900px]:col-span-full max-[900px]:justify-self-start max-[767px]:w-full"
          >
            {en.search.submit}
          </Button>
        </form>

        <ul
          aria-label={en.accessibility.adminCommentsList}
          className="m-0 grid list-none gap-2 p-0"
          aria-live="polite"
        >
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

        <div className="grid grid-cols-3 gap-[1.15rem] max-[1023px]:grid-cols-2 max-[767px]:grid-cols-1 max-[1023px]:[&>section:last-child]:col-span-full">
          <AdminSection className="mb-0" title={en.admin.blockedAuthors}>
          <BlockedAuthorList
            authors={blocked}
            pendingAuthorId={pendingAuthorId}
            onUnblock={(id) => void unblock(id)}
          />
          </AdminSection>

          <AdminSection className="mb-0" title={en.admin.actionLog}>
          <ActionLog actions={actions} />
          </AdminSection>

          <AdminSection className="mb-0" title={en.admin.collectionStatus}>
          <ScrapeRunList runs={runs} />
          </AdminSection>
        </div>
      </PageShell>
      {dialog ? (
        <ConfirmDialog
          message={
            dialog.kind === 'delete' ? en.admin.deleteConfirmation : en.admin.blockConfirmation
          }
          onConfirm={() => void confirmDialog()}
          onCancel={() => setDialog(null)}
          busy={pending !== null}
        />
      ) : null}
    </>
  );
}

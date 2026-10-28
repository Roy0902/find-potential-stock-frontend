import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CompositionEvent,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router';
import { searchPath } from '@/lib/urls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { en } from '@/locales/en';

/** Wait for a typing pause before updating the URL and running the search. */
const LIVE_SEARCH_DELAY_MS = 300;

export function SearchBar({
  initial = '',
  activeForum,
}: {
  initial?: string;
  activeForum?: string;
}) {
  const [value, setValue] = useState(initial);
  const navigate = useNavigate();

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValue = useRef(value);
  const lastRequested = useRef(initial);
  const composing = useRef(false);

  latestValue.current = value;

  const cancelPending = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  // Reflect URL changes made by the back/forward buttons or a forum link, but
  // never overwrite what the visitor is currently typing.
  useEffect(() => {
    if (latestValue.current.trim() === initial) return;
    if (lastRequested.current === initial) return;
    setValue(initial);
  }, [initial]);

  // A forum link changes the filter; drop any queued live search for the old one.
  useEffect(() => {
    cancelPending();
  }, [activeForum]);

  useEffect(() => cancelPending, []);

  const go = (term: string, replace: boolean) => {
    const trimmed = term.trim();
    lastRequested.current = trimmed;
    navigate(searchPath(trimmed, activeForum), { replace, preventScrollReset: true });
  };

  const schedule = (term: string) => {
    cancelPending();
    timer.current = setTimeout(() => {
      timer.current = null;
      go(term, true);
    }, LIVE_SEARCH_DELAY_MS);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    cancelPending();
    go(value, false);
  };

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setValue(next);
    // Wait for IME composition (for example Chinese input) to finish.
    if (composing.current) return;
    schedule(next);
  };

  const compositionStart = () => {
    composing.current = true;
    cancelPending();
  };

  const compositionEnd = (event: CompositionEvent<HTMLInputElement>) => {
    composing.current = false;
    schedule(event.currentTarget.value);
  };

  return (
    <form
      role="search"
      className="flex w-full min-w-0 items-center gap-2 justify-self-stretch max-[1100px]:max-w-[34rem] max-[900px]:max-w-none max-[767px]:col-span-full max-[767px]:row-start-2 max-[767px]:max-w-none max-[480px]:flex-wrap"
      onSubmit={submit}
    >
      <label className="sr-only" htmlFor="search-input">
        {en.search.label}
      </label>
      <Input
        id="search-input"
        type="search"
        className="min-w-0 flex-1 max-[480px]:basis-full"
        placeholder={en.search.placeholder}
        value={value}
        onChange={change}
        onCompositionStart={compositionStart}
        onCompositionEnd={compositionEnd}
      />
      <Button
        type="submit"
        className="min-h-[2.6rem] flex-none border-primary bg-primary px-[1.1rem] text-white hover:border-[#0a4656] hover:bg-[#0a4656] hover:text-white max-[480px]:w-full"
      >
        {en.search.submit}
      </Button>
    </form>
  );
}

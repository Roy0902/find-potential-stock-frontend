import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPath } from '@/lib/urls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SearchBar({
  initial = '',
  activeForum,
}: {
  initial?: string;
  activeForum?: string;
}) {
  const [value, setValue] = useState(initial);
  const navigate = useNavigate();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(searchPath(value.trim(), activeForum));
  };

  return (
    <form
      role="search"
      className="flex w-full min-w-0 items-center gap-2 justify-self-stretch max-[1100px]:max-w-[34rem] max-[900px]:max-w-none max-[767px]:col-span-full max-[767px]:row-start-2 max-[767px]:max-w-none max-[480px]:flex-wrap"
      onSubmit={submit}
    >
      <label className="sr-only" htmlFor="search-input">
        Search comments
      </label>
      <Input
        id="search-input"
        type="search"
        className="min-w-0 flex-1 max-[480px]:basis-full"
        placeholder="Search by keyword or stock"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button
        type="submit"
        className="min-h-[2.6rem] flex-none border-primary bg-primary px-[1.1rem] text-white hover:border-[#0a4656] hover:bg-[#0a4656] hover:text-white max-[480px]:w-full"
      >
        Search
      </Button>
    </form>
  );
}

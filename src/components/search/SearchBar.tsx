import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPath } from '@/lib/urls';

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
    <form role="search" className="search" onSubmit={submit}>
      <label htmlFor="search-input">Search comments</label>
      <input
        id="search-input"
        type="search"
        placeholder="Search by keyword or stock"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}

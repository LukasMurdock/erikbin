import { Link, useLoaderData } from 'remix';
import { getPastes } from '~/paste';
import type { PasteProps } from '~/paste';

export const loader = () => {
  return getPastes();
};

export default function Pastes() {
  const pastes = useLoaderData<PasteProps[]>();
  console.log(pastes);
  return (
    <div>
      <h1>Pastes</h1>
      <ul>
        <div>{JSON.stringify(pastes)}</div>
        {/* {pastes.map((paste) => (
          <li key={paste.uuid}>
            <Link to={paste.name}>
              <strong>{paste.name}</strong>
            </Link>
            <div>{paste.text}</div>
          </li>
        ))} */}
      </ul>
    </div>
  );
}

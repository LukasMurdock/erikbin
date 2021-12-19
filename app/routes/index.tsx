import { Link, useLoaderData } from 'remix';
import type { MetaFunction } from 'remix';
import { getPastes } from '~/paste';
import type { PasteProps } from '~/paste';

// https://remix.run/api/conventions#meta
export let meta: MetaFunction = () => {
  return {
    title: 'Remix Starter',
    description: 'Welcome to remix!',
  };
};

export const loader = () => {
  return getPastes();
};

// TODO: make a nested route, styled like notes
export default function Pastes() {
  const pastes = useLoaderData<PasteProps[]>();
  console.log(pastes);
  return (
    <div className="w-full px-6 lg:px-0">
      <section className="w-full py-4">
        <h2 className="text-2xl leading-7 text-stone-900 sm:text-3xl">
          Pastes
        </h2>
        {/* <p>{JSON.stringify(pastes)}</p> */}
        {pastes.length < 1 ? (
          <div className="mt-6">
            <Link
              to="/pastes/new"
              className="inline-flex items-center px-4 py-2 text-base text-white no-underline transition-colors bg-black border border-black rounded-md shadow-sm hover:bg-white hover:text-black hover:border hover:ring-offset-2 hover:ring-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              New Paste
            </Link>
          </div>
        ) : (
          <ul>
            {pastes.map((paste) => (
              <li key={paste.metadata.uuid}>
                <Link to={paste.metadata.slug}>
                  <strong>{paste.metadata.title}</strong>
                </Link>
                <p>
                  {paste.metadata.createdAt} &middot;{' '}
                  {paste.metadata.views ? paste.metadata.views : '---'} &middot;{' '}
                  {paste.metadata.lines} lines
                </p>
                {/* <div>{paste.text}</div> */}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

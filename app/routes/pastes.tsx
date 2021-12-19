import { Link, Outlet, useLoaderData, useParams } from 'remix';
import type { MetaFunction } from 'remix';
import { getPastes } from '~/paste';
import type { PasteProps } from '~/paste';
import { formatDuration, intervalToDuration } from 'date-fns/esm';
import formatTimeSince from '~/utils/formatDuration';

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

export default function Pastes() {
  const pastes = useLoaderData<PasteProps[]>();
  /*
    useParams doesn’t provide "/new" when user is viewing outlet.
    useLocation does.
    const { pathname } = useLocation();
    const path =
        pathname === '/pastes/'
        ? '/'
        : pathname === '/pastes/new'
        ? 'new'
        : pathname.split('/pastes/')[1];
  */
  const { slug } = useParams();

  return (
    <div className="w-full px-6 sm:grid sm:grid-cols-12 lg:px-0">
      <section className="max-h-screen min-h-screen overflow-y-scroll sm:col-span-4 sm:border-r">
        <div className="px-6 pb-4">
          <div className="sticky top-0 z-10 flex justify-between pt-4 pb-6 bg-white bg-opacity-95">
            <h2 className="text-2xl leading-7 text-stone-900 sm:text-3xl">
              Pastes
            </h2>
            <div>
              <Link
                to="/pastes/new"
                className="inline-flex items-center px-4 py-2 text-sm text-black no-underline transition-colors bg-white border rounded-md shadow-sm border-stone-400 border-opacity-30 hover:border-black hover:ring-offset-2 hover:ring-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 mr-1 sm:hidden"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                    clipRule="evenodd"
                  />
                </svg>
                New Paste
              </Link>
            </div>
          </div>
          {/* <p>{JSON.stringify(pastes)}</p> */}
          {/* <div>
            <div>
              <label htmlFor="search" className="sr-only">
                Search Pastes
              </label>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full px-4 rounded-full shadow-sm border-stone-300 focus:ring-black focus:border-black sm:text-sm"
                placeholder="Search"
              />
            </div>
          </div> */}
          <div className="relative">
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
              <ul className="space-y-1">
                {pastes.map((paste) => (
                  <li key={paste.metadata.uuid}>
                    <Link
                      to={paste.metadata.slug}
                      className={
                        slug === paste.metadata.slug
                          ? 'p-4 rounded-lg text-stone-900 bg-stone-200 block'
                          : 'p-4 rounded-lg hover:text-stone-900 hover:bg-stone-100 text-stone-700 block'
                      }
                    >
                      <h3 className="text-sm font-medium">
                        {paste.metadata.title}
                      </h3>
                      <p className="text-sm text-stone-500">
                        {formatTimeSince(new Date(paste.metadata.createdAt))}{' '}
                        {/* {paste.metadata.createdAt} */}
                        &middot;{' '}
                        {/* {paste.metadata.views ? paste.metadata.views : '---'}{' '}views */}
                        {paste.metadata.lines} lines
                        {paste.metadata.language === 'none' ? null : (
                          <span> &middot; {paste.metadata.language}</span>
                        )}{' '}
                      </p>
                    </Link>
                    {/* <div>{paste.text}</div> */}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      <section className="hidden col-span-8 px-6 py-4 sm:block">
        <Outlet />
      </section>
    </div>
  );
}

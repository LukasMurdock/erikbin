import { Link, useLoaderData } from 'remix';
// import { getPastes } from '~/paste';
// import type { PasteProps } from '~/paste';

// export const loader = () => {
//   return getPastes();
// };

export default function Pastes() {
  return (
    <div className="mt-6">
      <Link
        to="/pastes/new"
        className="no-underline transition-colors inline-flex items-center px-4 py-2 border text-base rounded-md shadow-sm text-white bg-black hover:bg-white hover:text-black hover:border border-black hover:ring-offset-2 hover:ring-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
      >
        New Paste
      </Link>
    </div>
  );
}

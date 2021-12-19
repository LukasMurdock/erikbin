import { useLoaderData } from 'remix';
import type { LoaderFunction } from 'remix';
import { getPaste } from '~/paste';
import Highlight, { defaultProps } from 'prism-react-renderer';
import nightOwl from 'prism-react-renderer/themes/nightOwl';
import formatTimeSince from '~/utils/formatDuration';

export const loader: LoaderFunction = async ({ params }) => {
  if (typeof params.slug !== 'string') {
    return {
      formError: `No slug provided.`,
    };
  }
  return getPaste(params.slug);
};

export default function PasteSlug() {
  const paste = useLoaderData();
  return (
    <div>
      <div className="pb-6">
        <h2 className="text-2xl leading-7 text-stone-800 sm:text-3xl">
          {paste.metadata.title}
        </h2>
        <p className="text-stone-500">
          {formatTimeSince(new Date(paste.metadata.createdAt))}{' '}
          {/* {paste.metadata.createdAt} */}
          &middot;{' '}
          {/* {paste.metadata.views ? paste.metadata.views : '---'}{' '}views */}
          {paste.metadata.lines} lines
          {paste.metadata.language === 'none' ? null : (
            <span> &middot; {paste.metadata.language}</span>
          )}{' '}
        </p>
      </div>

      {paste.metadata.language === 'none' ? (
        <div className="px-6 py-4 whitespace-pre-wrap rounded-lg bg-stone-50">
          {paste.value}
        </div>
      ) : (
        <Highlight
          {...defaultProps}
          theme={nightOwl}
          code={paste.value}
          language={paste.metadata.language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={className}
              style={{
                ...style,
                borderRadius: '0.5rem',
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem',
                paddingTop: '1rem',
                paddingBottom: '1rem',
              }}
            >
              {tokens.map((line, i) => (
                <div {...getLineProps({ line, key: i })}>
                  <span className="mr-3 select-none opacity-30">{i + 1}</span>
                  {line.map((token, key) => (
                    <span {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      )}

      {/* <SyntaxHighlighter language="typescript" style={materialDark}>
        {paste.value}
      </SyntaxHighlighter> */}
      {/* <div className="py-20">
        <p>{JSON.stringify(paste)}</p>
      </div> */}
    </div>
  );
}

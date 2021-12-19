import { useTransition, useActionData, Form, json, redirect } from 'remix';
import { createPaste } from '~/paste';
import { v5 as uuidv5 } from 'uuid';
// import { v4 as uuidv4 } from 'uuid';
import type { ActionFunction } from 'remix';
import { addMinutes } from 'date-fns';
import { addDays, addHours, addMonths } from 'date-fns/esm';
import { useState } from 'react';
import Highlight, { defaultProps } from 'prism-react-renderer';
import Editor from 'react-simple-code-editor';
import { LiveProvider, LiveEditor } from 'react-live';

// react-ace
// prism-react-renderer
// https://github.com/FormidableLabs/react-live
// https://github.com/FormidableLabs/react-live/blob/master/src/components/Editor/index.js

// https://github.com/FormidableLabs/react-live/blob/master/src/components/Editor/index.js
// const CodeEditor = (props: any) => {

//   const [state, setState] = useState({
//     code: props.code || '',
//   });
// };

const ExpandingTextArea = (
  props: React.DetailedHTMLProps<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
) => {
  const lineHeight = 28;
  const [scrollHeight, setScrollHeight] = useState(lineHeight * 10);
  return (
    <textarea
      onChange={(e) => setScrollHeight(e.target.scrollHeight)}
      style={{ height: `${scrollHeight + 2}px` }}
      {...props}
    />
  );
};

type FormDatasetProps = {
  [key: string]: string | number | Date;
  title: string;
  slug: string;
  ip: string; // generated server side?
  uuid: string; // generated server side?
  createdAt: Date; // generated server side?
  expiration: Date; // transformed server side
  text: string;
};

const ExpirationSelect = {
  name: 'expiration',
  options: [
    { value: 'read', text: 'Read' },
    { value: 'minute', text: 'Minute' },
    { value: 'hour', text: 'Hour' },
    { value: 'day', text: 'Day' },
    { value: 'month', text: 'Month' },
    { value: 'never', text: 'Month' },
  ],
};

type ExpirationTypes = 'read' | 'minute' | 'hour' | 'day' | 'month' | 'never';

// https://gist.github.com/codeguy/6684588#gistcomment-3974852
const sluggify = (string: string) => {
  return string
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

const setExpiration = ({
  expiration,
  createdAt,
}: {
  expiration: string;
  createdAt: Date;
}) => {
  switch (expiration) {
    case 'read':
      return 'read';
    case 'minute':
      return addMinutes(createdAt, 1);
    case 'hour':
      return addHours(createdAt, 1);
    case 'day':
      return addDays(createdAt, 1);
    case 'month':
      return addMonths(createdAt, 1);
    case 'never':
      return 'never';
    default:
      return createdAt;
  }
};

const UUID_NAMESPACE = '885d85d8-826a-4a85-9942-34620a08ddab';

type ActionData = {
  formError?: string;
  fieldErrors?: {
    title: string | undefined;
    text: string | undefined;
  };
  fields?: {
    title: string;
    text: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

// POST
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const title = formData.get('title');
  const createdAt = new Date();
  const text = formData.get('text');
  const expirationToSet = formData.get('expiration');
  const language = formData.get('highlight');
  console.log('language');
  console.log(text);
  console.log('language');

  // https://remix.run/docs/en/v1/tutorials/blog#:~:text=disable%20JavaScript%20in%20your%20dev%20tools%20and%20try%20it%20out
  // https://remix.run/docs/en/v1/tutorials/jokes#:~:text=Go%20ahead%20and-,validate%20that%20the,-name%20and%20content
  if (
    typeof title !== 'string' ||
    typeof text !== 'string' ||
    typeof expirationToSet !== 'string' ||
    typeof language !== 'string'
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fieldErrors = {
    title:
      title.length < 3
        ? `Title is too short`
        : title.length > 45
        ? `Title is too long`
        : undefined,
    text: text.length < 5 ? `Paste is too short` : undefined,
    expiration: expirationToSet.length < 3 ? `Error in expiration` : undefined,
    language: !language ? `No language highlight` : undefined,
  };
  const fields = { title, text, expirationToSet, language };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const expiration = setExpiration({
    expiration: expirationToSet,
    createdAt,
  });
  const slug = sluggify(title);
  const ip = String(request.headers.get('CF-Connecting-IP'));
  const uuid = uuidv5(title, UUID_NAMESPACE); // generate uuid

  const MAX_LENGTH = 250;
  const trimmedText = text.substring(0, MAX_LENGTH);
  console.log('trimmed: ' + trimmedText);

  const lines = (text.match(/\n/g) || '').length + 1;
  //   const excerpt = trimmedText.includes('\n')
  //     ? trimmedText.substring(
  //         0,
  //         Math.min(trimmedText.length, trimmedText.lastIndexOf('\n'))
  //       )
  //     : trimmedText;

  await createPaste({
    title,
    slug,
    ip,
    expiration,
    createdAt,
    language,
    text,
    lines,
    uuid,
  });
  //   redirect('/pastes');
  return 'success';
};

const SelectInput = ({
  name,
  defaultValue,
  onChange,
  groups,
}: {
  name: string;
  defaultValue: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  groups: {
    name: string;
    options: { value: string; text?: string }[];
  }[];
}) => {
  const hasGroups = groups.length > 1;

  return (
    <select
      onChange={onChange}
      className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md text-stone-800 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
      name={name}
      defaultValue={defaultValue}
    >
      {hasGroups
        ? groups.map((group) => {
            return (
              <optgroup key={group.name} label={group.name}>
                {group.options.map((option) => {
                  return (
                    <option key={option.value}>
                      {option.text ? option.text : option.value}
                    </option>
                  );
                })}
              </optgroup>
            );
          })
        : groups[0].options.map((option) => (
            <option key={option.value} className="capitalize">
              {option.text ? option.text : option.value}
            </option>
          ))}
    </select>
  );
};

export default function NewPaste() {
  const actionData = useActionData<ActionData>();
  console.log(actionData);
  const transition = useTransition();
  const [selectedLanguage, setSelectedLanguage] = useState('none');

  return (
    <div className="">
      <h2 className="text-2xl leading-7 text-stone-800 sm:text-3xl">
        New Paste
      </h2>

      <Form method="post" className="py-6 space-y-4">
        <p>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 text-base text-white transition-colors bg-black border border-black rounded-md shadow-sm hover:bg-white hover:text-black hover:border hover:ring-offset-2 hover:ring-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            {transition.submission ? 'Creating...' : 'Create Paste'}
          </button>
        </p>
        <p>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            {actionData?.fieldErrors?.title ? (
              <span className="text-red-500" role="alert" id="text-error">
                {actionData.fieldErrors.title}
              </span>
            ) : (
              'Title'
            )}
            <input
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
              type="text"
              name="title"
              autoFocus
              required
            />
          </label>
        </p>
        <p>
          <label
            htmlFor="expiration"
            className="block text-sm font-medium text-gray-700"
          >
            Expire After
            <SelectInput
              name="expiration"
              defaultValue="day"
              groups={[
                {
                  name: 'default',
                  options: [
                    { value: 'read' },
                    { value: 'minute' },
                    { value: 'hour' },
                    { value: 'day' },
                    { value: 'month' },
                    { value: 'never' },
                  ],
                },
              ]}
            />
          </label>
        </p>
        <p>
          <label
            htmlFor="highlight"
            className="block text-sm font-medium text-gray-700"
          >
            Highlight
            <SelectInput
              name="highlight"
              defaultValue="none"
              onChange={(e) => setSelectedLanguage(e.target.value)}
              groups={[
                {
                  name: 'popular',
                  options: [
                    { value: 'none' },
                    { value: 'css' },
                    { value: 'javascript' },
                    { value: 'jsx' },
                    { value: 'json' },
                    { value: 'python' },
                    { value: 'sql' },
                    { value: 'tsx' },
                    { value: 'typescript' },
                    { value: 'yaml' },
                  ],
                },
                {
                  name: 'available',
                  options: [
                    { value: 'bash' },
                    { value: 'clike' },
                    { value: 'c' },
                    { value: 'cpp' },
                    { value: 'css-extras' },
                    { value: 'js-extras' },
                    { value: 'coffeescript' },
                    { value: 'diff' },
                    { value: 'git' },
                    { value: 'go' },
                    { value: 'graphql' },
                    { value: 'handlebars' },
                    { value: 'less' },
                    { value: 'makefile' },
                    { value: 'objectivec' },
                    { value: 'ocaml' },
                    { value: 'reason' },
                    { value: 'sass' },
                    { value: 'scss' },
                    { value: 'stylus' },
                    { value: 'wasm' },
                  ],
                },
              ]}
            />
          </label>
        </p>
        <p>
          <label
            htmlFor="text"
            className="block text-sm font-medium text-gray-700"
          >
            {actionData?.fieldErrors?.text ? (
              <span className="text-red-500" role="alert" id="text-error">
                {actionData.fieldErrors.text}
              </span>
            ) : (
              'Paste'
            )}
          </label>

          {/* <div className="relative flex w-1/2 p-2 border shadow-xl">
            <div x-text="text" className="text-sm whitespace-pre-line"></div>
            <textarea
              x-model="text"
              className="absolute top-0 bottom-0 left-0 right-0 w-full overflow-y-hidden text-sm"
            ></textarea>
          </div> */}
          <ExpandingTextArea
            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black bg-gray-50 sm:text-sm"
            defaultValue={actionData?.fields?.text}
            aria-invalid={Boolean(actionData?.fieldErrors?.text) || undefined}
            aria-describedby={
              actionData?.fieldErrors?.text ? 'text-error' : undefined
            }
            name="text"
            required
          />
          {/* {selectedLanguage === 'none' ? (
            <ExpandingTextArea
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black bg-gray-50 sm:text-sm"
              rows={15}
              defaultValue={actionData?.fields?.text}
              aria-invalid={Boolean(actionData?.fieldErrors?.text) || undefined}
              aria-describedby={
                actionData?.fieldErrors?.text ? 'text-error' : undefined
              }
              required
            />
          ) : (
            <LiveProvider code="" language={selectedLanguage}>
              <LiveEditor />
            </LiveProvider>
          )} */}

          {/* <textarea
            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black bg-gray-50 sm:text-sm"
            defaultValue={actionData?.fields?.text}
            aria-invalid={Boolean(actionData?.fieldErrors?.text) || undefined}
            aria-describedby={
              actionData?.fieldErrors?.text ? 'text-error' : undefined
            }
            id="text"
            rows={5}
            name="text"
            required
          /> */}

          {/* <textarea
            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black bg-gray-50 sm:text-sm"
            defaultValue={actionData?.fields?.text}
            aria-invalid={Boolean(actionData?.fieldErrors?.text) || undefined}
            aria-describedby={
              actionData?.fieldErrors?.text ? 'text-error' : undefined
            }
            id="text"
            rows={20}
            name="text"
            required
          /> */}
        </p>
      </Form>
    </div>
  );
}

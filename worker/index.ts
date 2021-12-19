import {
  createRequestHandler,
  handleAsset,
} from '@remix-run/cloudflare-workers';
import * as build from '../build';

declare global {
  const PASTES: KVNamespace;
}

const handleRequest = createRequestHandler({ build });

const handleEvent = async (event: FetchEvent) => {
  let response = await handleAsset(event, build);

  if (!response) {
    response = await handleRequest(event);
  }

  return response;
};

// type FormDatasetProps = {
//   [key: string]: string | number | Date;
//   title: string;
//   slug: string;
//   ip: string;
//   uuid: string;
//   createdAt: Date;
//   expiration: Date;
//   deleteAfter: Date;
//   text: string;
// };

// const formDatasets: FormDatasetProps[] = [
//   {
//     title: 'First Paste',
//     slug: 'first-paste',
//     ip: 'ipaddress',
//     uuid: 'uniqueid1',
//     createdAt: new Date(),
//     expiration: new Date(),
//     deleteAfter: new Date(),
//     text: 'Hello world',
//   },
//   {
//     title: 'Second paste',
//     slug: 'second-paste',
//     ip: 'ipaddress',
//     uuid: 'uniqueid2',
//     createdAt: new Date(),
//     expiration: new Date(),
//     deleteAfter: new Date(),
//     text: 'Woohoo',
//   },
// ];

// formDatasets.forEach((formData) => {
//   let newFormData = new FormData();
//   Object.keys(formData).forEach((key) => {
//     newFormData.append(key, String(formData[key]));
//   });

// });

addEventListener('fetch', async (event) => {
  try {
    event.respondWith(handleEvent(event));
  } catch (e: any) {
    event.respondWith(new Response('Internal Error', { status: 500 }));
  }
});

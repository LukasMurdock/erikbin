export type CreatePasteProps = {
  title: string;
  slug: string;
  ip: string;
  views?: { ip: string; timestamp: Date }[];
  createdAt: Date;
  expiration: 'read' | 'never' | Date;
  language?: string;
  style?: string;
  password?: string;
  text: string;
  lines: number;
  uuid: string;
};

export type PasteProps = {
  name: string;
  metadata: {
    title: string;
    slug: string;
    ip: string;
    views?: { ip: string; timestamp: Date }[];
    createdAt: Date;
    expiration: 'read' | 'never' | Date;
    language?: string;
    style?: string;
    password?: string;
    text: string;
    lines: number;
    uuid: string;
  };
};

export async function createPaste({
  title,
  slug,
  ip,
  createdAt,
  expiration,
  lines,
  language,
  style,
  password,
  text,
  uuid,
}: CreatePasteProps) {
  console.log('Creating new paste!');
  const pasteMetadata = {
    metadata: { title, slug, ip, createdAt, expiration, uuid, lines, language },
  };

  const pasteData = {
    text,
  };
  console.log({
    text,
    metadata: { title, slug, ip, createdAt, expiration, uuid, lines, language },
  });

  console.log(title);
  let pastes = await PASTES.put(slug, text, {
    metadata: { title, slug, ip, createdAt, expiration, uuid, lines, language },
  });
  return 'success';
}

// No bulk get… yet: https://community.cloudflare.com/t/fastest-way-to-fetch-all-kv-keys-in-namespace/183280
export async function getPastes() {
  // limit and cursor functions to paginate?
  let pastes = await PASTES.list();
  return pastes.keys;
}

export async function getPaste(slug: string) {
  //   let paste = await PASTES.get(slug, { type: 'json' });
  let paste = await PASTES.getWithMetadata(slug);
  return paste;
}

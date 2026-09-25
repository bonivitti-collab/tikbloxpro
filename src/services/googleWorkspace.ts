// Google Workspace API Client for Drive, Gmail, and Google Classroom
// All calls require an active Google OAuth Access Token

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  modifiedTime?: string;
  size?: string;
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

export interface ClassroomCourseItem {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  alternateLink?: string;
  courseState?: string;
}

export interface ClassroomCourseWorkItem {
  id: string;
  title: string;
  description?: string;
  alternateLink?: string;
  state?: string;
  dueDate?: { year: number; month: number; day: number };
}

// ==================== GOOGLE DRIVE ====================

export const listDriveFiles = async (
  accessToken: string,
  pageSize = 15,
  query = "trashed = false"
): Promise<{ files: DriveFileItem[] }> => {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set('fields', 'files(id, name, mimeType, webViewLink, iconLink, modifiedTime, size)');
  url.searchParams.set('q', query);
  url.searchParams.set('orderBy', 'modifiedTime desc');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Falha ao buscar arquivos no Google Drive.');
  }

  return res.json();
};

export const createDriveTextFile = async (
  accessToken: string,
  fileName: string,
  content: string,
  mimeType = 'text/plain'
): Promise<DriveFileItem> => {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: mimeType,
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Falha ao salvar arquivo no Google Drive.');
  }

  return res.json();
};

// ==================== GMAIL ====================

export const listGmailMessages = async (
  accessToken: string,
  maxResults = 10,
  query = ''
): Promise<GmailMessageItem[]> => {
  const listUrl = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  listUrl.searchParams.set('maxResults', maxResults.toString());
  if (query) listUrl.searchParams.set('q', query);

  const res = await fetch(listUrl.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Falha ao listar mensagens do Gmail.');
  }

  const data = await res.json();
  const messagesSummary = data.messages || [];

  // Fetch detail for first batch
  const details = await Promise.all(
    messagesSummary.slice(0, 8).map(async (item: { id: string; threadId: string }) => {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!msgRes.ok) return { id: item.id, threadId: item.threadId };
        const msgData = await msgRes.json();

        let subject = '(Sem assunto)';
        let from = 'Desconhecido';
        let date = '';

        if (msgData.payload?.headers) {
          for (const h of msgData.payload.headers) {
            if (h.name?.toLowerCase() === 'subject') subject = h.value;
            if (h.name?.toLowerCase() === 'from') from = h.value;
            if (h.name?.toLowerCase() === 'date') date = h.value;
          }
        }

        return {
          id: msgData.id,
          threadId: msgData.threadId,
          snippet: msgData.snippet,
          subject,
          from,
          date,
        };
      } catch {
        return { id: item.id, threadId: item.threadId };
      }
    })
  );

  return details;
};

export const sendGmailEmail = async (
  accessToken: string,
  to: string,
  subject: string,
  bodyText: string
): Promise<{ id: string; threadId: string }> => {
  // UTF-8 base64 url-safe RFC 2822 email format
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    bodyText,
  ];
  const rawEmail = messageParts.join('\r\n');
  const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedEmail }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Falha ao enviar e-mail pelo Gmail.');
  }

  return res.json();
};

// ==================== GOOGLE CLASSROOM ====================

export const listClassroomCourses = async (
  accessToken: string,
  pageSize = 10
): Promise<ClassroomCourseItem[]> => {
  const url = new URL('https://classroom.googleapis.com/v1/courses');
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set('courseStates', 'ACTIVE');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Falha ao listar turmas do Google Classroom.');
  }

  const data = await res.json();
  return data.courses || [];
};

export const listClassroomCourseWork = async (
  accessToken: string,
  courseId: string,
  pageSize = 10
): Promise<ClassroomCourseWorkItem[]> => {
  const url = new URL(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`);
  url.searchParams.set('pageSize', pageSize.toString());

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Falha ao buscar atividades da turma.');
  }

  const data = await res.json();
  return data.courseWork || [];
};

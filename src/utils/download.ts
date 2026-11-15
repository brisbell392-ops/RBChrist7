export type ExportKind = 'webpage' | 'archive';

export interface ExportResult {
  fileName: string;
  sizeBytes: number;
}

export async function downloadMinistryExport(kind: ExportKind): Promise<ExportResult> {
  const endpoint = kind === 'webpage' ? '/api/export/webpage' : '/api/export/archive';
  const fileName =
    kind === 'webpage'
      ? 'righteous-branch-of-christ-ministry.html'
      : 'righteous-branch-website-archive.zip';

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error('Could not prepare the webpage download. Please try again.');
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);

  return { fileName, sizeBytes: blob.size };
}

import { useEffect, useState } from 'react';
import { apiRequest } from './api/core';
type KycDocument = { id: string; submissionId?: string; fileName?: string; fileUrl?: string };
export async function privateKycBlob(document: KycDocument) {
  if (document.submissionId) return apiRequest<Blob>('/kyc/submissions/' + encodeURIComponent(document.submissionId) + '/documents/' + encodeURIComponent(document.id) + '/file', {}, 'blob');
  if (document.fileUrl && /^\/api\/v1\/files\/private\/[a-zA-Z0-9-]+$/.test(document.fileUrl)) return apiRequest<Blob>(document.fileUrl.slice('/api/v1'.length), {}, 'blob');
  throw new Error('This document needs an authorized retrieval link. Refresh the submission.');
}
export function usePrivateKycDocument(document: KycDocument | null) {
  const [url, setUrl] = useState(''), [error, setError] = useState('');
  useEffect(() => {
    let active = true, objectUrl = '';
    setUrl(''); setError('');
    if (document) privateKycBlob(document).then(blob => { if (active) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); } }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Document unavailable'); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [document]);
  return { url, error };
}
export async function downloadPrivateKyc(document: KycDocument) {
  try {
    const url = URL.createObjectURL(await privateKycBlob(document)), link = window.document.createElement('a');
    link.href = url; link.download = document.fileName || 'document'; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (reason) { window.alert(reason instanceof Error ? reason.message : 'Document could not be downloaded'); }
}

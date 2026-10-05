// utils/download.js
// Browser file saves (settings backup, log export). Object URLs are revoked on
// the next tick so Safari has time to start the download.

export function saveBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function saveText(filename, text, mime) {
  saveBlob(filename, new Blob([String(text)], { type: (mime || 'text/plain') + ';charset=utf-8' }));
}

export function stampedName(prefix, extension) {
  const now = new Date();
  const pad = (v) => String(v).padStart(2, '0');
  const stamp = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
    '-' + pad(now.getHours()) + pad(now.getMinutes());
  return prefix + '-' + stamp + '.' + extension;
}

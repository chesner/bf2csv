/**
 * Downloads a file
 *
 * @param {Blob} blob
 * @param {string} filename
 *
 * https://github.com/petermoresi/react-download-link/blob/master/download-link.es6
 * https://github.com/kennethjiang/js-file-download/blob/master/file-download.js
 */
export function downloadFile(blob, filename) {
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    // IE workaround for "HTML7007: One or more blob URLs were
    // revoked by closing the blob for which they were created.
    // These URLs will no longer resolve as the data backing
    // the URL has been freed."
    window.navigator.msSaveBlob(blob, filename);
  } else {
    // Create hidden link in order to trigger download
    const element = document.createElement('a');
    element.style.display = 'none';
    element.setAttribute('href', window.URL.createObjectURL(blob));
    element.setAttribute('download', filename);

    // Safari thinks _blank anchor are pop ups. We only want to set _blank
    // target if the browser does not support the HTML5 download attribute.
    // This allows you to download files in desktop safari if pop up blocking
    // is enabled.
    if (typeof element.download === 'undefined') {
      element.setAttribute('target', '_blank');
    }

    // Add the element to the body
    document.body.appendChild(element);

    // Click on the link
    element.click();

    // Cleanup link actions (remove it)
    document.body.removeChild(element);
    window.URL.revokeObjectURL(blob);
  }
}

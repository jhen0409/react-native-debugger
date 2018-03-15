const deltaFlag = 'DeltaPatcher.js';
/*
 * Starting from RN 0.52 haven't the check of `useDeltaBundler`,
 * so we can check if it not exists
 */
const checkFlag = "if (window.location.hash.indexOf('useDeltaBundler') === -1) {";
const getURL = (host, port) => `http://${host}:${port}/debugger-ui`;

export default function checkDeltaAvailable(host, port) {
  return fetch(getURL(host, port))
    .then(res => res.text())
    .then(data => data.indexOf(deltaFlag) > -1 && data.indexOf(checkFlag) === -1);
}

import 'whatwg-fetch';

export default function run() {
  // Fetch with forbidden header names
  fetch('http://localhost:8099', {
    headers: {
      Origin: 'custom_origin_here',
      'User-Agent': 'react-native',
    },
  });

  // It will log warning
  // because we can't use worker's FormData for upload file
  const data = { uri: 'uri' };
  const form = new FormData();
  form.append('file', data);
}

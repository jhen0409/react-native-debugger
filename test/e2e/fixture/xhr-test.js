import 'whatwg-fetch';

export default function run() {
  // Fetch with forbidden header names
  fetch('http://localhost:8099', {
    headers: {
      Origin: 'custom_origin_here',
      'User-Agent': 'react-native',
    },
  });
}

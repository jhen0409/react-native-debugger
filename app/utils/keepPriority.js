const silence = document.getElementById('silence');
silence.volume = 0.001;

/*
 * Maintain priority even if app invisible:
 * https://github.com/facebook/react-native/commit/5643bbc11d4fadfeec989327b63377f4a56d8c47
 * ---
 * This util will remove when Chrome version upgraded to ^57 of Electron
 */
export default function keepPriority(enabled) {
  if (enabled) {
    silence.play();
  } else {
    silence.pause();
  }
}

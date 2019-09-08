import { remote } from 'electron';

export default remote.getCurrentWindow().debuggerConfig || {};

import path from 'path';
import config from 'react-devtools/shells/electron/webpack.backend';

config.context = path.join(__dirname, '../node_modules/react-devtools/shells/electron');
delete config.module.loaders[0].exclude;

export default config;

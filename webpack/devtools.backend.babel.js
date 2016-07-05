import { join } from 'path';
import config from 'react-devtools/shells/electron/webpack.backend';

config.context = join(__dirname, '../node_modules/react-devtools/shells/electron');
delete config.module.loaders[0].exclude;
config.module.loaders[0].include = join(__dirname, '../node_modules/react-devtools');

export default config;

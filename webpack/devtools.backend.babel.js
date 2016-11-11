import { join } from 'path';
import config from '../app/react-devtools/shells/electron/webpack.backend';

config.context = join(__dirname, '../app/react-devtools/shells/electron');
delete config.module.loaders[0].exclude;
config.module.loaders[0].include = join(__dirname, '../app/react-devtools');

export default config;

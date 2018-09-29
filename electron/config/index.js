import fs from 'fs';
import path from 'path';
import json5 from 'json5';
import { shell } from 'electron';
import template from './template';

export const filePath = path.join(
  process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'],
  '.rndebuggerrc'
);

export const readConfig = (configFile = filePath) => {
  if (!fs.existsSync(configFile)) {
    // Create a new one
    fs.writeFileSync(configFile, template);
    return { config: json5.parse(template) };
  }
  try {
    // eslint-disable-next-line
    return { config: json5.parse(fs.readFileSync(configFile, 'utf-8')) };
  } catch (error) {
    // Alert parse config not successful
    return { config: json5.parse(template), isConfigBroken: true, error };
  }
};

export const openConfigFile = (configFile = filePath) => {
  readConfig();
  shell.openItem(configFile);
};

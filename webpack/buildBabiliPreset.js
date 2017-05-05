import babiliPreset from 'babel-preset-babili';
import ReactRemovePropTypes from 'babel-plugin-transform-react-remove-prop-types';
import ReactInlineElements from 'babel-plugin-transform-react-inline-elements';
import ReactConstantElements from 'babel-plugin-transform-react-constant-elements';

const plugins = [ReactRemovePropTypes, ReactInlineElements, ReactConstantElements];

export default function buildPreset(context, opts) {
  const babiliPresets = babiliPreset(context, opts);
  babiliPresets.presets.unshift({ plugins });
  return babiliPresets;
}

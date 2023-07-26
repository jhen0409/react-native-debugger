import path from 'path'
import { session } from 'electron'

export default async () => {
  if (process.env.NODE_ENV === 'development') {
    await session.defaultSession.loadExtension(
      path.resolve('dist/devtools-helper/'),
      { allowFileAccess: true },
    )
    await session.defaultSession.loadExtension(
      path.join(
        __dirname,
        '../node_modules/apollo-client-devtools/build',
      ),
      { allowFileAccess: true },
    )
  } else if (process.env.PACKAGE === 'no') {
    await session.defaultSession.loadExtension(
      path.join(__dirname, 'devtools-helper/'),
      { allowFileAccess: true },
    )
    await session.defaultSession.loadExtension(
      path.join(
        __dirname,
        'node_modules/apollo-client-devtools/build',
      ),
      { allowFileAccess: true },
    )
  } else {
    await session.defaultSession.loadExtension(
      path.join(__dirname, '../devtools-helper/'),
      { allowFileAccess: true },
    )
    await session.defaultSession.loadExtension(
      path.join(
        __dirname,
        '../ac-devtools-ext-build/', // See package script for why
      ),
      { allowFileAccess: true },
    )
  }
}

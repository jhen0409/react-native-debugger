import fs from 'fs-extra'
import path from 'path'
import fetch from 'node-fetch'
import { inject, revert } from '../injectDevToolsMiddleware'

const getRemoteMiddlewarePath = (version) => `https://raw.githubusercontent.com/facebook/react-native/${version}-stable/local-cli/server/middleware/getDevToolsMiddleware.js`

const modulePath = path.join(__dirname, 'tmp')

const middlewareDir = 'local-cli/server/middleware'
const middlewarePath = path.join(middlewareDir, 'getDevToolsMiddleware.js')

jest.setTimeout(30000)

describe('Inject to devtoolsMiddleware of React Native packager', () => {
  afterEach(() => {
    fs.removeSync(path.join(__dirname, 'tmp'))
  })
  const oldVersions = ['0.49', '0.50']
  oldVersions.forEach((version) => {
    test(`inject / revert in react-native ${version}`, async () => {
      const code = await fetch(getRemoteMiddlewarePath(version)).then((res) => res.text())
      fs.ensureDirSync(path.join(modulePath, 'react-native', middlewareDir))
      fs.outputFileSync(
        path.join(modulePath, 'react-native', middlewarePath),
        code,
      )
      fs.outputFileSync(
        path.join(modulePath, 'react-native', 'package.json'),
        JSON.stringify({
          version: `${version}.0`,
          name: 'react-native',
        }),
      )

      expect(code).toMatchSnapshot()
      inject(modulePath, 'react-native')
      expect(
        fs.readFileSync(
          path.join(modulePath, 'react-native', middlewarePath),
          'utf-8',
        ),
      ).toMatchSnapshot()
      revert(modulePath, 'react-native')
      expect(
        fs.readFileSync(
          path.join(modulePath, 'react-native', middlewarePath),
          'utf-8',
        ),
      ).toMatchSnapshot()
    })
  })

  test('inject / revert in react-native-macos', async () => {
    const code = await fetch(
      'https://raw.githubusercontent.com/ptmt/react-native-macos/merge-0.44.0/local-cli/server/middleware/getDevToolsMiddleware.js',
    ).then((res) => res.text())
    fs.ensureDirSync(
      path.join(modulePath, 'react-native-macos', middlewareDir),
    )
    fs.outputFileSync(
      path.join(modulePath, 'react-native-macos', middlewarePath),
      code,
    )
    fs.outputFileSync(
      path.join(modulePath, 'react-native-macos', 'package.json'),
      JSON.stringify({
        version: '0.8.7',
        name: 'react-native-macos',
      }),
    )

    expect(code).toMatchSnapshot()
    inject(modulePath, 'react-native-macos')
    expect(
      fs.readFileSync(
        path.join(modulePath, 'react-native-macos', middlewarePath),
        'utf-8',
      ),
    ).toMatchSnapshot()
    revert(modulePath, 'react-native-macos')
    expect(
      fs.readFileSync(
        path.join(modulePath, 'react-native-macos', middlewarePath),
        'utf-8',
      ),
    ).toMatchSnapshot()
  })

  const oldCliVersions = [
    {
      rn: '0.59.0-rc.0',
      cli: ['1.5.0'],
    },
    {
      rn: '0.60.0',
      cli: ['2.8.3', '2.9.0'],
    },
    {
      rn: '0.61.0',
      cli: ['3.0.0-alpha.7', '3.0.1'],
    },
  ]
  const oldPkgName = '@react-native-community/cli'
  oldCliVersions.forEach(({ rn, cli }) => {
    cli.forEach((version) => {
      test(`inject / revert in ${oldPkgName} (${rn} - v${version})`, async () => {
        const mDir = 'build/commands/server/middleware'
        const mPath = path.join(mDir, 'getDevToolsMiddleware.js')
        const code = await fetch(
          `https://unpkg.com/${oldPkgName}@${version}/build/commands/server/middleware/getDevToolsMiddleware.js`,
        ).then((res) => res.text())
        fs.ensureDirSync(
          path.join(modulePath, oldPkgName, mDir),
        )
        fs.outputFileSync(
          path.join(modulePath, oldPkgName, mPath),
          code,
        )
        fs.outputFileSync(
          path.join(modulePath, 'react-native', 'package.json'),
          JSON.stringify({
            version: rn,
            name: 'react-native',
          }),
        )

        expect(code).toMatchSnapshot()
        inject(modulePath, 'react-native')
        expect(
          fs.readFileSync(
            path.join(modulePath, oldPkgName, mPath),
            'utf-8',
          ),
        ).toMatchSnapshot()
        revert(modulePath, 'react-native')
        expect(
          fs.readFileSync(
            path.join(modulePath, oldPkgName, mPath),
            'utf-8',
          ),
        ).toMatchSnapshot()
      })
    })
  })

  const newCliVersions = [
    {
      rn: '0.71.8',
      cli: ['10.1.1'],
    },
  ]
  const newPkgName = '@react-native-community/cli-server-api'
  newCliVersions.forEach(({ rn, cli }) => {
    cli.forEach((version) => {
      test(`inject / revert in ${newPkgName} (${rn} - v${version})`, async () => {
        const mDir = 'build/'
        const mPath = path.join(mDir, 'devToolsMiddleware.js')
        const code = await fetch(
          `https://unpkg.com/${newPkgName}@${version}/build/devToolsMiddleware.js`,
        ).then((res) => res.text())
        fs.ensureDirSync(
          path.join(modulePath, newPkgName, mDir),
        )
        fs.outputFileSync(
          path.join(modulePath, newPkgName, mPath),
          code,
        )
        fs.outputFileSync(
          path.join(modulePath, 'react-native', 'package.json'),
          JSON.stringify({
            version: rn,
            name: 'react-native',
          }),
        )

        expect(code).toMatchSnapshot()
        inject(modulePath, 'react-native')
        expect(
          fs.readFileSync(
            path.join(
              modulePath,
              newPkgName,
              mPath,
            ),
            'utf-8',
          ),
        ).toMatchSnapshot()
        revert(modulePath, 'react-native')
        expect(
          fs.readFileSync(
            path.join(
              modulePath,
              newPkgName,
              mPath,
            ),
            'utf-8',
          ),
        ).toMatchSnapshot()
      })
    })
  })
})

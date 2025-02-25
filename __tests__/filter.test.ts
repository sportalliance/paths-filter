import {Filter, FilterConfig, PredicateQuantifier} from '../src/filter'
import {File, ChangeStatus} from '../src/file'

describe('yaml filter parsing tests', () => {
  test('throws if yaml is not a dictionary', () => {
    const yaml = 'not a dictionary'
    const t = () => new Filter(yaml)
    expect(t).toThrow(/^Invalid filter.*/)
  })
  test('throws if pattern is not a string', () => {
    const yaml = `
    src:
      - src/**/*.js
      - dict:
          some: value
    `
    const t = () => new Filter(yaml)
    expect(t).toThrow(/^Invalid filter.*/)
  })
})

describe('matching tests', () => {
  test('matches single inline rule', () => {
    const yaml = `
    src: "src/**/*.js"
    `
    let filter = new Filter(yaml)
    const files = modified(['src/app/module/file.js'])
    const match = filter.match(files)
    expect(match.src).toEqual(files)
  })
  test('matches single rule in single group', () => {
    const yaml = `
    src:
      - src/**/*.js
    `
    const filter = new Filter(yaml)
    const files = modified(['src/app/module/file.js'])
    const match = filter.match(files)
    expect(match.src).toEqual(files)
  })

  test('no match when file is in different folder', () => {
    const yaml = `
    src:
      - src/**/*.js
    `
    const filter = new Filter(yaml)
    const match = filter.match(modified(['not_src/other_file.js']))
    expect(match.src).toEqual([])
  })

  test('match only within second groups ', () => {
    const yaml = `
    src:
      - src/**/*.js
    test:
      - test/**/*.js
    `
    const filter = new Filter(yaml)
    const files = modified(['test/test.js'])
    const match = filter.match(files)
    expect(match.src).toEqual([])
    expect(match.test).toEqual(files)
  })

  test('match only withing second rule of single group', () => {
    const yaml = `
    src:
      - src/**/*.js
      - test/**/*.js
    `
    const filter = new Filter(yaml)
    const files = modified(['test/test.js'])
    const match = filter.match(files)
    expect(match.src).toEqual(files)
  })

  test('matches anything', () => {
    const yaml = `
    any:
      - "**"
    `
    const filter = new Filter(yaml)
    const files = modified(['test/test.js'])
    const match = filter.match(files)
    expect(match.any).toEqual(files)
  })

  test('globbing matches path where file or folder name starts with dot', () => {
    const yaml = `
    dot:
      - "**/*.js"
    `
    const filter = new Filter(yaml)
    const files = modified(['.test/.test.js'])
    const match = filter.match(files)
    expect(match.dot).toEqual(files)
  })

  test('matches all except tsx and less files (negate a group with or-ed parts)', () => {
    const yaml = `
    backend:
      - '!(**/*.tsx|**/*.less)'
    `
    const filter = new Filter(yaml)
    const tsxFiles = modified(['src/ui.tsx'])
    const lessFiles = modified(['src/ui.less'])
    const pyFiles = modified(['src/server.py'])

    const tsxMatch = filter.match(tsxFiles)
    const lessMatch = filter.match(lessFiles)
    const pyMatch = filter.match(pyFiles)

    expect(tsxMatch.backend).toEqual([])
    expect(lessMatch.backend).toEqual([])
    expect(pyMatch.backend).toEqual(pyFiles)
  })

  test('matches only files that are matching EVERY pattern when set to PredicateQuantifier.EVERY', () => {
    const yaml = `
    backend:
      - 'pkg/a/b/c/**'
      - '!**/*.jpeg'
      - '!**/*.md'
    `
    const filterConfig: FilterConfig = {predicateQuantifier: PredicateQuantifier.EVERY}
    const filter = new Filter(yaml, filterConfig)

    const typescriptFiles = modified(['pkg/a/b/c/some-class.ts', 'pkg/a/b/c/src/main/some-class.ts'])
    const otherPkgTypescriptFiles = modified(['pkg/x/y/z/some-class.ts', 'pkg/x/y/z/src/main/some-class.ts'])
    const otherPkgJpegFiles = modified(['pkg/x/y/z/some-pic.jpeg', 'pkg/x/y/z/src/main/jpeg/some-pic.jpeg'])
    const docsFiles = modified([
      'pkg/a/b/c/some-pics.jpeg',
      'pkg/a/b/c/src/main/jpeg/some-pic.jpeg',
      'pkg/a/b/c/src/main/some-docs.md',
      'pkg/a/b/c/some-docs.md'
    ])

    const typescriptMatch = filter.match(typescriptFiles)
    const otherPkgTypescriptMatch = filter.match(otherPkgTypescriptFiles)
    const docsMatch = filter.match(docsFiles)
    const otherPkgJpegMatch = filter.match(otherPkgJpegFiles)

    expect(typescriptMatch.backend).toEqual(typescriptFiles)
    expect(otherPkgTypescriptMatch.backend).toEqual([])
    expect(docsMatch.backend).toEqual([])
    expect(otherPkgJpegMatch.backend).toEqual([])
  })

  test('matches path based on rules included using YAML anchor', () => {
    const yaml = `
    shared: &shared
      - common/**/*
      - config/**/*
    src:
      - *shared
      - src/**/*
    `
    const filter = new Filter(yaml)
    const files = modified(['config/settings.yml'])
    const match = filter.match(files)
    expect(match.src).toEqual(files)
  })
})

describe('matching specific change status', () => {
  test('does not match modified file as added', () => {
    const yaml = `
    add:
      - added: "**/*"
    `
    let filter = new Filter(yaml)
    const match = filter.match(modified(['file.js']))
    expect(match.add).toEqual([])
  })

  test('match added file as added', () => {
    const yaml = `
    add:
      - added: "**/*"
    `
    let filter = new Filter(yaml)
    const files = [{status: ChangeStatus.Added, filename: 'file.js'}]
    const match = filter.match(files)
    expect(match.add).toEqual(files)
  })

  test('matches when multiple statuses are configured', () => {
    const yaml = `
    addOrModify:
      - added|modified: "**/*"
    `
    let filter = new Filter(yaml)
    const files = [{status: ChangeStatus.Modified, filename: 'file.js'}]
    const match = filter.match(files)
    expect(match.addOrModify).toEqual(files)
  })

  test('matches when using an anchor', () => {
    const yaml = `
    shared: &shared
      - common/**/*
      - config/**/*
    src:
      - modified: *shared
    `
    let filter = new Filter(yaml)
    const files = modified(['config/file.js', 'common/anotherFile.js'])
    const match = filter.match(files)
    expect(match.src).toEqual(files)
  })
})

describe('ignore pattern tests', () => {
  test('matches files but ignores specified patterns', () => {
    const yaml = `
    src:
      pattern: "src/**/*.{js,ts}"
      ignore: "src/**/*.test.{js,ts}"
    `
    const filter = new Filter(yaml)

    const files = modified([
      'src/app/module/file.js',
      'src/app/module/file.test.js',
      'src/utils/helper.ts',
      'src/utils/helper.test.ts'
    ])

    const match = filter.match(files)

    expect(match.src).toHaveLength(2)
    expect(match.src.map(f => f.filename)).toEqual(['src/app/module/file.js', 'src/utils/helper.ts'])
  })

  test('supports multiple ignore patterns', () => {
    const yaml = `
    src:
      pattern: "**/*.{js,ts}"
      ignore:
        - "**/*.test.{js,ts}"
        - "**/node_modules/**"
    `
    const filter = new Filter(yaml)

    const files = modified([
      'src/file.js',
      'src/file.test.js',
      'node_modules/lib/file.js',
      'src/utils.ts',
      'src/utils.test.ts'
    ])

    const match = filter.match(files)

    expect(match.src).toHaveLength(2)
    expect(match.src.map(f => f.filename)).toEqual(['src/file.js', 'src/utils.ts'])
  })
})

describe('complex patterns and ignore tests', () => {
  test('matches monorepo structure with client, server and shared files', () => {
    const yaml = `
    client:
      pattern:
        - 'src/**'
        - 'tsconfig.src.json'
        - 'vite.config.ts'
    server:
      pattern:
        - 'srv/**'
        - 'prisma/**'
        - 'tsconfig.srv.json'
        - 'tsconfig.srv.build.json'
        - 'nest-cli.json'
    all:
      pattern:
        - '**'
        - '*'
      ignore:
        - 'src/**'
        - 'srv/**'
        - 'prisma/**'
        - 'nest-cli.json'
        - 'tsconfig.src.json'
        - 'vite.config.ts'
        - 'tsconfig.srv.json'
        - 'tsconfig.srv.build.json'
    `
    const filter = new Filter(yaml)

    // Client files
    const clientFiles = modified([
      'src/components/Button.tsx',
      'src/pages/Home.tsx',
      'tsconfig.src.json',
      'vite.config.ts'
    ])

    // Server files
    const serverFiles = modified([
      'srv/main.ts',
      'srv/app.module.ts',
      'prisma/schema.prisma',
      'tsconfig.srv.json',
      'nest-cli.json'
    ])

    // Shared/root files that should match 'all' but not client or server
    const sharedFiles = modified(['README.md', 'package.json', '.gitignore', '.env', 'docker-compose.yml'])

    // Test client files
    const clientMatch = filter.match(clientFiles)
    expect(clientMatch.client).toHaveLength(4)
    expect(clientMatch.server).toHaveLength(0)
    expect(clientMatch.all).toHaveLength(0)
    expect(clientMatch.client.map(f => f.filename)).toEqual([
      'src/components/Button.tsx',
      'src/pages/Home.tsx',
      'tsconfig.src.json',
      'vite.config.ts'
    ])

    // Test server files
    const serverMatch = filter.match(serverFiles)
    expect(serverMatch.client).toHaveLength(0)
    expect(serverMatch.server).toHaveLength(5)
    expect(serverMatch.all).toHaveLength(0)
    expect(serverMatch.server.map(f => f.filename)).toEqual([
      'srv/main.ts',
      'srv/app.module.ts',
      'prisma/schema.prisma',
      'tsconfig.srv.json',
      'nest-cli.json'
    ])

    // Test shared files
    const sharedMatch = filter.match(sharedFiles)
    expect(sharedMatch.client).toHaveLength(0)
    expect(sharedMatch.server).toHaveLength(0)
    expect(sharedMatch.all).toHaveLength(5)
    expect(sharedMatch.all.map(f => f.filename)).toEqual([
      'README.md',
      'package.json',
      '.gitignore',
      '.env',
      'docker-compose.yml'
    ])
  })
})

function modified(paths: string[]): File[] {
  return paths.map(filename => {
    return {filename, status: ChangeStatus.Modified}
  })
}

function renamed(paths: string[]): File[] {
  return paths.map(filename => {
    return {filename, status: ChangeStatus.Renamed}
  })
}

# Paths Changes Filter

This is a fork of [dorny/paths-filter](https://github.com/dorny/paths-filter)

## !!!!!!!!!!!!Important!!!!!!!!!!!!

Please use `gylove1994/paths-filter@v2`.

## What's Changed

We add some new features to the original project, such as:

- Support ignore file and paths by using `ignore` option in [picomatch](https://github.com/micromatch/picomatch)

## Usage

A example of usage is as follows:

```yaml
jobs:
  check-changes:
    outputs:
      run-client: ${{ steps.filter.outputs.client }}
      run-server: ${{ steps.filter.outputs.server }}
      run-all: ${{ steps.filter.outputs.all }}
    steps:
      - uses: actions/checkout@v4
      - uses: gylove1994/paths-filter@v2
        id: filter
        with:
          filters: |
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
```

## License

The scripts and documentation in this project are released under the [MIT License](https://github.com/dorny/paths-filter/blob/master/LICENSE)

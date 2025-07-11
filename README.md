# Paths Changes Filter

This is a fork of [gylove1994/paths-filter](https://github.com/gylove1994/paths-filter) which is based on [dorny/paths-filter](https://github.com/dorny/paths-filter)

## Usage

Use either
- `sportalliance/paths-filter@v4+sportalliance` to use our own modified version
- `sportalliance/paths-filter@v4+gylove1994` to effectively use `gylove1994/paths-filter` (updated/rebased to `dorny/paths-filter@v4`)
- `sportalliance/paths-filter@v4` to effectively use original `dorny/paths-filter@v4`

## What's Changed

We added some new features to the original project(s), such as:

### Outputs

- If enabled, for each filter we set two output variables
  - `${FILTER_NAME}_files` will contain a list of <ins>all</ins> files matching the filter (**other than `${FILTER_NAME}_files` in the original**)
  - `${FILTER_NAME}_changes` will contain a list of <ins>changed</ins> files matching the filter (basically what was `${FILTER_NAME}_files` in the original)

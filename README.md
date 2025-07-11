# Paths Changes Filter

This is a fork of [gylove1994/paths-filter](https://github.com/gylove1994/paths-filter) which is based on [dorny/paths-filter](https://github.com/dorny/paths-filter)

## Usage

Use either
- `sportalliance/paths-filter@8378427a25b0341cbcff4f3bbcabb9515df75b88` to use our own modified version
- `sportalliance/paths-filter@d27dd69aa9af18ddb4f9db0eecb17a5d4a1a9928` to effectively use `gylove1994/paths-filter@v2`
- `sportalliance/paths-filter@de90cc6fb38fc0963ad72b210f1f284cd68cea36` to effectively use `dorny/paths-filter@v3`

## What's Changed

We added some new features to the original project(s), such as:

### Outputs

- If enabled, for each filter we set two output variables
  - `${FILTER_NAME}_files` will contain a list of <ins>all</ins> files matching the filter (**other than `${FILTER_NAME}_files` in the original**)
  - `${FILTER_NAME}_changes` will contain a list of <ins>changed</ins> files matching the filter (basically what was `${FILTER_NAME}_files` in the original)

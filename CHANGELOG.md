# Changelog

## [1.0.1](https://github.com/eriksaulnier/sneaky-spanish-v2/compare/sneaky-spanish-v1.0.0...sneaky-spanish-v1.0.1) (2026-04-03)


### Bug Fixes

* **ci:** use PAT for release-please to trigger publish workflow ([c5e917a](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/c5e917a14cd9c587a772a304bb6256a5b79db9bb))

## 1.0.0 (2026-04-03)


### Features

* add chameleon icon to popup and options page headers ([d5eae5a](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/d5eae5a7deda5d2ce9d18759977fa33f38c033a8))
* add dark mode support via prefers-color-scheme ([a688cec](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/a688cecd7bbf3026be9d134f6766c9ad0635d950))
* add dictionary generation script and A1-B1 word data ([6c90821](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/6c90821dca3047cb1e722e431f47f80330ea96f8))
* add multi-word phrase matching support ([430dd5f](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/430dd5f20155d706ef0c09b12b82175c6fb307fd))
* add MutationObserver, shadow DOM tooltip, and restore logic ([db7cbbb](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/db7cbbb2b999038ca754fb45b3d1ed14d704e588))
* add POS tagging and filter to nouns only ([9968f29](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/9968f29f6c41ca78dca1c461bbed8608ee118739))
* add settings page with progress stats, word list, and viewport-aware seen tracking ([ae45296](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/ae4529666d8eb72be9562b44557d65a716fa33cd))
* add word tracking and practice list ([e488acb](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/e488acb78ddbfc7a1f5c93e881fcf8211836b4bd))
* generate chameleon icon at 16/32/48/128px with Sharp ([9eff0ac](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/9eff0ac1bcf3a47e8d7352bc3ebd0e69b05ecf54))
* implement popup UI and options page ([38c52db](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/38c52db466846c4b6a84d6f518339883726a14c4))
* implement word replacement walker and content script ([e6efbcf](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/e6efbcf1ade0c11c68ed1a8215b147503daa47f4))
* redesign icon as chubby green chameleon (F2) ([d87ce56](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/d87ce5645ab4dd5f7bc96df9d4b5c965b501a1a3))
* scaffold project with MV3 manifest and vite build ([a3ac3c1](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/a3ac3c176f3298faa05a95fe48caf455969fd1de))
* theme extension to match chameleon icon palette ([dcad519](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/dcad519b420561f42723ee46f18fd10dbaa2130b))
* update branding colors to match new chameleon icon ([505c783](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/505c7834e7dce95e94a22034b789bb39075f9e89))


### Bug Fixes

* add storage mutex and remove unused streak tracking ([d2fb14f](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/d2fb14fe4fb7b9f920e9f88ac9cabd166fc8bbad))
* center chameleon icon vertically and use PNG in README ([38ec50d](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/38ec50d7bd47648dee40e9d3467fdb603413dd88))
* defer customElements.define to avoid null error in content scripts ([6c06810](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/6c06810284cf30b99d3a62aa2ae389296aa6c655))
* make populateLevelSelect idempotent and remove dead changed flag ([e314ca6](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/e314ca60e87d096096ac1c9f1eac2f71efcd8464))
* normalize word casing for dictionary lookup in options page ([da97ce0](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/da97ce01914201e67dd1c262d5cf349973128f1d))
* redesign icon as top-down chameleon without background ([35a33f8](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/35a33f86240724f94bc39127d0e3207fb63b479b))
* replace beforeunload with pagehide for more reliable flush ([154856d](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/154856d358ebdcbe5acdacabfb069f02ad5dbc89))
* replace custom element tooltip with plain div + shadow DOM ([548f061](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/548f061aa07049c25977a5e6ce56c662a9f9264e))
* switch tooltip from click to hover ([5824b6c](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/5824b6c1121c30ffad5e2b032b0d8ccb6cb8f8e6))
* use background.scripts for Firefox builds ([c50f69e](https://github.com/eriksaulnier/sneaky-spanish-v2/commit/c50f69ee4c39678a9b9f03e9774c9875c41607cf))

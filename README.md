# makefun-gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/faturahmanagus3/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/faturahmanagus3/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Atlas is an offline trophy guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy carries its official name, description and grade, plus a guide in our own words that cites its sources — the official list on Exophase for every trophy, and PSNProfiles wherever PlayStation tracks a count. Count-based trophies (250 stunts, 100 WAiNK locations, $250,000 laundered and more) get step counters; progress is saved in the browser and can be exported to a JSON file and imported back. A four-stage roadmap leads to the platinum, a Missables view flags the four plan-ahead watch-outs honestly as warnings built from the official descriptions (the game released on 2026-11-19, so nothing is presented as verified in game), and a spoiler shield — on by default — masks unearned story trophies until they are earned. The app is plain static files with no build step and no network requests at runtime; the only fetch is its own data/trophies.json. There are no online trophies in the official list, and the Online filter says so.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080

Hand the entry in with:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=vhy7v8vr&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

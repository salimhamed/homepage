# villaalba fork

This is a fork of [gethomepage/homepage](https://github.com/gethomepage/homepage). The `villaalba` branch
carries a small patch series rebased on top of an upstream release tag, so it can be replayed cleanly onto
future tags.

## Patch series

| Patch           | What it adds                                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tailscale links | Per-service `tailscaleHref` in `services.yaml` plus a footer toggle that swaps every card's link to its tailnet URL. Services without a `tailscaleHref` are dimmed while the toggle is on. |
| Tasmota widget  | A `tasmota` service widget showing power state with a click-to-toggle switch.                                                                                                              |
| Fork CI         | The two workflows below.                                                                                                                                                                   |

Everything else is upstream. The patches add new files wherever possible and touch as few upstream files as
possible to keep rebases cheap.

## Workflows

Upstream's own workflows are left on disk untouched (deleting them would conflict on every sync) and are
turned off in the repo's Actions tab instead.

### `Fork: build and publish` (`.github/workflows/fork-publish.yml`)

Runs on every push to `villaalba` and on demand. Lints, tests, builds the Next.js app on the runner, then
builds the image with `CI=true` (the `Dockerfile` skips its own install/build and consumes the prebuilt
`.next/` from the build context) and pushes to GHCR.

Image: `ghcr.io/salimhamed/homepage`

| Tag                   | Meaning                                                        |
| --------------------- | -------------------------------------------------------------- |
| `villaalba`           | Latest build of the branch.                                    |
| `villaalba-<version>` | Upstream version the fork is based on, e.g. `villaalba-2.2.0`. |
| `sha-<short sha>`     | Exact commit.                                                  |

### `Fork: sync upstream` (`.github/workflows/fork-sync-upstream.yml`)

Runs daily and on demand. Finds the newest upstream `vX.Y.Z` tag, rebases the fork patches onto it, pushes
`sync/vX.Y.Z`, and opens a PR into `villaalba`. While that PR is open it does nothing, so reviews and any
manual conflict fixes pushed to the branch survive the next run. On a conflict it aborts the rebase and fails
with the list of conflicting files — resolve those by rebasing manually. It needs the repo setting
**Settings → Actions → General → Workflow permissions → "Allow GitHub Actions to create and approve pull
requests"**.

## Rebasing manually

```bash
git fetch upstream --tags
git rebase vX.Y.Z
git push --force-with-lease
```

## Landing a sync pull request

The sync job opens a PR from `sync/vX.Y.Z` so the rebase can be reviewed, but do **not** use
GitHub's merge buttons: "Squash" collapses the patch series into one commit and "Rebase and merge"
replays the patches onto a branch that already has them. Land it by moving `villaalba` to the sync
branch tip after checking it locally:

```bash
git fetch origin
git checkout villaalba
pnpm install --frozen-lockfile && pnpm lint && pnpm test && pnpm build   # on the sync branch first
git reset --hard origin/sync/vX.Y.Z
git push --force-with-lease origin villaalba
gh pr close <n> --comment "Landed by moving villaalba to sync/vX.Y.Z" --delete-branch
```

The push triggers the publish workflow; then redeploy the homelab `homepage` tag.

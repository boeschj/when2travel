#!/bin/bash
set -euo pipefail

PR_NUMBER="${1:?usage: babysit-pr.sh <pr-number>}"
POLL_SECONDS=180
MAX_FIX_ATTEMPTS=10
SEEN_COMMENTS_FILE=$(mktemp)
FIX_ATTEMPTS=0

notify() {
  [ -n "${NTFY_TOPIC:-}" ] && curl -s -d "$1" "https://ntfy.sh/$NTFY_TOPIC" > /dev/null || true
  echo "$1"
}

repo_slug() {
  gh repo view --json nameWithOwner --jq .nameWithOwner
}

while true; do
  STATE=$(gh pr view "$PR_NUMBER" --json state,mergeable --jq '.state + " " + .mergeable')
  PR_STATE=${STATE%% *}
  MERGEABLE=${STATE##* }

  if [ "$PR_STATE" = "MERGED" ]; then
    notify "PR #$PR_NUMBER merged. Babysitter done."
    exit 0
  fi
  if [ "$PR_STATE" = "CLOSED" ]; then
    notify "PR #$PR_NUMBER closed without merge. Babysitter done."
    exit 0
  fi

  if [ "$FIX_ATTEMPTS" -ge "$MAX_FIX_ATTEMPTS" ]; then
    notify "BLOCKED: PR #$PR_NUMBER hit $MAX_FIX_ATTEMPTS fix attempts. Human needed."
    exit 1
  fi

  if [ "$MERGEABLE" = "CONFLICTING" ]; then
    notify "PR #$PR_NUMBER has merge conflicts. Dispatching a rebase session."
    claude -p "PR #$PR_NUMBER in this repo has merge conflicts with main. Check out its branch in a worktree, rebase onto origin/main, resolve conflicts per CLAUDE.md/AGENTS.md, run pnpm verify, and push. Never force-push over unpulled remote commits: use --force-with-lease only on the rebase push." || notify "BLOCKED: rebase session failed for PR #$PR_NUMBER"
    FIX_ATTEMPTS=$((FIX_ATTEMPTS + 1))
  fi

  FAILING=$(gh pr checks "$PR_NUMBER" 2>/dev/null | grep -c "fail" || true)
  if [ "$FAILING" -gt 0 ]; then
    notify "PR #$PR_NUMBER has $FAILING failing check(s). Dispatching a fix session."
    claude -p "PR #$PR_NUMBER in this repo has failing CI checks. Pull the failing run log with 'gh run view --log-failed', find the root cause (never repeat a remedy that already failed), fix it on the PR branch in a worktree, run pnpm verify, and push per the ship-ticket commit format." || notify "BLOCKED: CI-fix session failed for PR #$PR_NUMBER"
    FIX_ATTEMPTS=$((FIX_ATTEMPTS + 1))
  fi

  NEW_COMMENTS=$(gh-get "repos/$(repo_slug)/pulls/$PR_NUMBER/comments" --paginate 2>/dev/null | python3 -c "
import json, sys
seen = set(open('$SEEN_COMMENTS_FILE').read().split())
comments = json.load(sys.stdin)
is_own_bot = lambda c: 'claude' in c['user']['login'].lower()
fresh = [c for c in comments if str(c['id']) not in seen and not is_own_bot(c)]
print(len(fresh))
open('$SEEN_COMMENTS_FILE','a').write(' '.join(str(c['id']) for c in fresh) + ' ')
" || echo 0)

  if [ "$NEW_COMMENTS" -gt 0 ]; then
    notify "PR #$PR_NUMBER has $NEW_COMMENTS new review comment(s). Dispatching a response session."
    claude -p "PR #$PR_NUMBER in this repo has new review comments. Fetch them with gh-get repos/$(repo_slug)/pulls/$PR_NUMBER/comments, address each per ship-ticket step 11 (fix + same-violation sweep, reply per-thread via ./scripts/gh-reply with the fixing commit SHA, one 'Addressed the review' summary, judgment-calls section). Product-level or architectural asks: reply asking Jordan instead of guessing." || notify "BLOCKED: review-response session failed for PR #$PR_NUMBER"
    FIX_ATTEMPTS=$((FIX_ATTEMPTS + 1))
  fi

  sleep "$POLL_SECONDS"
done

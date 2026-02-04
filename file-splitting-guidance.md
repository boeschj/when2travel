Step 1: Classify each component in the file
Go through the file and tag every component as one of:

Leaf — Pure presentation, no hooks, no business logic. Think StatusBadge, EmptyState, a styled wrapper. These are fine living in the same file as their parent.
Stateful — Has its own useState, useEffect, event handlers, or data fetching. These almost always deserve their own file.
Compositional — Assembles other components, passes props down, orchestrates layout. This is usually the "main" component the file is named after.

If a file has more than one Stateful or Compositional component, that's your first red flag.
Step 2: Check the reuse question
For each component in the file, ask: Is this used (or could it reasonably be used) outside this file?

Yes → Extract it. It needs to be importable.
No, and it's a Leaf → It can stay. Prefix it with nothing exported, just a local helper.
No, but it's Stateful → Extract it anyway. Co-locate it next to the parent file, but give it its own module. Stateful components grow over time and will bloat the file.

Step 3: Measure cognitive load
Open the file and try to answer these questions quickly:

What is the primary thing this file exports?
Can you identify where the main render starts without scrolling?
If you needed to fix a bug in one component, could you ignore the others?

If you answered "no" to any of those, the file is too dense. The goal isn't short files — it's files where you can hold the whole thing in your head.
Step 4: Look for hidden abstractions
Scan for these patterns that signal an extraction is hiding in plain sight:

Repeated prop drilling — If a parent is threading the same 3+ props through to a child in the same file, that child probably needs its own hook or context.
Inline functions longer than ~5 lines — onClick={() => { ... 20 lines ... }} is a handler that belongs in a hook or at minimum a named function.
Multiple useEffect blocks — Each one is usually a distinct concern. Group related state + effect into a custom hook.
Conditional rendering blocks longer than ~15 lines — The branch content is a component. Extract it.

Step 5: Apply the extraction
Once you've identified what to pull out, use this priority order:

Reusable components first — Biggest bang for buck. Other devs can start using them immediately.
Custom hooks second — Pulling logic out of the main component often cuts file length by 30-50% on its own.
Stateful siblings third — Give them their own files, co-located in the same folder.
Leaves last — Only if the file is still too long after the above. Otherwise leave them; extracting trivial components creates file sprawl for no benefit.

Step 6: Validate the split
After extracting, check that:

Each file has one clear reason to change. If a design tweak and a business logic change both require editing the same file, you haven't split enough.
You haven't created circular imports.
The folder structure tells a story. Someone new should be able to look at the directory listing and guess what each file does.

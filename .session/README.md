# Session Management System

This directory contains a comprehensive system for maintaining context across development sessions with Claude Code.

## 🎯 Purpose

**Problem:** Complex app development loses context between sessions. Claude Code doesn't remember previous work.

**Solution:** Structured note-taking with automatic context loading ensures every session starts with full knowledge.

---

## 📂 Structure

```
.session/
├── README.md          # This file
├── SYSTEM.md          # Complete system documentation
├── CONTEXT.md         # Current project state (READ FIRST!)
├── INDEX.md           # Session history
├── ARCHITECTURE.md    # System design reference
├── sessions/          # Individual session notes
│   └── 2025-11-19-auto-naming.md
├── templates/         # Templates for consistency
└── scripts/           # Automation helpers
    ├── session-start.sh
    └── session-wrap.sh
```

---

## 🚀 Quick Start

### Starting a New Session

**Option 1: With Claude Code (Recommended)**

```
User: "Start new session on tag management UI"

Claude will:
1. Read CONTEXT.md (current state)
2. Read INDEX.md (session history)
3. Read ARCHITECTURE.md (system design)
4. Create new session file
5. Confirm ready to work
```

**Option 2: Manual Script**

```bash
cd /home/user/tally/.session/scripts
./session-start.sh "tag-management-ui"
```

### During Development

- Claude maintains running notes in session file
- Records decisions with rationale
- Captures learnings as they happen
- Updates work log continuously

**You don't need to do anything!**

### Wrapping a Session

**Option 1: With Claude Code (Recommended)**

```
User: "Wrap session"

Claude will:
1. Review session work
2. Synthesize to CONTEXT.md
3. Update INDEX.md
4. Create commit
5. Show summary
```

**Option 2: Manual Script**

```bash
./session-wrap.sh
# Then manually update CONTEXT.md and INDEX.md
```

---

## 📋 Core Files Explained

### 1. CONTEXT.md - The Living Brain 🧠

**What:** Current project state
**When to read:** Every session start (always read first!)
**Update:** Every session wrap

**Contains:**
- System status (what's working, what's not)
- Recent changes (last 3 sessions)
- Known issues
- Environment config
- Next priorities

**Size:** ~3 pages (keep it concise!)

### 2. INDEX.md - Session History 📚

**What:** Chronicle of all sessions
**When to read:** Session start (after CONTEXT.md)
**Update:** Every session wrap

**Contains:**
- Session summaries with metadata
- Goals, status, files changed
- Key learnings and decisions
- Quick lookup by topic

**Size:** Growing (but organized by date)

### 3. ARCHITECTURE.md - System Design 🏗️

**What:** How the system works
**When to read:** Session start, when confused
**Update:** Only when design changes

**Contains:**
- Tech stack
- Architecture layers
- Design patterns
- Database schema
- API reference

**Size:** ~15 pages (comprehensive reference)

### 4. sessions/YYYY-MM-DD-topic.md - Detailed Notes 📝

**What:** Complete session record
**When to read:** When you need details from past work
**Update:** During session (running log)

**Contains:**
- Goals and progress
- Work log (timestamped)
- Decisions made (with rationale)
- Code changes (with reasoning)
- Learnings and issues

**Size:** Varies (full detail)

---

## 🔄 Session Lifecycle

```
START SESSION
    ↓
Read CONTEXT.md    ← Current state
Read INDEX.md      ← History
Read ARCHITECTURE  ← How it works
    ↓
CREATE SESSION FILE
    ↓
DEVELOP & DOCUMENT (real-time notes)
    ↓
WRAP SESSION
    ↓
Synthesize → CONTEXT.md
Add entry → INDEX.md
Update → ARCHITECTURE.md (if needed)
Commit changes
    ↓
READY FOR NEXT SESSION
```

---

## 💡 Key Principles

### 1. Hierarchical Context

```
CONTEXT.md      (What's happening now)
    ↓
INDEX.md        (What happened before)
    ↓
ARCHITECTURE    (How things work)
    ↓
Sessions        (Full details)
```

**Read in this order!**

### 2. Progressive Detail

- CONTEXT.md: High-level, current (1-2 pages)
- INDEX.md: Medium detail, chronological
- Sessions: Full detail, specific

**Start broad, drill down as needed**

### 3. Always Update CONTEXT.md

**Critical:** CONTEXT.md must reflect current reality

After each session:
- Update system status
- Add to recent changes
- Adjust next priorities
- Update known issues

**If CONTEXT.md is stale, Claude will be confused!**

### 4. Session Files are History

- Don't edit old session files
- They're historical records
- Create new sessions for new work
- Reference old sessions when needed

---

## 📖 Usage Examples

### Example 1: Continuing Work

**User:** "Continue working on tag management UI"

**Claude (internal):**
```
1. Read .session/CONTEXT.md
   - Sees "Tag Management UI" in next priorities
   - Sees current system status
   - Understands what's complete

2. Read .session/INDEX.md
   - Sees last session was "auto-naming"
   - Understands recent history

3. Read .session/ARCHITECTURE.md
   - Reviews tag system design
   - Understands service layer pattern

4. Ready to code!
```

**Claude (response):**
"✅ Context loaded! I see tag management UI is next priority. Auto-naming system was just completed. I understand the tag storage design (JSON array in TEXT column) and the service layer pattern. Ready to build the TagManager component!"

### Example 2: Debugging an Issue

**User:** "Why are task IDs resetting on server restart?"

**Claude (internal):**
```
1. Read .session/CONTEXT.md
   - Sees "Task ID counters reset on restart" in known issues
   - Notes it's low priority

2. Read .session/ARCHITECTURE.md
   - Reviews TaskNamingService design
   - Sees in-memory Map for counters

3. Read last session
   - Sees decision to use in-memory counters
   - Understands tradeoff
```

**Claude (response):**
"This is a known issue (see CONTEXT.md). Task IDs use in-memory Map for fast generation, but counters reset on restart. This was an intentional tradeoff for simplicity. If you need persistence, we can:
1. Store counters in database
2. Derive from MAX(id) + 1
3. Use timestamp-based IDs"

### Example 3: Onboarding New Developer

**New Dev:** "I'm new to this project, where do I start?"

**Reading Order:**
```
1. README.md              (This file - system overview)
2. .session/CONTEXT.md    (Current state)
3. .session/ARCHITECTURE.md (How it works)
4. .session/INDEX.md      (What's been done)
```

**Result:** Fully up to speed in ~30 minutes!

---

## 🎨 Best Practices

### ✅ Do

1. **Read CONTEXT.md first** every session
2. **Update CONTEXT.md** every wrap
3. **Keep session files detailed** during work
4. **Record decisions with rationale**
5. **Commit session notes with code**
6. **Use templates for consistency**

### ❌ Don't

1. **Skip session wraps** (context gets stale)
2. **Let CONTEXT.md get outdated**
3. **Edit old session files** (they're history)
4. **Forget to record decisions**
5. **Keep everything in one file**
6. **Make Claude guess context**

---

## 🔧 Customization

### Adding Custom Sections

Edit templates to add project-specific sections:

```markdown
## Performance Metrics
- Load time: [X]ms
- Bundle size: [Y]kb

## User Feedback
- [Feedback 1]
- [Feedback 2]
```

### Creating Topic-Specific Indexes

```bash
# Create feature-specific index
grep -l "#authentication" .session/sessions/*.md > auth-sessions.txt
```

---

## 🚨 Troubleshooting

### "Claude seems confused about current state"

**Fix:** Update CONTEXT.md with current reality

### "Too much information to read"

**Fix:** Keep CONTEXT.md under 3 pages, detail goes in sessions

### "Can't find past decision"

**Fix:** Search INDEX.md by topic tags or grep session files

### "Session notes getting messy"

**Fix:** Use templates, enforce structure

---

## 📊 Success Metrics

**Good Session Management:**
- ✅ Claude starts each session with full context
- ✅ No repeated questions about project state
- ✅ Decisions are documented and findable
- ✅ New sessions pick up exactly where last left off
- ✅ Context never lost

**Poor Session Management:**
- ❌ Claude guesses project state
- ❌ Repeated explanations needed
- ❌ Can't find why decisions were made
- ❌ Each session starts from scratch
- ❌ Context loss between sessions

---

## 🔮 Future Enhancements

- [ ] Automated CONTEXT.md synthesis
- [ ] Session duration tracking
- [ ] Git integration (auto-commit on wrap)
- [ ] Tag-based session search
- [ ] Session analytics dashboard

---

## 📚 Additional Resources

- **Full Documentation:** See `SYSTEM.md`
- **Architecture Details:** See `ARCHITECTURE.md`
- **Current State:** See `CONTEXT.md`
- **Session History:** See `INDEX.md`

---

**Created:** 2025-11-19
**Last Updated:** 2025-11-19
**Status:** Active
**Maintainer:** Development Team

---

## Quick Commands Reference

```bash
# Start new session
./.session/scripts/session-start.sh "topic-name"

# Wrap current session
./.session/scripts/session-wrap.sh

# View current context
cat .session/CONTEXT.md

# Find session by topic
ls .session/sessions/ | grep "topic"

# Search all sessions for keyword
grep -r "keyword" .session/sessions/
```

---

**Remember:** Context preservation is the key to productive development with Claude Code! 🎯

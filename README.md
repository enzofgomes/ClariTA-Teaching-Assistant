# ClariTA-Teaching-Assistant

AI TA — Technical Specification
1) Problem & Goal
Students spend hours rereading slides with low retention. AI TA converts lecture slides into active-recall study packs: auto-generated quizzes, short explanations, and quick reviews—fast, accurate, and personalized.
Primary Challenge Fit
Microsoft – AI 4 Good: education, wellness, accessibility.
Google ADK (optional upgrade): multi-agent pipeline (extract → organize → generate → verify → adapt).
Base44 – Students Track: practical impact, usability, and scalability.

2) Core User Stories (MVP)
Upload slides (PDF/PPTX) → see parsed outline (sections, key terms).
Generate quiz → “10 questions” (MCQ, T/F, short answer) + answer key with 1–2 line explanations.
Difficulty control → Easy / Medium / Hard modes.
Topic targeting → select slides or keywords to focus the quiz.
Export → Save quiz as interactive web test (in-app) and PDF.
Integrity guardrails → sources/slide refs listed for each question; “study aid, not cheating” reminder.
Session history → view downloads and last 5 generated packs.
Stretch (Nice-to-Have)
Flashcards (spaced repetition seed).
Cloze deletions (fill-in-the-blank).
Image-aware questions (diagrams → labels).
“Confidence slider” per question to personalize next quiz.
LMS import (Canvas/Blackboard via QTI export).

3) System Architecture
High-Level Flow
Client (React) → API (FastAPI/Express) → Pipeline Services → LLM/RAG → Storage
Components
Web App (React + Vite)
Upload viewer (PDF.js), quiz runner, results page.
A11y: large fonts, high contrast, keyboard-only flow, screen-reader labels.
API Gateway (Python FastAPI or Node Express)
Auth (session or magic link for demo).
Endpoints to parse, generate, verify, export.
Parsing Service
PDF/PPTX → text, headings, lists, tables, images (OCR fallback for images).
Chunk & structure by slide; produce a content graph (sections→subsections→bullets).
RAG Index
Embeddings store (FAISS / Qdrant in-container) keyed by slide index; metadata includes slide#, heading, text span.
Generation Service (LLM)
Deterministic prompts for MCQ/T/F/Short Answer.
Returns JSON schema (see §6) with distractor quality rules.
Verification Service
Cross-checks each answer against top-K slide chunks; flags low-confidence items for regeneration.
Export Service
PDF quiz pack, plus sharable web link.
Storage
Postgres (users, uploads, jobs, quizzes).
S3-compatible bucket (MinIO) for slide files & exports.
Observability
Structured logs (JSON), prompt/latency metrics, verification confidence scores.

4) Multi-Agent (Google ADK) Option
Agent A – Extractor: parse slides → structured outline + embeddings.
Agent B – Curator: select key concepts by difficulty/topic.
Agent C – Generator: produce questions + distractors + explanations.
Agent D – Verifier: cite slide spans; re-generate low-confidence items.
Agent E – Personalizer (optional): adapts difficulty from prior attempts.
Parallelization: B & C per topic; D runs concurrently on generated items.
Loop: Keep regenerating until avg confidence ≥ threshold or timeout.

5) MVP Feature Details
Question Types
Multiple Choice (MCQ): 1 correct + 3 plausible distractors; rationale ≤ 2 lines.
True/False: explanation required; if false, state the correction.
Short Answer: expected keywords list; concise model answer (≤ 40 words).
Difficulty Modes
Easy: definitions, recall.
Medium: compare/contrast, “why” prompts.
Hard: application & scenario-based, multi-concept.
Personalization Knobs
Topic picker (by slide range/keywords).
of questions (5–25).
Time limit toggle (practice exam).
Integrity & Safety
Slide citations per question (slide# or heading).
Hallucination guard: verification service with confidence score (0–1).
Ethics banner: “Study aid, not for graded exams.”

6) Data & API Contracts
Core Tables (Postgres)
users(id, email, created_at)
uploads(id, user_id, filename, storage_url, pages, created_at)
indexes(id, upload_id, vector_store_ref, created_at)
jobs(id, user_id, upload_id, params_json, status, created_at, finished_at)
quizzes(id, job_id, meta_json, confidence_mean, created_at)
questions(id, quiz_id, type, prompt, options_json, answer_key_json, explanation, citations_json, confidence)
Generation Request (JSON)
{
  "upload_id": "uuid",
  "num_questions": 10,
  "question_types": ["mcq","tf","short"],
  "difficulty": "medium",
  "topic_filter": {"slides":[5,6,7], "keywords":["ACID","indexing"]},
  "max_tokens": 1200
}

Generation Response (JSON)
{
  "quiz_id": "uuid",
  "questions": [
    {
      "type": "mcq",
      "prompt": "Which statement best describes ACID 'Isolation'?",
      "options": ["...", "...", "...", "..."],
      "answer": 2,
      "explanation": "Isolation ensures ...",
      "citations": [{"slide": 12, "span":"Isolation definition"}],
      "confidence": 0.86
    }
  ],
  "confidence_mean": 0.83
}

Export
GET /quizzes/{id}/export/pdf
GET /quizzes/{id} returns quiz JSON for the React runner.

7) Model & Prompting Strategy
LLM: GPT-class or open-weights (Llama-3.x) via vLLM on GPU (if available).
RAG: Top-K = 6; max 2 chunks per question; include citations in prompt.
Prompts: system prompt with rubric (difficulty rules, distractor quality, length caps); explicit JSON schema; ask model to refuse when not enough context (fallback to “need more slides”).
Verification: second pass that re-queries RAG to score correctness (semantic entailment) and highlight conflicts.

8) Frontend UX (React)
Upload Page: drag-and-drop, file size indicator, quick parse preview.
Generate Panel: selectors (difficulty, num questions, topic filter).
Quiz Runner: one Q per screen, timer option, flag for review, submit → results (score, explanations, sources).
Review & Export: download PDF, copy share link, “Regenerate low-confidence only.”
Accessibility: semantic HTML, ARIA labels, skip-links, high contrast mode.

9) Security & Privacy
Files scoped to user; signed URLs for downloads.
PII-free by design (slides rarely contain PII; still warn users).
Data retention: auto-purge uploads after 7 days (configurable).

10) Evaluation Metrics
Latency: time to first quiz (< 45s for 20 slides, 10 questions).
Quality: avg confidence ≥ 0.75; judge acceptance (live spot-check).
Engagement: % completed quizzes; # regenerations; export rate.
Accessibility: keyboard-only completion success.

11) Demo Script (5 minutes)
Problem (30s): passive rereading vs active recall.
Live Upload (45s): parse preview, choose “Medium”, “10 Q”.
Quiz Gen (30–60s): show progress + confidence meter.
Take 2–3 Qs (60s): show explanations + citations.
Regenerate Low-Confidence (30s): verifier loop in action.
Export PDF (15s): print-ready pack.
Sponsor Tie-In (30s): AI 4 Good + (optionally) ADK multi-agent diagram.

12) Build Plan (Hackathon Timeline)
T0–4h: Repo scaffolds, DB schema, file upload & parse, minimal UI.
T4–10h: Embeddings + RAG; basic quiz generation (MCQ only).
T10–16h: Add T/F + Short Answer; results screen; PDF export.
T16–22h: Verifier pass + confidence; topic filter; difficulty tuning.
T22–30h: A11y polish; error states; seed demo slides.
T30–36h: (Optional) Multi-agent orchestration for ADK; demo script; pitch deck.

13) Risks & Mitigations
Hallucinations: verifier with RAG, confidence threshold, regen flow.
OCR misses text in images: easy fallback: “image-based content not parsed; upload text-heavy slides or add alt text.”
Time overrun: lock scope at 10-question quiz; postpone flashcards.

14) What Makes This Win
Clear pain point + immediate value.
Tight, fast demo with visible verification (trust).
Accessibility & ethics baked in.
Optional multi-agent architecture to hit Google ADK judging criteria.
Want a one-page pitch deck outline and a ready-to-paste prompt template for the generator/verifier next?


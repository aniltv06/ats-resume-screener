"""
Rule-based ATS scoring — no AI API required, no external dependencies.

Algorithm:
  1. Extract top keywords (unigrams + bigrams) from the job description,
     weighted by frequency.
  2. Check which JD keywords appear in the resume.
  3. ATS score = weighted_matched / weighted_total * 100.
  4. Generate rule-based suggestions from the gaps.
"""
import re
from collections import Counter
from typing import List, Tuple

STOPWORDS = frozenset({
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
    'we', 'they', 'it', 'its', 'our', 'your', 'their', 'my', 'his', 'her',
    'who', 'which', 'when', 'where', 'why', 'how', 'all', 'both', 'each',
    'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very',
    'just', 'also', 'as', 'if', 'not', 'no', 'nor', 'so', 'yet', 'either',
    'neither', 'while', 'after', 'before', 'since', 'until', 'unless',
    'although', 'though', 'because', 'however', 'therefore', 'thus',
    'including', 'within', 'between', 'among', 'what', 'any', 'over',
    'under', 'again', 'then', 'once', 'here', 'there', 'same', 'own',
    'etc', 'eg', 'ie', 'vs', 'via', 'per', 'new', 'us', 'use', 'using',
    'work', 'working', 'well', 'able', 'get', 'take', 'need', 'needs',
    'want', 'like', 'know', 'used', 'make', 'help', 'ensure', 'across',
    'related', 'relevant', 'strong', 'good', 'great', 'years', 'year',
    'experience', 'team', 'role', 'position', 'company', 'candidate',
})

ACTION_VERBS = frozenset({
    'achieved', 'architected', 'automated', 'built', 'collaborated',
    'contributed', 'coordinated', 'created', 'delivered', 'deployed',
    'designed', 'developed', 'drove', 'enhanced', 'engineered',
    'established', 'generated', 'implemented', 'improved', 'increased',
    'integrated', 'launched', 'led', 'maintained', 'managed', 'migrated',
    'optimized', 'owned', 'partnered', 'reduced', 'refactored', 'resolved',
    'reviewed', 'scaled', 'shipped', 'spearheaded', 'streamlined',
    'supported', 'tested', 'trained', 'transformed',
})


def _tokenize(text: str) -> List[str]:
    # Keep +/# so C++, C# survive; lowercase everything else
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s+#]', ' ', text)
    return [t for t in text.split() if t and t not in STOPWORDS and len(t) > 1]


def _extract_keywords(text: str, top_n: int = 40) -> List[Tuple[str, int]]:
    tokens = _tokenize(text)
    counts: Counter = Counter(tokens)
    for i in range(len(tokens) - 1):
        bigram = f"{tokens[i]} {tokens[i + 1]}"
        counts[bigram] += 1
    filtered = {k: v for k, v in counts.items() if len(k) > 2}
    return sorted(filtered.items(), key=lambda x: -x[1])[:top_n]


def analyze_resume(resume_text: str, job_description: str) -> dict:
    jd_keywords = _extract_keywords(job_description, top_n=40)
    resume_norm = re.sub(r'[^a-z0-9\s+#]', ' ', resume_text.lower())

    matched: List[str] = []
    missing: List[str] = []
    total_weight = sum(freq for _, freq in jd_keywords)
    matched_weight = 0

    for kw, freq in jd_keywords:
        if kw in resume_norm:
            matched.append(kw)
            matched_weight += freq
        else:
            missing.append(kw)

    score = min(100, round((matched_weight / max(total_weight, 1)) * 100))

    # --- Suggestions ---
    suggestions: List[str] = []
    resume_tokens = set(_tokenize(resume_text))

    for kw in missing[:4]:
        suggestions.append(
            f'Add "{kw}" to your resume if you have relevant experience with it.'
        )

    if not re.search(r'\d+\s*%|\d+x|\$\d+|\d+\s*(million|billion|\bk\b)', resume_norm):
        suggestions.append(
            'Add quantifiable achievements (e.g., "reduced latency by 40%", '
            '"grew revenue by $2M") to strengthen impact.'
        )

    if len(resume_tokens & ACTION_VERBS) < 4:
        suggestions.append(
            'Use stronger action verbs such as "built", "launched", "optimized", '
            '"reduced", or "scaled" to describe your contributions.'
        )

    if not re.search(r'\b(summary|objective|profile|about me)\b', resume_norm):
        suggestions.append(
            'Add a professional summary at the top, tailored to this specific role.'
        )

    # --- Skill gaps ---
    skill_gaps: List[str] = []
    if missing:
        preview = ', '.join(f'"{k}"' for k in missing[:6])
        suffix = '…' if len(missing) > 6 else ''
        skill_gaps.append(
            f'{len(missing)} JD terms not found in your resume: {preview}{suffix}'
        )
    if score < 50:
        skill_gaps.append(
            'Keyword coverage is below 50%. Mirror the job description language '
            'when describing your experience.'
        )

    # --- Summary ---
    label = 'Strong' if score >= 70 else 'Moderate' if score >= 40 else 'Weak'
    summary = (
        f'{label} keyword match: {len(matched)} of {len(jd_keywords)} key terms '
        f'from the job description appear in your resume (score: {score}/100). '
    )
    if score >= 70:
        summary += 'Consider quantifying your achievements further.'
    elif score >= 40:
        summary += 'Incorporate more role-specific language to improve ATS visibility.'
    else:
        summary += 'Significant rework recommended to align with job requirements.'

    return {
        'ats_score': score,
        'matched_keywords': matched,
        'missing_keywords': missing,
        'skill_gaps': skill_gaps,
        'suggestions': suggestions,
        'summary': summary,
    }

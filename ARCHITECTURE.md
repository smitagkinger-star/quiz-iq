# QuizIQ – Architecture Overview

## Overview
QuizIQ is an AI-powered quiz application that helps users generate quizzes on any topic and evaluate answers with AI-assisted feedback. Users can select a topic, difficulty, question type, and question count, then complete the quiz and receive a score, explanations, concept-level feedback, and recommended resources.

This project was **designed and directed by the repository owner**, including the product concept, flow, and architecture intent. The implementation was **created with AI assistance using the Lovable platform**, then refined through prompting, review, and repository management.

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend / Platform
- Supabase
- Supabase Auth
- Supabase Postgres
- Supabase Edge Functions

### AI Layer
- LLM provider API for:
  - quiz generation
  - short-answer evaluation
  - explanation generation

### Development Workflow
- Lovable for AI-assisted implementation
- GitHub for source control and project management

---

## High-Level Architecture

```mermaid
flowchart LR
    User[User]
    FE[React + Vite Frontend]
    Auth[Supabase Auth]
    DB[(Supabase Postgres)]
    GQ[Edge Function: generate-quiz]
    EA[Edge Function: evaluate-answer]
    LLM[LLM Provider]

    User --> FE
    FE --> Auth
    FE --> DB
    FE --> GQ
    FE --> EA
    GQ --> LLM
    EA --> LLM
    GQ --> DB
    EA --> DB
```

### Architecture Summary
- The **React frontend** manages the user experience, quiz flow, and results display.
- **Supabase Auth** manages authentication and user identity.
- **Supabase Postgres** stores quiz sessions, answers, and analytics.
- The **generate-quiz** edge function creates structured quiz content through the LLM.
- The **evaluate-answer** edge function grades short-answer responses through the LLM.
- The LLM is accessed through backend functions rather than directly from the client.

---

## End-to-End Quiz Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as React Frontend
    participant GQ as Edge Function: generate-quiz
    participant EA as Edge Function: evaluate-answer
    participant LLM as LLM Provider
    participant DB as Supabase Database

    User->>FE: Select topic, difficulty, question type, question count
    FE->>GQ: Request quiz generation
    GQ->>LLM: Send quiz generation prompt
    LLM-->>GQ: Return structured quiz payload
    GQ-->>FE: Return questions, options, correct answers, concepts, resources
    FE->>DB: Store quiz activity/session start

    loop For each question
        User->>FE: Submit answer

        alt MCQ question
            FE->>FE: Compare selected answer to correctAnswer
            FE->>DB: Track answer/activity
        else Short-answer question
            FE->>EA: Send free-text answer for evaluation
            EA->>LLM: Send semantic evaluation prompt
            LLM-->>EA: Return correctness/explanation
            EA-->>FE: Return evaluation result
            FE->>DB: Track answer/activity
        end
    end

    FE->>FE: Calculate score and weak concepts
    FE->>FE: Build recommendations from quiz metadata / missed concepts
    FE->>DB: Persist quiz completion and analytics
    FE-->>User: Show results, concepts to review, recommended resources
```

---

## Conceptual Data Model (ERD)

```mermaid
erDiagram

USERS {
    uuid id
    string email
    timestamp created_at
}

QUIZ_SESSIONS {
    uuid id
    uuid user_id
    string topic
    string difficulty
    string question_type
    int question_count
    timestamp started_at
    timestamp completed_at
    int score
}

QUESTIONS {
    uuid id
    uuid session_id
    int position
    string question_text
    string question_type
    string correct_answer
    string concept
}

ANSWER_EVENTS {
    uuid id
    uuid session_id
    uuid question_id
    string submitted_answer
    boolean is_correct
    string explanation
    timestamp answered_at
}

RESOURCES {
    uuid id
    uuid session_id
    string concept
    string title
    string url
}

USERS ||--o{ QUIZ_SESSIONS : owns
QUIZ_SESSIONS ||--o{ QUESTIONS : contains
QUIZ_SESSIONS ||--o{ ANSWER_EVENTS : records
QUESTIONS ||--o{ ANSWER_EVENTS : receives
QUIZ_SESSIONS ||--o{ RESOURCES : suggests
```

### ERD Notes
This ERD is conceptual and intended to show the main product entities and relationships:
- a user can have many quiz sessions
- each quiz session contains multiple questions
- each question can have answer activity recorded
- quiz sessions can produce learning resources and recommendations

---

## Security and Design Notes
- Authentication is handled through **Supabase Auth**
- User data should be protected through **Row Level Security**
- LLM API keys should remain on the backend inside **edge functions**
- AI output should be treated as untrusted and validated where possible

---

## AI-Assisted Development Note
This application follows a **human-directed, AI-assisted development model**.

The repository owner defined the product idea, user flow, and architecture direction, and used the **Lovable platform** to generate implementation code through prompting and iteration. The generated output was then reviewed, refined, and managed in the repository.

A good description of the project is:

> **A prompt-designed product architecture, created through AI-assisted development and guided by human product and system design decisions.**

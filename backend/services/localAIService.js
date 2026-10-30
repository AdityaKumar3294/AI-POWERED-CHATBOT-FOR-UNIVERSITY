const { getKnowledge } = require("./knowledgeService");

/* =========================================================
   TEXT NORMALIZATION
========================================================= */

const normalizeText = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/* =========================================================
   KEYWORD DEFINITIONS
========================================================= */

const academicCalendarKeywords = [
  "academic calendar",
  "academic session",
  "academic year",
  "semester schedule",
  "semester dates",
  "semester timeline",
  "academic schedule",
];

const mt1Keywords = [
  "mt-1",
  "mt 1",
  "mt1",
  "st-1",
  "st 1",
  "st1",
  "first midterm",
  "first mid term",
  "first internal",
  "first internal exam",
  "first sessional",
  "first sessional exam",
  "first mid semester",
];

const mt2Keywords = [
  "mt-2",
  "mt 2",
  "mt2",
  "st-2",
  "st 2",
  "st2",
  "second midterm",
  "second mid term",
  "second mid-term",
  "second internal",
  "second internal exam",
  "second sessional",
  "second sessional exam",
  "second mid semester",
  "2nd midterm",
  "2nd mid term",
  "2nd internal",
  "2nd internal exam",
  "2nd sessional",
  "2nd sessional exam",
];

const endSemesterKeywords = [
  "end semester",
  "end semester exam",
  "end semester examination",
  "end term",
  "end term exam",
  "end term examination",
  "final exam",
  "final examination",
  "semester exam",
  "semester examination",
  "final semester exam",
  "final semester examination",
  "end sem",
  "end sem exam",
];

const examinationKeywords = [
  "exam",
  "exams",
  "examination",
  "examinations",
  "exam date",
  "exam dates",
  "exam schedule",
  "examination schedule",
  "exam form",
  "examination form",
  "admit card",
  "carry over",
  "carryover",
  "challenge evaluation",
];

const scholarshipKeywords = [
  "scholarship",
  "scholarships",
  "financial aid",
  "financial assistance",
  "scholarship form",
  "scholarship application",
];

const admissionKeywords = [
  "admission",
  "admissions",
  "apply",
  "application",
  "application form",
  "admission form",
  "eligibility",
];

const hostelKeywords = [
  "hostel",
  "hostels",
  "mess",
  "accommodation",
  "hostel fee",
  "hostel fees",
  "hostel admission",
];

const placementKeywords = [
  "placement",
  "placements",
  "career",
  "careers",
  "job",
  "jobs",
  "campus placement",
  "campus placements",
  "placement cell",
];

const feeKeywords = [
  "fee",
  "fees",
  "tuition",
  "tuition fee",
  "tuition fees",
  "payment",
  "fee payment",
  "fee structure",
];

const rulesKeywords = [
  "rule",
  "rules",
  "regulation",
  "regulations",
  "discipline",
  "disciplinary",
  "code of conduct",
  "conduct",

  // Attendance
  "attendance",
  "attendance rule",
  "attendance rules",
  "attendance policy",
  "attendance requirement",
  "attendance requirements",

  // Anti-ragging
  "anti ragging",
  "anti-ragging",
  "ragging",

  // Grievance
  "grievance",
  "grievance redressal",
  "student grievance",
  "complaint",
  "complaints",

  // Discipline / penalties
  "penalty",
  "penalties",
  "fine",
  "fines",
  "student rules",
];

/* =========================================================
   INTENT DETECTION
========================================================= */

const containsKeyword = (text, keywords) => {
  return keywords.some((keyword) =>
    text.includes(keyword)
  );
};

const detectIntent = (question = "") => {
  const text = normalizeText(question);

  /*
   * Specific academic/examination intents
   * must be checked first.
   */

  if (
    containsKeyword(
      text,
      academicCalendarKeywords
    ) ||
    containsKeyword(text, mt1Keywords) ||
    containsKeyword(text, mt2Keywords) ||
    containsKeyword(
      text,
      endSemesterKeywords
    )
  ) {
    return "academic-calendar";
  }

  /*
   * Generic examination questions
   */

  if (
    containsKeyword(
      text,
      examinationKeywords
    )
  ) {
    return "examinations";
  }

  /*
   * Scholarship
   */

  if (
    containsKeyword(
      text,
      scholarshipKeywords
    )
  ) {
    return "scholarships";
  }

  /*
   * Admissions
   */

  if (
    containsKeyword(
      text,
      admissionKeywords
    )
  ) {
    return "admissions";
  }

  /*
   * Hostel
   */

  if (
    containsKeyword(
      text,
      hostelKeywords
    )
  ) {
    return "hostel";
  }

  /*
   * Placements
   */

  if (
    containsKeyword(
      text,
      placementKeywords
    )
  ) {
    return "placements";
  }

  /*
   * Fees
   */

  if (
    containsKeyword(
      text,
      feeKeywords
    )
  ) {
    return "fees";
  }

  /*
   * Rules
   */

  if (
    containsKeyword(
      text,
      rulesKeywords
    )
  ) {
    return "rules";
  }

  return "general";
};

/* =========================================================
   KEYWORD EXTRACTION
========================================================= */

const getKeywords = (question) => {
  return normalizeText(question)
    .split(" ")
    .filter(
      (word) => word.length > 2
    );
};

/* =========================================================
   CHUNK SCORING
========================================================= */

const calculateScore = (
  question,
  chunk,
  intent
) => {
  const normalizedQuestion =
    normalizeText(question);

  const normalizedContent =
    normalizeText(
      chunk.content || ""
    );

  let score = 0;

  /*
   * Individual keyword matching
   */

  const keywords =
    getKeywords(question);

  for (const keyword of keywords) {
    if (
      normalizedContent.includes(keyword)
    ) {
      score += 1;
    }
  }

  /*
   * Exact question match
   */

  if (
    normalizedContent.includes(
      normalizedQuestion
    )
  ) {
    score += 5;
  }

  /*
   * Category matching
   */

  if (
    chunk.category &&
    chunk.category === intent
  ) {
    score += 6;
  }

  /*
   * Penalize unrelated categories.
   */

  if (
    chunk.category &&
    intent !== "general" &&
    chunk.category !== intent
  ) {
    score -= 3;
  }

  /*
   * Section-specific relevance
   *
   * Attendance questions should strongly prefer
   * the attendance section of the student-rules document.
   */

  if (
    normalizedQuestion.includes("attendance") &&
    normalizedContent.includes("attendance")
  ) {
    score += 10;
  }

  return score;
};

/* =========================================================
   FIND RELEVANT KNOWLEDGE
========================================================= */

const findRelevantKnowledge = async (
  question,
  intent = null
) => {
  const detectedIntent =
    intent || detectIntent(question);

  /*
   * IMPORTANT:
   *
   * Your knowledgeService.js exports getKnowledge(),
   * not getAllChunks().
   */

  const chunks = await getKnowledge();

  const scoredChunks =
    chunks.map((chunk) => ({
      ...chunk,
      score: calculateScore(
        question,
        chunk,
        detectedIntent
      ),
    }));

  /*
   * Development logs
   */

  console.log(
    "\n🔎 Knowledge Retrieval:"
  );

  console.log(
    "🎯 Detected Intent:",
    detectedIntent
  );

  console.log(
    "📊 Chunk Scores:"
  );

  scoredChunks.forEach((chunk) => {
    console.log(
      `   ${chunk.filename} → ${chunk.score}`
    );
  });

  /*
   * Only reasonably relevant chunks
   */

  const relevantChunks = [];

  const sortedChunks = scoredChunks
    .filter(
      (chunk) => chunk.score >= 3
    )
    .sort(
      (a, b) => b.score - a.score
    );

  // Prefer chunks that directly contain the topic being asked about
const normalizedQuestion = normalizeText(question);

  const topicFilteredChunks = sortedChunks.filter((chunk) => {
    const content = normalizeText(chunk.content || "");

    if (normalizedQuestion.includes("attendance")) {
      return content.includes("attendance");
    }

    return true;
  });

  /*
   * Allow multiple relevant chunks from
   * the same document.
   *
   * This is important because one document
   * can contain different sections such as:
   *
   * - General Rules
   * - Anti-Ragging
   * - Grievance
   * - Attendance
   */

  const fileChunkCount = new Map();

  for (const chunk of topicFilteredChunks) {
    const currentCount =
      fileChunkCount.get(chunk.filename) || 0;

    /*
     * Maximum 2 chunks from the same document
     */

    if (currentCount >= 2) {
      continue;
    }

    relevantChunks.push(chunk);

    fileChunkCount.set(
      chunk.filename,
      currentCount + 1
    );

    /*
     * Maximum 3 chunks overall
     */

    if (relevantChunks.length >= 3) {
      break;
    }
  }

  console.log(
    "📚 RAG Sources:",
    relevantChunks.map(
      (chunk) => chunk.filename
    )
  );

  return relevantChunks;
};

/* =========================================================
   RAG CONTEXT
========================================================= */

const getRAGContext = async (
  question,
  intent = null
) => {
  const relevantChunks =
    await findRelevantKnowledge(
      question,
      intent
    );

  if (!relevantChunks.length) {
    return {
      context: "",
      chunks: [],
      sources: [],
    };
  }

  const context =
    relevantChunks
      .map((chunk, index) => {
        return `
SOURCE ${index + 1}

Filename:
${chunk.filename}

Category:
${chunk.category || "general"}

Title:
${chunk.title || "Unknown"}

Academic Session:
${
  chunk.academicSession ||
  "Not specified"
}

Program:
${chunk.program || "Not specified"}

Semester:
${chunk.semester || "Not specified"}

Official Source:
${
  chunk.source ||
  "ABES Engineering College"
}

Source URL:
${
  chunk.sourceUrl ||
  "https://www.abes.ac.in/"
}

Content:
${chunk.content}
`;
      })
      .join(
        "\n\n----------------------------\n\n"
      );

  return {
    context,
    chunks: relevantChunks,
    sources: relevantChunks.map(
      (chunk) => chunk.filename
    ),
  };
};

/* =========================================================
   LOCAL RESPONSE GENERATOR
========================================================= */

const generateLocalResponse = async (
  question,
  relevantChunks = []
) => {
  const sources =
    relevantChunks.map(
      (chunk) => chunk.filename
    );

  /*
   * No knowledge found
   */

  if (!relevantChunks.length) {
    return {
      reply:
        "I couldn't find verified information about this in the current UniAssist knowledge base.\n\n" +
        "Please check the latest official ABES Engineering College notice or website for the most accurate information.",
      sources: [],
      mode: "local",
    };
  }

  const intent =
    detectIntent(question);

  /* =======================================================
     ACADEMIC CALENDAR
  ======================================================= */

  if (
    intent === "academic-calendar"
  ) {
    const questionText =
      normalizeText(question);

    const calendarChunk =
      relevantChunks.find(
        (item) =>
          item.category ===
          "academic-calendar"
      );

    if (calendarChunk) {
      let reply = "";

      /*
       * MT-1 / ST-1
       */

      if (
        containsKeyword(
          questionText,
          mt1Keywords
        )
      ) {
        reply =
          "According to the current ABES 2026-27 academic calendar, **MT-1 / ST-1 Theory Examination** is scheduled from **14 September 2026 to 16 September 2026**.\n\n";
      }

      /*
       * MT-2 / ST-2
       */

      else if (
        containsKeyword(
          questionText,
          mt2Keywords
        )
      ) {
        reply =
          "According to the current ABES 2026-27 academic calendar, **MT-2 / ST-2 Theory Examination** is scheduled from **21 October 2026 to 23 October 2026**.\n\n";
      }

      /*
       * END SEMESTER
       */

      else if (
        containsKeyword(
          questionText,
          endSemesterKeywords
        )
      ) {
        reply =
          "According to the current ABES 2026-27 academic calendar, the **End Term / End Semester Theory Examination** is scheduled from **24 November 2026 to 27 November 2026**.\n\n" +
          "These dates are marked as **tentative** in the official academic calendar and may be revised by the competent authority.\n\n";
      }

      /*
       * GENERAL ACADEMIC CALENDAR
       */

      else {
        reply =
          "According to the current ABES 2026-27 Odd Semester academic calendar for B.Tech 5th and 7th semesters:\n\n" +
          "- **MT-1 / ST-1:** 14 September 2026 to 16 September 2026\n" +
          "- **MT-2 / ST-2:** 21 October 2026 to 23 October 2026\n" +
          "- **Make-up / PUE:** To be decided\n" +
          "- **End Term / End Semester:** 24 November 2026 to 27 November 2026\n\n" +
          "The End Term / End Semester dates are marked as tentative and may be revised by the competent authority.\n\n";
      }

      reply +=
        `> **Source:** ${sources.join(
          ", "
        )}`;

      return {
        reply,
        sources,
        mode: "local",
      };
    }
  }

  /* =======================================================
     SCHOLARSHIPS
  ======================================================= */

  if (
    intent === "scholarships"
  ) {
    const questionText =
      normalizeText(question);

    const scholarshipChunk =
      relevantChunks.find(
        (item) =>
          item.category ===
          "scholarships"
      );

    if (scholarshipChunk) {
      let reply =
        "According to the current UniAssist knowledge base, ABES Engineering College has published a notification for **Renewal and Fresh Applications for Central Government Scholarship for the 2026-27 session**.\n\n" +
        "The notification covers both **Fresh Applications** and **Renewal Applications**.\n\n" +
        "**Notification date:** 29 August 2026.\n\n";

      /*
       * SCHOLARSHIP AMOUNT
       */

      if (
        questionText.includes(
          "amount"
        ) ||
        questionText.includes(
          "how much"
        ) ||
        questionText.includes(
          "money"
        ) ||
        questionText.includes(
          "rupees"
        ) ||
        questionText.includes("₹")
      ) {
        reply +=
          "The current UniAssist knowledge base does **not contain a verified scholarship amount** for the 2026-27 notification, so I won't guess the amount.\n\n";
      }

      /*
       * ELIGIBILITY
       */

      else if (
        questionText.includes(
          "eligibility"
        ) ||
        questionText.includes(
          "eligible"
        )
      ) {
        reply +=
          "The detailed eligibility conditions are not currently available in the UniAssist knowledge base. Please check the specific official scholarship notification for the applicable eligibility requirements.\n\n";
      }

      /*
       * DEADLINE
       */

      else if (
        questionText.includes(
          "deadline"
        ) ||
        questionText.includes(
          "last date"
        ) ||
        questionText.includes(
          "due date"
        )
      ) {
        reply +=
          "The current UniAssist knowledge base does **not contain a verified application deadline** for this notification. Please check the latest official ABES Circulars / Notices section.\n\n";
      }

      /*
       * DOCUMENTS
       */

      else if (
        questionText.includes(
          "document"
        ) ||
        questionText.includes(
          "documents"
        )
      ) {
        reply +=
          "The current UniAssist knowledge base does **not contain a verified list of required documents** for this notification. Please check the specific official scholarship notification.\n\n";
      }

      /*
       * GENERAL SCHOLARSHIP QUESTION
       */

      else {
        reply +=
          "For detailed eligibility, documents, deadlines, scholarship amounts, and other conditions, students should refer to the specific official scholarship notification.\n\n";
      }

      reply +=
        "Older scholarship notifications from 2025-26 should not automatically be treated as the rules for the 2026-27 session.\n\n";

      reply +=
        `> **Source:** ${sources.join(
          ", "
        )}`;

      return {
        reply,
        sources,
        mode: "local",
      };
    }
  }

  /* =======================================================
     STUDENT RULES AND REGULATIONS
  ======================================================= */

  if (intent === "rules") {
    const rulesChunk =
      relevantChunks.find(
        (item) =>
          item.category === "rules"
      );

    if (rulesChunk) {
      const text =
        question.toLowerCase();

      let reply =
        "According to the current UniAssist knowledge base, ABES Engineering College maintains official procedures and committees related to student welfare, discipline, grievance redressal and anti-ragging.\n\n";

      /*
       * ANTI-RAGGING
       */

      if (
        text.includes("ragging") ||
        text.includes(
          "anti ragging"
        ) ||
        text.includes(
          "anti-ragging"
        )
      ) {
        reply =
          "ABES Engineering College has official anti-ragging requirements. Students are required to comply with applicable anti-ragging regulations and must not engage in ragging or violent behaviour.\n\n" +
          "**Anti-Ragging Helpline:** 1800 180 5522\n\n" +
          "**Email:** info@antiragging.in\n\n" +
          "For the latest requirements, students should follow the official ABES anti-ragging notification and applicable regulations.\n\n";
      }

      /*
       * GRIEVANCE
       */

      else if (
        text.includes(
          "grievance"
        ) ||
        text.includes(
          "complaint"
        ) ||
        text.includes(
          "complain"
        )
      ) {
        reply =
          "ABES Engineering College maintains a **Student's Grievance Redressal Cell (SGRC)** as part of its official committee structure.\n\n" +
          "Students with grievances should use the appropriate official institutional grievance mechanism.\n\n" +
          "The current UniAssist knowledge base does not contain a verified step-by-step grievance procedure or resolution timeline.\n\n";
      }

      /*
       * ATTENDANCE
       */

      else if (
        text.includes(
          "attendance"
        )
      ) {
        reply =
          "The current UniAssist knowledge base does not contain a verified general ABES attendance percentage or specific attendance penalty rule.\n\n" +
          "Attendance requirements can depend on the applicable academic and institutional regulations. Please check the latest official ABES academic or departmental instructions for the specific rule.\n\n";
      }

      /*
       * DISCIPLINE / PENALTIES / FINES
       */

      else if (
        text.includes(
          "discipline"
        ) ||
        text.includes(
          "disciplinary"
        ) ||
        text.includes(
          "penalty"
        ) ||
        text.includes(
          "fine"
        )
      ) {
        reply =
          "ABES Engineering College maintains institutional procedures related to student discipline and welfare.\n\n" +
          "However, the current UniAssist knowledge base does not contain a verified specific disciplinary penalty, fine or consequence for this question.\n\n" +
          "I won't guess the rule. Please check the latest official ABES notification or contact the appropriate college authority.\n\n";
      }

      /*
       * GENERAL RULES
       */

      else {
        reply +=
          "The current verified information covers **anti-ragging, student grievance redressal, student welfare and institutional discipline procedures**.\n\n" +
          "Specific rules such as attendance percentages, fines, classroom restrictions or disciplinary penalties should only be provided when supported by an official ABES source.\n\n";
      }

      reply +=
        `> **Source:** ${sources.join(
          ", "
        )}`;

      return {
        reply,
        sources,
        mode: "local",
      };
    }
  }

  /* =======================================================
     EXAMINATION INFORMATION
  ======================================================= */

  if (
    intent === "examinations"
  ) {
    const examinationChunk =
      relevantChunks.find(
        (item) =>
          item.category ===
          "examinations"
      );

    if (examinationChunk) {
      const questionText =
        normalizeText(question);

      const asksForDate =
        questionText.includes(
          "date"
        ) ||
        questionText.includes(
          "when"
        ) ||
        questionText.includes(
          "schedule"
        );

      if (asksForDate) {
        return {
          reply:
            "I can only provide a specific examination date when a verified and relevant ABES examination schedule or official notice is available in the current knowledge base.\n\n" +
            "The current examination-information source does not contain a specific subject-wise examination date for this question.\n\n" +
            "Please check the latest official ABES Circulars / Notices section.\n\n" +
            `> **Source:** ${sources.join(
              ", "
            )}`,
          sources,
          mode: "local",
        };
      }

      return {
        reply:
          "ABES Engineering College publishes examination-related notifications through its official Circulars / Notices section. These may include examination schedules, examination-form notifications, examination instructions, regular and carry-over examination information, and challenge-evaluation notices.\n\n" +
          "UniAssist does not have direct access to an individual student's examination registration, examination form, timetable, admit card, marks, results or examination status.\n\n" +
          `> **Source:** ${sources.join(
            ", "
          )}`,
        sources,
        mode: "local",
      };
    }
  }

  /* =======================================================
     DEFAULT LOCAL RAG RESPONSE
  ======================================================= */

  const bestChunk =
    relevantChunks[0];

  let reply =
    "According to the current UniAssist knowledge base:\n\n";

  reply +=
    `${bestChunk.content}\n\n`;

  reply +=
    "Please note that UniAssist only provides information supported by the current verified knowledge base. If the required information is not available there, you should check the latest official ABES notice or website.\n\n";

  reply +=
    `> **Source:** ${sources.join(
      ", "
    )}`;

  return {
    reply,
    sources,
    mode: "local",
  };
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  normalizeText,
  detectIntent,
  calculateScore,
  findRelevantKnowledge,
  getRAGContext,
  generateLocalResponse,
};
const { GoogleGenAI } = require("@google/genai");

const university = require("../data/university.json");
const programs = require("../data/programs.json");
const faqs = require("../data/faqs.json");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateAIResponse = async (
  message,
  history = [],
  ragContext = ""
) => {
  try {
    console.log("\n🤖 Gemini AI Request");
    console.log("==============================");

    console.log("💬 User message:", message);
    console.log("🧾 History length:", history.length);

    if (ragContext) {
      console.log("📚 RAG context received");

      console.log("\n========== RAG CONTEXT ==========");
      console.log(ragContext);
      console.log("========== END RAG CONTEXT ==========\n");
    } else {
      console.log("📚 No RAG context found");
    }

    /*
    ==========================================
    UNIVERSITY INFORMATION
    ==========================================
    */

    const universityContext = `
UNIVERSITY INFORMATION:

${JSON.stringify(university, null, 2)}

PROGRAM INFORMATION:

${JSON.stringify(programs, null, 2)}

FAQ INFORMATION:

${JSON.stringify(faqs, null, 2)}
`;

    /*
    ==========================================
    CONVERSATION HISTORY
    ==========================================
    */

    const conversationHistory =
      history.length > 0
        ? history
            .map((item) => {
              return `${item.role}: ${item.content}`;
            })
            .join("\n")
        : "No previous conversation.";

    /*
    ==========================================
    RAG CONTEXT
    ==========================================
    */

    const ragInformation = ragContext
      ? `
OFFICIAL ABES KNOWLEDGE RETRIEVED FOR THIS QUESTION:

${ragContext}
`
      : `
OFFICIAL ABES KNOWLEDGE RETRIEVED FOR THIS QUESTION:

No relevant information was found in the current knowledge base.
`;

    /*
    ==========================================
    GEMINI PROMPT
    ==========================================
    */

    const prompt = `
You are UniAssist AI, an AI-powered student support assistant for ABES Engineering College.

Your purpose is to help university students with academic, administrative, campus, and general student-support questions.

IMPORTANT RULES:

1. Use the supplied official ABES knowledge whenever it is relevant.

2. The retrieved RAG information is the most relevant information found for the student's current question.

3. Do not invent ABES-specific facts.

4. Never fabricate:
   - examination dates
   - class schedules
   - attendance
   - marks
   - results
   - fees
   - notices
   - room numbers
   - faculty information
   - student records
   - deadlines
   - official policies

5. If the retrieved knowledge does not contain the answer, clearly tell the student that the information is not currently available in the UniAssist knowledge base.

6. For information that may change over time, recommend checking the latest official ABES notice, academic calendar, or college website.

7. You do not have direct access to the student's personal college records.

8. Do not claim that you can see a student's:
   - attendance
   - marks
   - timetable
   - examination registration
   - fee status
   - results
   - personal profile
   unless such information is explicitly supplied in the conversation.

9. General educational guidance is allowed.

10. Answer in a concise, clear, student-friendly manner.

11. Use Markdown when it improves readability.

12. If the student asks a follow-up question, use the previous conversation to understand what they mean.

13. Prefer the retrieved official knowledge over assumptions.

14. Never treat missing information as permission to guess.

15. If no relevant RAG information was found, say so instead of making up an ABES-specific answer.

16. When the retrieved RAG knowledge contains a direct answer to the
student's question, answer using that information.

17. Do not claim that information is unavailable when the retrieved
RAG context explicitly contains the requested information.

18. When multiple RAG sources are retrieved, identify the source
section that is most directly related to the student's question.
Use that section as the primary source.

19. Do not treat every retrieved RAG source as equally relevant.
A source about attendance should be preferred for an attendance
question, a source about examinations should be preferred for an
examination question, and so on.

20. If the retrieved knowledge contains a section explaining that
specific information is unavailable, follow that instruction rather
than supplying a commonly assumed value.

21. Never fill missing ABES-specific information using general
college conventions or information from other universities.

22. If a date is marked tentative, clearly state that it is tentative.
Do not convert a tentative date into a confirmed date.

==========================================
UNIVERSITY INFORMATION
==========================================

${universityContext}


==========================================
RETRIEVED RAG KNOWLEDGE
==========================================

${ragInformation}


==========================================
PREVIOUS CONVERSATION
==========================================

${conversationHistory}


==========================================
CURRENT STUDENT QUESTION
==========================================

${message}


==========================================
ANSWER
==========================================

Provide the most accurate answer possible based on the supplied information.
`;

    /*
    ==========================================
    GEMINI API CALL
    ==========================================
    */

    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    const answer = response.text;

    console.log("✅ Gemini response generated");

    return answer;

  } catch (error) {
    console.error("\n❌ Gemini Error");
    console.error("==============================");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error status:", error.status);
    console.error("Error cause:", error.cause);
    console.error("Full error:", error);
    console.error("==============================\n");

    throw error;
  }
};

module.exports = {
  generateAIResponse,
};
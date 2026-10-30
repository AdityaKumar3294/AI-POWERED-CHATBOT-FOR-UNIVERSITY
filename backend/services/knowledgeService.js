const { loadDocuments } = require("./documentService");
const { chunkText } = require("./chunkService");

let knowledgeBase = null;

// ==========================================
// DETERMINE DOCUMENT CATEGORY
// ==========================================

const getCategory = (filename) => {
  const name = filename.toLowerCase();

  if (
    name.includes("academic") ||
    name.includes("calendar")
  ) {
    return "academic-calendar";
  }

  if (
    name.includes("exam") ||
    name.includes("examination")
  ) {
    return "examinations";
  }

  if (
    name.includes("scholarship")
  ) {
    return "scholarships";
  }

  if (
    name.includes("admission")
  ) {
    return "admissions";
  }

  if (
    name.includes("rule") ||
    name.includes("regulation")
  ) {
    return "rules";
  }

  if (
    name.includes("hostel")
  ) {
    return "hostel";
  }

  if (
    name.includes("placement") ||
    name.includes("career")
  ) {
    return "placements";
  }

  if (
    name.includes("fee") ||
    name.includes("fees")
  ) {
    return "fees";
  }

  if (
    name.includes("notice") ||
    name.includes("circular")
  ) {
    return "notices";
  }

  return "general";
};

// ==========================================
// DOCUMENT TITLE
// ==========================================

const getTitle = (filename) => {
  const name = filename.toLowerCase();

  if (name.includes("academic_calendar")) {
    return "ABES Academic Calendar";
  }

  if (
    name.includes("examination") ||
    name.includes("exam")
  ) {
    return "ABES Examination Information";
  }

  if (name.includes("scholarship")) {
    return "ABES Scholarship Information";
  }

  if (name.includes("admission")) {
    return "ABES Admission Information";
  }

  if (
    name.includes("rule") ||
    name.includes("regulation")
  ) {
    return "ABES Student Rules and Regulations";
  }

  if (name.includes("hostel")) {
    return "ABES Hostel Information";
  }

  if (
    name.includes("placement") ||
    name.includes("career")
  ) {
    return "ABES Placement and Career Information";
  }

  if (
    name.includes("fee") ||
    name.includes("fees")
  ) {
    return "ABES Fee Information";
  }

  if (
    name.includes("notice") ||
    name.includes("circular")
  ) {
    return "ABES Official Notice";
  }

  return "ABES General Information";
};

// ==========================================
// ACADEMIC SESSION
// ==========================================

const getAcademicSession = (filename, content) => {
  const combinedText = `${filename} ${content}`;

  // Supports: 2026-2027 or 2026–2027
  const fullSessionMatch = combinedText.match(
    /\b20\d{2}[-–]20\d{2}\b/
  );

  if (fullSessionMatch) {
    return fullSessionMatch[0].replace("–", "-");
  }

  // Supports: 2026-27 or 2026–27
  const shortSessionMatch = combinedText.match(
    /\b20\d{2}[-–]\d{2}\b/
  );

  if (shortSessionMatch) {
    return shortSessionMatch[0].replace("–", "-");
  }

  return null;
};

// ==========================================
// PROGRAM
// ==========================================

const getProgram = (content) => {
  const text = content.toLowerCase();

  if (text.includes("b.tech")) {
    return "B.Tech";
  }

  if (text.includes("mca")) {
    return "MCA";
  }

  if (text.includes("m.tech")) {
    return "M.Tech";
  }

  if (text.includes("mba")) {
    return "MBA";
  }

  return null;
};

// ==========================================
// SEMESTER
// ==========================================

const getSemester = (content) => {
  const text = content.toLowerCase();

  if (
    text.includes("5th and 7th semester")
  ) {
    return "5th and 7th Semester";
  }

  const semesterMatch = text.match(
    /\b(\d{1,2})(st|nd|rd|th)\s+semester\b/i
  );

  if (semesterMatch) {
    return semesterMatch[0];
  }

  return null;
};

// ==========================================
// SOURCE URL
// ==========================================

const getSourceUrl = (category) => {
  switch (category) {
    case "academic-calendar":
      return "https://www.abes.ac.in/Academic-Calender.html";

    case "examinations":
      return "https://www.abes.ac.in/circulars.html";

    case "scholarships":
      return "https://www.abes.ac.in/circulars.html";

    case "notices":
      return "https://www.abes.ac.in/circulars.html";

    default:
      return "https://www.abes.ac.in/";
  }
};

// ==========================================
// BUILD KNOWLEDGE BASE
// ==========================================

const buildKnowledgeBase = async () => {
  console.log("📚 Building knowledge base...");

  const documents = await loadDocuments();

  const chunks = [];

  documents.forEach((document) => {
    const category = getCategory(
      document.filename
    );

    const documentChunks = chunkText(
      document.content
    );

    const title = getTitle(
      document.filename
    );

    const academicSession =
      getAcademicSession(
        document.filename,
        document.content
      );

    const program = getProgram(
      document.content
    );

    const semester = getSemester(
      document.content
    );

    const sourceUrl = getSourceUrl(
      category
    );

    documentChunks.forEach((chunk, index) => {
      chunks.push({
        id: `${document.filename}-${index}`,

        filename: document.filename,

        type: document.type,

        category,

        title,

        academicSession,

        program,

        semester,

        source: "ABES Engineering College",

        sourceUrl,

        content: chunk,
      });
    });
  });

  console.log(
    `🧩 Created ${chunks.length} knowledge chunk(s)`
  );

  // ==========================================
  // DEBUG METADATA
  // ==========================================

  chunks.forEach((chunk, index) => {
    console.log(
      `📦 Chunk ${index + 1}:`,
      {
        id: chunk.id,
        category: chunk.category,
        title: chunk.title,
        academicSession:
          chunk.academicSession,
        program: chunk.program,
        semester: chunk.semester,
      }
    );
  });

  return chunks;
};

// ==========================================
// INITIALIZE KNOWLEDGE BASE
// ==========================================

const initializeKnowledgeBase = async () => {
  if (knowledgeBase !== null) {
    console.log(
      "♻️ Using cached knowledge base"
    );

    return knowledgeBase;
  }

  knowledgeBase =
    await buildKnowledgeBase();

  return knowledgeBase;
};

const rebuildKnowledgeBase = async () => {
  knowledgeBase = await buildKnowledgeBase();
  return knowledgeBase;
};

// ==========================================
// GET KNOWLEDGE
// ==========================================

const getKnowledge = async () => {
  return await initializeKnowledgeBase();
};

module.exports = {
  initializeKnowledgeBase,
  getKnowledge,
};
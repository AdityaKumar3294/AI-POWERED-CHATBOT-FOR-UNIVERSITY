const chunkText = (text) => {
  if (!text || !text.trim()) {
    return [];
  }

  const normalizedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  // ==========================================
  // SPECIAL HANDLING FOR ACADEMIC CALENDAR
  // ==========================================

  if (
    normalizedText.includes("EXAMINATION SCHEDULE") &&
    normalizedText.includes("MT-2 / ST-2")
  ) {
    const chunks = [];

    // ------------------------------------------
    // GENERAL ACADEMIC INFORMATION
    // ------------------------------------------

    const academicInfo = `
ABES ENGINEERING COLLEGE
ACADEMIC CALENDAR

SESSION:
2026-27 Odd Semester

PROGRAM:
B.Tech

SEMESTER:
5th and 7th Semester
`.trim();

    chunks.push(academicInfo);

    // ------------------------------------------
    // MT-1 / ST-1
    // ------------------------------------------

    const mt1Match = normalizedText.match(
      /MT-1 \/ ST-1 Theory Examination:\s*([^\n]+)/i
    );

    if (mt1Match) {
      chunks.push(`
ABES ENGINEERING COLLEGE
EXAMINATION SCHEDULE

MT-1 / ST-1 Theory Examination:
${mt1Match[1].trim()}

This information applies to the 2026-27 Odd Semester
academic calendar for B.Tech 5th and 7th Semester.
`.trim());
    }

    // ------------------------------------------
    // MT-2 / ST-2
    // ------------------------------------------

    const mt2Match = normalizedText.match(
      /MT-2 \/ ST-2 Theory Examination:\s*([^\n]+)/i
    );

    if (mt2Match) {
      chunks.push(`
ABES ENGINEERING COLLEGE
EXAMINATION SCHEDULE

MT-2 / ST-2 Theory Examination:
${mt2Match[1].trim()}

This information applies to the 2026-27 Odd Semester
academic calendar for B.Tech 5th and 7th Semester.

MT-2 may also be referred to as:
- Second Midterm
- Second Mid Term
- Second Internal
- Second Internal Exam
- Second Sessional
- ST-2
`.trim());
    }

    // ------------------------------------------
    // MAKE-UP / PUE
    // ------------------------------------------

    const makeupMatch = normalizedText.match(
      /Make-up \/ PUE Theory Examination:\s*([^\n]+)/i
    );

    if (makeupMatch) {
      chunks.push(`
ABES ENGINEERING COLLEGE
EXAMINATION SCHEDULE

Make-up / PUE Theory Examination:
${makeupMatch[1].trim()}
`.trim());
    }

    // ------------------------------------------
    // END TERM / END SEMESTER
    // ------------------------------------------

    const endTermMatch = normalizedText.match(
      /End Term \/ End Semester Theory Examination:\s*([^\n]+)/i
    );

    if (endTermMatch) {
      chunks.push(`
ABES ENGINEERING COLLEGE
EXAMINATION SCHEDULE

End Term / End Semester Theory Examination:
${endTermMatch[1].trim()}

This information applies to the 2026-27 Odd Semester
academic calendar for B.Tech 5th and 7th Semester.

Important:
The End Term / End Semester Theory Examination dates
are tentative and subject to revision based on
notifications issued by the competent authority.

These dates should not be treated as the final
subject-wise examination date sheet unless a later
official ABES examination notification confirms them.

End Semester may also be referred to as:
- End Term
- End Semester
- End Sem
- Final Examination
- Final Semester Examination
`.trim());
    }

    // ------------------------------------------
    // IMPORTANT NOTES
    // ------------------------------------------

    const importantNoteMatch = normalizedText.match(
      /IMPORTANT NOTE:\s*([\s\S]*?)SOURCE:/i
    );

    if (importantNoteMatch) {
      chunks.push(`
ABES ENGINEERING COLLEGE
ACADEMIC CALENDAR IMPORTANT NOTE

${importantNoteMatch[1].trim()}
`.trim());
    }

    // ------------------------------------------
    // SOURCE
    // ------------------------------------------

    chunks.push(`
ABES ENGINEERING COLLEGE

Official Academic Calendar:
https://www.abes.ac.in/Academic-Calender.html

Official ABES Circulars / Notices:
https://www.abes.ac.in/circulars.html

Source Organization:
ABES Engineering College
19th KM Stone, NH-09, Ghaziabad, Uttar Pradesh
`.trim());

    return chunks;
  }

  console.log(
    "🧪 Student Rules Chunker Check:",
    normalizedText.includes("STUDENT RULES"),
    normalizedText.includes("ATTENDANCE")
  );

  // ==========================================
  // SPECIAL HANDLING FOR STUDENT RULES
  // ==========================================

  if (
    normalizedText.includes("STUDENT RULES") &&
    normalizedText.includes("ATTENDANCE")
  ) {
    const chunks = [];
    console.log("✅ Student Rules special chunking activated");

    // ------------------------------------------
    // GENERAL STUDENT RULES
    // ------------------------------------------

    const generalMatch = normalizedText.match(
      /GENERAL STUDENT RULES INFORMATION([\s\S]*?)(?=ANTI-RAGGING)/i
    );

    if (generalMatch) {
      chunks.push(`
ABES ENGINEERING COLLEGE
STUDENT RULES AND REGULATIONS

INFORMATION CATEGORY:
Student Rules

ACADEMIC SESSION:
2026-27

SOURCE ORGANIZATION:
ABES Engineering College

GENERAL STUDENT RULES INFORMATION

${generalMatch[1].trim()}
`.trim());
    }

    // ------------------------------------------
    // ANTI-RAGGING
    // ------------------------------------------

    const antiRaggingMatch = normalizedText.match(
      /ANTI-RAGGING([\s\S]*?)(?=STUDENT WELFARE AND GRIEVANCE REDRESSAL)/i
    );

    if (antiRaggingMatch) {
      chunks.push(`
ABES ENGINEERING COLLEGE
STUDENT RULES AND REGULATIONS

INFORMATION CATEGORY:
Student Rules

ACADEMIC SESSION:
2026-27

ANTI-RAGGING

${antiRaggingMatch[1].trim()}
`.trim());
    }

    // ------------------------------------------
    // STUDENT WELFARE & GRIEVANCE
    // ------------------------------------------

    const grievanceMatch = normalizedText.match(
      /STUDENT WELFARE AND GRIEVANCE REDRESSAL([\s\S]*?)(?=ATTENDANCE)/i
    );

    if (grievanceMatch) {
      chunks.push(`
ABES ENGINEERING COLLEGE
STUDENT RULES AND REGULATIONS

INFORMATION CATEGORY:
Student Rules

ACADEMIC SESSION:
2026-27

STUDENT WELFARE AND GRIEVANCE REDRESSAL

${grievanceMatch[1].trim()}
`.trim());
    }

    // ------------------------------------------
    // ATTENDANCE
    // ------------------------------------------

    const attendanceMatch = normalizedText.match(
      /={10,}\s*ATTENDANCE\s*={10,}([\s\S]*?)(?=={10,}\s*DISCIPLINE)/i
    );

    if (attendanceMatch) {
      chunks.push(`
ABES ENGINEERING COLLEGE
STUDENT RULES AND REGULATIONS

INFORMATION CATEGORY:
Student Rules

ACADEMIC SESSION:
2026-27

ATTENDANCE

${attendanceMatch[1].trim()}
`.trim());
    }

    return chunks;
  }

  // ==========================================
  // DEFAULT TEXT CHUNKING
  // ==========================================

  const words = normalizedText.split(/\s+/);

  const chunkSize = 300;

  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words
      .slice(i, i + chunkSize)
      .join(" ");

    if (chunk.trim()) {
      chunks.push(chunk.trim());
    }
  }

  return chunks;
};

module.exports = {
  chunkText,
};
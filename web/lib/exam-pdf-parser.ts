type ParsedChoice = {
  label: string;
  text: string;
  isCorrect: boolean;
};

export type ParsedExamQuestion = {
  question: string;
  type: "mcq" | "open";
  choices: ParsedChoice[];
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeLabel(raw: string) {
  const normalized = raw.toUpperCase();

  if (normalized === "А") {
    return "A";
  }

  if (normalized === "В") {
    return "B";
  }

  if (normalized === "С") {
    return "C";
  }

  if (normalized === "Д") {
    return "D";
  }

  if (["A", "B", "C", "D"].includes(normalized)) {
    return normalized;
  }

  return "";
}

function sanitizeQuestionText(value: string) {
  return normalizeWhitespace(
    value
      .replace(/^[-–—\s]+/, "")
      .replace(/["“”]/g, "")
      .replace(/\s+[a-dA-DА-ВСД]\s*[\)\.]\s*$/u, ""),
  );
}

function getVariantASegment(raw: string) {
  const normalized = raw.replace(/\r/g, "\n");
  const start = normalized.search(/1\s*-\s*Р\s*ХЭСЭГ/i);

  if (start < 0) {
    return normalized;
  }

  const fromStart = normalized.slice(start);
  const endMatch = fromStart.search(/(?:["“”]?\s*B\s*["“”]?\s*Хувилбар|ТҮЛХҮҮР)/i);

  if (endMatch < 0) {
    return fromStart;
  }

  return fromStart.slice(0, endMatch);
}

function splitMcqAndOpenSections(value: string) {
  const markerMatch = value.match(/2\s*-\s*Р\s*ХЭСЭГ/i);

  if (!markerMatch || typeof markerMatch.index !== "number") {
    return {
      mcqPart: value,
      openPart: "",
    };
  }

  return {
    mcqPart: value.slice(0, markerMatch.index),
    openPart: value.slice(markerMatch.index + markerMatch[0].length),
  };
}

function splitNumberedBlocks(value: string) {
  const blocks: string[] = [];
  const questionRegex = /(?:^|\s)(\d{1,2})\.\s*/g;
  const matches = [...value.matchAll(questionRegex)];

  if (matches.length === 0) {
    return blocks;
  }

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? value.length;
    const chunk = normalizeWhitespace(value.slice(start, end));

    if (chunk) {
      blocks.push(chunk);
    }
  }

  return blocks;
}

function parseChoicesFromMcqBlock(block: string) {
  const choiceRegex = /([a-dA-DАВСД])\s*[\)\.]\s*/giu;
  const matches = [...block.matchAll(choiceRegex)];

  if (matches.length < 2) {
    return null;
  }

  const first = matches[0];
  const firstIndex = first.index ?? 0;
  const question = sanitizeQuestionText(block.slice(0, firstIndex));
  const parsedChoices: ParsedChoice[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const rawLabel = current[1];
    const label = normalizeLabel(rawLabel);

    if (!label) {
      continue;
    }

    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? block.length;
    const text = normalizeWhitespace(block.slice(start, end));

    parsedChoices.push({
      label,
      text,
      isCorrect: false,
    });
  }

  if (!question || parsedChoices.length < 2) {
    return null;
  }

  const deduped = parsedChoices
    .sort((a, b) => a.label.localeCompare(b.label))
    .filter((choice, index, arr) =>
      index === arr.findIndex((candidate) => candidate.label === choice.label),
    )
    .map((choice, index) => ({
      ...choice,
      label: String.fromCharCode(65 + index),
    }));

  return {
    question,
    choices: deduped,
  };
}

function parseAnswerKeyLetters(raw: string, expectedCount: number) {
  const keyStart = raw.search(/ТҮЛХҮҮР/i);

  if (keyStart < 0) {
    return [];
  }

  const keyText = raw.slice(keyStart, keyStart + 1200);
  const letterMatches = [...keyText.matchAll(/\b([A-DАВСД])\b/giu)];
  const letters: string[] = [];

  for (const match of letterMatches) {
    const normalized = normalizeLabel(match[1]);

    if (normalized) {
      letters.push(normalized);
    }

    if (letters.length >= expectedCount) {
      break;
    }
  }

  return letters;
}

export function parseExamQuestionsFromPdfText(rawText: string): ParsedExamQuestion[] {
  const normalized = normalizeWhitespace(rawText);

  if (!normalized) {
    return [];
  }

  const variantA = getVariantASegment(normalized);
  const { mcqPart, openPart } = splitMcqAndOpenSections(variantA);

  const mcqBlocks = splitNumberedBlocks(mcqPart);
  const mcqQuestions: ParsedExamQuestion[] = [];

  for (const block of mcqBlocks) {
    const parsed = parseChoicesFromMcqBlock(block);

    if (!parsed) {
      continue;
    }

    mcqQuestions.push({
      question: parsed.question,
      type: "mcq",
      choices: parsed.choices,
    });
  }

  const answerKeyLetters = parseAnswerKeyLetters(rawText, mcqQuestions.length);
  const mcqWithKey = mcqQuestions.map((question, index) => {
    const expected = answerKeyLetters[index];

    return {
      ...question,
      choices: question.choices.map((choice) => ({
        ...choice,
        isCorrect: expected ? choice.label === expected : choice.label === "A",
      })),
    };
  });

  const openBlocks = splitNumberedBlocks(openPart);
  const openQuestions: ParsedExamQuestion[] = openBlocks
    .map((block) => sanitizeQuestionText(block))
    .filter(Boolean)
    .map((question) => ({
      question,
      type: "open",
      choices: [],
    }));

  return [...mcqWithKey, ...openQuestions];
}

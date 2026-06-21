// BillPocket — bank-statement format parsers (CSV/PDF/DOCX/XLSX/OFX/QIF/loose)
// Classic (non-module) script. Loaded in dependency order from index.html.
// Shares the global scope with the other js/*.js files; do not add import/export.

async function extractDocxText(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const entries = parseZipEntries(bytes);
  const documentEntry = entries.find((entry) => entry.name === "word/document.xml");
  if (!documentEntry) {
    throw new Error("This DOCX does not contain a readable Word document body.");
  }

  const xmlBytes = await readZipEntry(bytes, documentEntry);
  const xml = new TextDecoder("utf-8").decode(xmlBytes);
  return decodeXmlEntities(
    xml
      .replace(/<w:tab\/>/g, "\t")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/[^\S\r\n]+/g, " ")
      .replace(/\n\s+/g, "\n"),
  );
}

async function extractXlsxText(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const entries = parseZipEntries(bytes);
  const sharedStrings = await readXlsxSharedStrings(bytes, entries);
  const sheetEntries = entries.filter((entry) => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry.name));

  if (sheetEntries.length === 0) {
    throw new Error("This XLSX does not contain readable sheets.");
  }

  const lines = [];
  for (const entry of sheetEntries) {
    const xml = new TextDecoder("utf-8").decode(await readZipEntry(bytes, entry));
    lines.push(...extractXlsxRows(xml, sharedStrings));
  }

  return lines.join("\n");
}

async function readXlsxSharedStrings(bytes, entries) {
  const sharedEntry = entries.find((entry) => entry.name === "xl/sharedStrings.xml");
  if (!sharedEntry) {
    return [];
  }

  const xml = new TextDecoder("utf-8").decode(await readZipEntry(bytes, sharedEntry));
  return [...xml.matchAll(/<si[\s\S]*?<\/si>/g)].map((match) => {
    const text = [...match[0].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((textMatch) => decodeXmlEntities(textMatch[1])).join("");
    return text.replace(/\s+/g, " ").trim();
  });
}

function extractXlsxRows(xml, sharedStrings) {
  return [...xml.matchAll(/<row[\s\S]*?<\/row>/g)]
    .map((rowMatch) => {
      const cells = [...rowMatch[0].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)].map((cellMatch) => {
        const attrs = cellMatch[1];
        const body = cellMatch[2];
        const valueMatch = body.match(/<v>([\s\S]*?)<\/v>/);
        const inlineMatch = body.match(/<is>([\s\S]*?)<\/is>/);

        if (attrs.includes('t="s"') && valueMatch) {
          return sharedStrings[Number(valueMatch[1])] || "";
        }

        if (attrs.includes('t="inlineStr"') && inlineMatch) {
          return decodeXmlEntities([...inlineMatch[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((match) => match[1]).join(""));
        }

        return valueMatch ? decodeXmlEntities(valueMatch[1]) : "";
      });

      return cells.map(csvCell).join(",");
    })
    .filter((line) => line.replace(/[",]/g, "").trim());
}

function parseZipEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocdOffset = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65558); offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      eocdOffset = offset;
      break;
    }
  }

  if (eocdOffset < 0) {
    throw new Error("This DOCX could not be opened as a document archive.");
  }

  const entryCount = view.getUint16(eocdOffset + 10, true);
  let offset = view.getUint32(eocdOffset + 16, true);
  const entries = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) {
      break;
    }

    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const nameBytes = bytes.slice(offset + 46, offset + 46 + nameLength);
    const name = new TextDecoder("utf-8").decode(nameBytes);

    entries.push({ name, method, compressedSize, uncompressedSize, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

async function readZipEntry(bytes, entry) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const localOffset = entry.localHeaderOffset;
  if (view.getUint32(localOffset, true) !== 0x04034b50) {
    throw new Error("This DOCX has an unreadable document part.");
  }

  const nameLength = view.getUint16(localOffset + 26, true);
  const extraLength = view.getUint16(localOffset + 28, true);
  const dataStart = localOffset + 30 + nameLength + extraLength;
  const compressed = bytes.slice(dataStart, dataStart + entry.compressedSize);

  if (entry.method === 0) {
    return compressed;
  }

  if (entry.method === 8) {
    return inflateBytes(compressed, entry.uncompressedSize);
  }

  throw new Error("This DOCX compression method is not supported in the browser.");
}

async function inflateBytes(bytes, expectedSize) {
  if (!("DecompressionStream" in window)) {
    throw new Error("This browser cannot extract DOCX files locally. Paste the statement text or use CSV.");
  }

  for (const format of ["deflate-raw", "deflate"]) {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
      const inflated = new Uint8Array(await new Response(stream).arrayBuffer());
      if (!expectedSize || inflated.length === expectedSize) {
        return inflated;
      }
    } catch (error) {
      // Try the next deflate variant.
    }
  }

  throw new Error("This compressed DOCX text could not be extracted locally.");
}

async function extractPdfTextBestEffort(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const raw = new TextDecoder("latin1").decode(bytes);
  const streamTexts = await extractPdfStreams(bytes, raw);
  const positionedText = extractPdfPositionedLines(streamTexts);
  const operatorText = extractPdfTextOperators(`${raw}\n${streamTexts.join("\n")}`);
  return `${positionedText}\n${operatorText}`.trim();
}

function extractPdfPositionedLines(streamTexts) {
  const lines = [];
  const structuredRows = [];
  const textMatrixPattern = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+Tm/g;

  streamTexts.forEach((streamText, streamIndex) => {
    if (!streamText.includes(" Tm") || (!streamText.includes("Tj") && !streamText.includes("TJ")) || !isMostlyPrintable(streamText)) {
      return;
    }

    const matrices = [...streamText.matchAll(textMatrixPattern)];
    const chunks = [];

    matrices.forEach((matrix, index) => {
      const x = Number(matrix[5]);
      const y = Number(matrix[6]);
      const end = matrices[index + 1]?.index ?? Math.min(streamText.length, matrix.index + 500);
      const segment = streamText.slice(matrix.index + matrix[0].length, end);
      const text = extractPdfLiteralStrings(segment).join("").trim();

      if (text && Number.isFinite(x) && Number.isFinite(y)) {
        chunks.push({ streamIndex, x, y, text });
      }
    });

    groupPdfChunksIntoLineGroups(chunks).forEach((group) => {
      lines.push(pdfLineGroupToText(group));
      const structuredRow = pdfLineGroupToStatementCsv(group);
      if (structuredRow) {
        structuredRows.push(structuredRow);
      }
    });
  });

  const structuredText = structuredRows.length > 0 ? ["Date,Description,Type,Money In,Money Out,Balance", ...structuredRows].join("\n") : "";
  return `${structuredText}\n${lines.join("\n")}`.trim();
}

function isMostlyPrintable(value) {
  if (!value) {
    return false;
  }

  const printable = [...value].filter((character) => {
    const code = character.charCodeAt(0);
    return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126) || code >= 160;
  }).length;
  return printable / value.length > 0.85;
}

function extractPdfLiteralStrings(value) {
  return [...value.matchAll(/\((?:\\.|[^\\)])*\)/g)]
    .map((match) => decodePdfString(match[0].slice(1, -1)).trim())
    .filter(Boolean);
}

function groupPdfChunksIntoLineGroups(chunks) {
  const lineGroups = [];

  chunks
    .sort((a, b) => b.y - a.y || a.x - b.x)
    .forEach((chunk) => {
      const group = lineGroups.find((line) => line.streamIndex === chunk.streamIndex && Math.abs(line.y - chunk.y) < 3);
      if (group) {
        group.items.push(chunk);
      } else {
        lineGroups.push({ streamIndex: chunk.streamIndex, y: chunk.y, items: [chunk] });
      }
    });

  return lineGroups.map((line) => line.items.sort((a, b) => a.x - b.x));
}

function pdfLineGroupToText(items) {
  return items
    .map((item) => item.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfLineGroupToStatementCsv(items) {
  const dateItem = items.find((item) => isStatementDateText(item.text));
  if (!dateItem) {
    return "";
  }

  const moneyIn = findPdfAmountByColumn(items, 300, 420);
  const moneyOut = findPdfAmountByColumn(items, 420, 500);
  const balance = findPdfAmountByColumn(items, 500, 620);
  if (!moneyIn && !moneyOut) {
    return "";
  }

  const typeItem = items.find((item) => item.x >= 245 && item.x < 315 && /^[A-Za-z]{1,5}$/.test(item.text));
  const description = items
    .filter((item) => item.x >= 90 && item.x < 300)
    .filter((item) => item !== typeItem)
    .filter((item) => !isStatementDateText(item.text) && !isAmountText(item.text) && !/^(blank|type)$/i.test(item.text))
    .map((item) => item.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (isStatementNonTransactionText(description || pdfLineGroupToText(items))) {
    return "";
  }

  const row = [dateItem.text, description || "Transaction", typeItem?.text || "", moneyIn, moneyOut, balance];
  return row.map(csvCell).join(",");
}

function findPdfAmountByColumn(items, minX, maxX) {
  const item = items.find((candidate) => candidate.x >= minX && candidate.x < maxX && isAmountText(candidate.text));
  return item ? item.text : "";
}

function isStatementDateText(value) {
  return /^(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})$/.test(value.trim());
}

function isAmountText(value) {
  return /^[-(]?\s*[£$€₹Ł]?\s*\d[\d,]*\.\d{2}\)?\.?$/.test(value.trim());
}

async function extractPdfStreams(bytes, raw) {
  const texts = [];
  const streamPattern = /<<([\s\S]*?)>>\s*stream\r?\n?/g;
  let match;

  while ((match = streamPattern.exec(raw))) {
    const streamStart = streamPattern.lastIndex;
    const endIndex = raw.indexOf("endstream", streamStart);
    if (endIndex < 0) {
      break;
    }

    const streamEnd = raw[endIndex - 1] === "\n" && raw[endIndex - 2] === "\r" ? endIndex - 2 : raw[endIndex - 1] === "\n" ? endIndex - 1 : endIndex;
    const streamBytes = bytes.slice(streamStart, streamEnd);

    if (/FlateDecode/.test(match[1]) && "DecompressionStream" in window) {
      try {
        const inflated = await inflatePdfStream(streamBytes);
        texts.push(new TextDecoder("latin1").decode(inflated));
      } catch (error) {
        // Some PDFs use filters this demo intentionally does not support.
      }
    } else if (!/Filter/.test(match[1])) {
      texts.push(new TextDecoder("latin1").decode(streamBytes));
    }

    streamPattern.lastIndex = endIndex + "endstream".length;
  }

  return texts;
}

async function inflatePdfStream(bytes) {
  for (const format of ["deflate", "deflate-raw"]) {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch (error) {
      // Try the next deflate variant.
    }
  }
  throw new Error("Could not inflate PDF stream.");
}

function extractPdfTextOperators(text) {
  const blocks = [...text.matchAll(/BT([\s\S]*?)ET/g)].map((match) => match[1]).join("\n") || text;
  const pieces = [];

  for (const match of blocks.matchAll(/\((?:\\.|[^\\)])*\)/g)) {
    pieces.push(decodePdfString(match[0].slice(1, -1)));
  }

  for (const match of blocks.matchAll(/<([0-9A-Fa-f\s]{4,})>/g)) {
    const decoded = decodePdfHexString(match[1]);
    if (decoded.trim()) {
      pieces.push(decoded);
    }
  }

  return pieces
    .join("\n")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function decodePdfString(value) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}

function decodePdfHexString(value) {
  const hex = value.replace(/\s+/g, "");
  if (hex.length < 4) {
    return "";
  }

  const bytes = [];
  for (let index = 0; index < hex.length - 1; index += 2) {
    bytes.push(parseInt(hex.slice(index, index + 2), 16));
  }

  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    let text = "";
    for (let index = 2; index < bytes.length - 1; index += 2) {
      text += String.fromCharCode((bytes[index] << 8) + bytes[index + 1]);
    }
    return text;
  }

  return new TextDecoder("latin1").decode(new Uint8Array(bytes));
}

function parseStatementText(text) {
  const cleanText = text.replace(/^\uFEFF/, "").trim();
  if (!cleanText) {
    return [];
  }

  const ofxTransactions = parseOfxStatement(cleanText);
  if (ofxTransactions.length > 0) {
    return ofxTransactions;
  }

  const qifTransactions = parseQifStatement(cleanText);
  if (qifTransactions.length > 0) {
    return qifTransactions;
  }

  const delimiter = detectDelimiter(cleanText);
  const rows = parseDelimitedRows(cleanText, delimiter).filter((row) => row.some((cell) => cell.trim()));
  if (rows.length < 2) {
    return parseLooseStatementText(cleanText);
  }

  const header = rows[0].map(normalizeHeader);
  const indexes = detectStatementColumns(header);
  const hasUsefulColumns = indexes.date >= 0 && indexes.description >= 0 && (indexes.amount >= 0 || indexes.debit >= 0);
  if (!hasUsefulColumns) {
    return parseLooseStatementText(cleanText);
  }

  const parsedRows = rows
    .slice(1)
    .map((row, rowIndex) => normalizeStatementRow(row, indexes, rowIndex))
    .filter(Boolean);

  const transactions = parsedRows.filter((transaction) => transaction.spending > 0 || transaction.income > 0);
  return transactions.length > 0
    ? reconcileTransactionsWithBalances(parsedRows).filter((transaction) => !transaction.isBalanceOnly && (transaction.spending > 0 || transaction.income > 0))
    : parseLooseStatementText(cleanText);
}

function reconcileTransactionsWithBalances(transactions) {
  const rowsWithBalance = transactions.filter((transaction) => Number.isFinite(Number(transaction.balance)));
  if (rowsWithBalance.length < 2) {
    return transactions;
  }

  const orderedRows = [...transactions].sort((a, b) => Number(a.sourceOrder || 0) - Number(b.sourceOrder || 0));
  const forwardScore = scoreBalanceDirection(orderedRows, "forward");
  const reverseScore = scoreBalanceDirection(orderedRows, "reverse");
  const direction = reverseScore.matches > forwardScore.matches ? "reverse" : "forward";

  return orderedRows
    .map((transaction, index, list) => applyBalanceCheck(transaction, index, list, direction))
    .sort((a, b) => Number(a.sourceOrder || 0) - Number(b.sourceOrder || 0));
}

function reconcileStoredStatementTransactions(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return transactions;
  }

  const groups = new Map();
  transactions.forEach((transaction) => {
    const key = `${transaction.account || "Unknown"}|${transaction.importBatch || ""}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(transaction);
  });

  const out = [];
  groups.forEach((group) => {
    const ordered = [...group].sort(compareStatementOrder);
    const hasBalance = ordered.some((transaction) => Number.isFinite(Number(transaction.balance)));
    out.push(...(hasBalance ? reconcileTransactionsWithBalances(ordered) : ordered));
  });

  return sortTransactionsByStatementOrder(out);
}

function scoreBalanceDirection(rows, direction) {
  let matches = 0;
  let checked = 0;

  rows.forEach((transaction, index) => {
    const balanceDelta = getBalanceDelta(rows, index, direction);
    if (balanceDelta === null) {
      return;
    }

    checked += 1;
    if (moneyAlmostEqual(balanceDelta, getSignedTransactionAmount(transaction))) {
      matches += 1;
    }
  });

  return { matches, checked };
}

function applyBalanceCheck(transaction, index, rows, direction) {
  if (transaction.reviewedAt) {
    return { ...transaction, balanceCheck: transaction.balanceCheck || "" };
  }

  const balanceDelta = getBalanceDelta(rows, index, direction);
  if (balanceDelta === null) {
    return { ...transaction, balanceCheck: transaction.balanceCheck || "" };
  }

  const signedAmount = getSignedTransactionAmount(transaction);
  if (moneyAlmostEqual(balanceDelta, signedAmount)) {
    return { ...transaction, balanceCheck: "ok" };
  }

  const rowAmount = Math.max(Number(transaction.income) || 0, Number(transaction.spending) || 0);
  const allowFlip = rowAmount > 0 && (transaction.needsReconcile || moneyAlmostEqual(Math.abs(balanceDelta), rowAmount));
  if (allowFlip) {
    return {
      ...transaction,
      income: balanceDelta > 0 ? roundMoney(Math.abs(balanceDelta)) : 0,
      spending: balanceDelta < 0 ? roundMoney(Math.abs(balanceDelta)) : 0,
      balanceCheck: "corrected",
    };
  }

  return {
    ...transaction,
    balanceCheck: "mismatch",
  };
}

function getBalanceDelta(rows, index, direction) {
  const currentBalance = Number(rows[index]?.balance);
  if (!Number.isFinite(currentBalance)) {
    return null;
  }

  if (direction === "forward") {
    const previousBalance = Number(rows[index - 1]?.balance);
    return Number.isFinite(previousBalance) ? roundMoney(currentBalance - previousBalance) : null;
  }

  const nextBalance = Number(rows[index + 1]?.balance);
  return Number.isFinite(nextBalance) ? roundMoney(currentBalance - nextBalance) : null;
}

function getSignedTransactionAmount(transaction) {
  return roundMoney((Number(transaction.income) || 0) - (Number(transaction.spending) || 0));
}

function parseOfxStatement(text) {
  const blocks = [...text.matchAll(/<STMTTRN>([\s\S]*?)(?=<STMTTRN>|<\/BANKTRANLIST>|$)/gi)].map((match) => match[1]);
  return blocks
    .map((block) => {
      const amount = parseMoneyValue(readOfxTag(block, "TRNAMT"));
      const date = parseOfxDate(readOfxTag(block, "DTPOSTED"));
      const description = readOfxTag(block, "NAME") || readOfxTag(block, "MEMO") || "Transaction";
      const spending = amount < 0 ? Math.abs(amount) : 0;
      const income = amount > 0 ? amount : 0;

      if (!date || (!spending && !income)) {
        return null;
      }

      return {
        date,
        description,
        merchant: normalizeMerchant(description),
        spending,
        income,
        category: categorizeStatement(description),
      };
    })
    .filter(Boolean);
}

function readOfxTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, "i"));
  return match ? match[1].trim() : "";
}

function parseOfxDate(value) {
  const match = String(value || "").match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) {
    return "";
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function parseQifStatement(text) {
  const records = text.split(/\n\^/).map((record) => record.replace(/^\^/, "").trim()).filter(Boolean);
  return records
    .map((record) => {
      const lines = record.split(/\r?\n/);
      const dateLine = lines.find((line) => line.startsWith("D")) || "";
      const amountLine = lines.find((line) => line.startsWith("T")) || "";
      const payeeLine = lines.find((line) => line.startsWith("P")) || "";
      const memoLine = lines.find((line) => line.startsWith("M")) || "";
      const amount = parseMoneyValue(amountLine.slice(1));
      const date = parseStatementDate(dateLine.slice(1));
      const description = (payeeLine.slice(1) || memoLine.slice(1) || "Transaction").trim();
      const spending = amount < 0 ? Math.abs(amount) : 0;
      const income = amount > 0 ? amount : 0;

      if (!date || (!spending && !income)) {
        return null;
      }

      return {
        date,
        description,
        merchant: normalizeMerchant(description),
        spending,
        income,
        category: categorizeStatement(description),
      };
    })
    .filter(Boolean);
}

function parseLooseStatementText(text) {
  const parsedRows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, lineIndex) => parseLooseStatementLine(line, lineIndex))
    .filter(Boolean);

  const transactions = parsedRows.filter((transaction) => transaction.spending > 0 || transaction.income > 0);
  return transactions.length > 0
    ? reconcileTransactionsWithBalances(parsedRows).filter((transaction) => !transaction.isBalanceOnly && (transaction.spending > 0 || transaction.income > 0))
    : [];
}

function parseLooseStatementLine(line, sourceOrder = 0) {
  if (isStatementNonTransactionText(line)) {
    return null;
  }

  const dateMatch = line.match(/\b(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})\b/);
  const amountMatches = [...line.matchAll(/[£$€₹]\s*\d[\d,]*(?:\.\d{1,2})?|[-(]?\s*[£$€₹]?\s*\d[\d,]*\.\d{2}\)?/g)];
  if (!dateMatch || amountMatches.length === 0) {
    return null;
  }

  if (amountMatches.length === 1 && /\b(opening balance|closing balance|previous balance|balance brought forward|brought forward|balance)\b/i.test(line)) {
    const date = parseStatementDate(dateMatch[0]);
    const balance = parseOptionalMoneyValue(amountMatches[0][0]);
    return date && Number.isFinite(balance)
      ? {
          date,
          description: "Balance",
          merchant: "Balance",
          spending: 0,
          income: 0,
          balance,
          balanceCheck: "",
          sourceOrder,
          category: "Other",
          isBalanceOnly: true,
        }
      : null;
  }

  const amountText = chooseLooseAmount(line, amountMatches);
  const amount = parseMoneyValue(amountText);
  const balanceText = amountMatches.length > 1 ? amountMatches[amountMatches.length - 1][0] : "";
  const balance = amountMatches.length > 1 && balanceText !== amountText ? parseOptionalMoneyValue(balanceText) : null;
  const directionHint = getStatementDirectionHint(line);
  const debitWords = /\b(payment|withdrawal|debit|purchase|atm|standing order|direct debit|bill|charge|fee|paid out|transfer to|spent|fpo|faster payment out)\b/i;
  const incomeWords = /\b(salary|wage|payroll|deposit|refund|credit|credited|paid in|interest paid|transfer from|received|reimbursement|cashback|bacs in|fpi|faster payment in)\b/i;
  const explicitNegative = /[-(]\s*[£$€₹]?\s*\d/.test(amountText) || /\bdr\b/i.test(line);
  const explicitPositive = /\bcr\b/i.test(line);
  const looksDebit = debitWords.test(line);
  const looksIncome = incomeWords.test(line);
  let direction;
  if (amount < 0 || explicitNegative) {
    direction = "out";
  } else if (directionHint) {
    direction = directionHint;
  } else if (explicitPositive || (looksIncome && !looksDebit)) {
    direction = "in";
  } else if (looksDebit && !looksIncome) {
    direction = "out";
  } else {
    direction = null;
  }
  const magnitude = Math.abs(amount);
  const spending = direction === "out" ? magnitude : direction === null ? magnitude : 0;
  const income = direction === "in" ? magnitude : 0;
  const needsReconcile = direction === null;
  const date = parseStatementDate(dateMatch[0]);
  let description = line.replace(dateMatch[0], " ");
  amountMatches.forEach((match) => {
    description = description.replace(match[0], " ");
  });
  description = description
    .replace(/\s+/g, " ")
    .trim();

  if (!date || (!spending && !income) || !description) {
    return null;
  }

  return {
    date,
    description,
    merchant: normalizeMerchant(description),
    spending,
    income,
    balance,
    balanceCheck: "",
    sourceOrder,
    category: categorizeStatement(description),
    needsReconcile,
  };
}

function chooseLooseAmount(line, amountMatches) {
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes("balance") && amountMatches.length > 1) {
    return amountMatches[0][0];
  }
  if (amountMatches.length > 1) {
    return amountMatches[0][0];
  }
  return amountMatches[amountMatches.length - 1][0];
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || "";
  const candidates = [",", "\t", ";"];
  return candidates
    .map((delimiter) => ({ delimiter, count: firstLine.split(delimiter).length }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function parseDelimitedRows(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell.trim());
  rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isStatementNonTransactionText(value) {
  const text = normalizeKeyText(value);
  if (!text) {
    return false;
  }

  const headerLike = text.includes("money in") && text.includes("money out") && text.includes("balance");
  const balanceSummary = text.includes("money out") && (text.includes("balance on") || text.includes("balance"));
  const balanceOnly = /\b(opening balance|closing balance|previous balance|balance brought forward|brought forward|balance on)\b/i.test(String(value || ""));
  const noMerchantText = /^(date )?(description )?(type )?(money in )?money out (balance )?(on )?/.test(text);
  return headerLike || balanceSummary || balanceOnly || noMerchantText;
}

function getStatementDirectionHint(value) {
  const text = normalizeKeyText(value);
  if (/\b(fpi|faster payment in|paid in|money in|bacs in|credit from|credited|received)\b/.test(text)) {
    return "in";
  }
  if (/\b(fpo|faster payment out|paid out|money out|direct debit|debit|card payment|purchase|withdrawal)\b/.test(text)) {
    return "out";
  }
  return "";
}

function detectStatementColumns(header) {
  const findIndex = (terms) => header.findIndex((label) => terms.some((term) => label.includes(term)));
  return {
    date: findIndex(["date", "posted", "transaction date"]),
    description: findIndex(["description", "details", "narrative", "merchant", "payee", "name", "reference"]),
    type: findIndex(["type", "transaction type"]),
    amount: findIndex(["amount", "value", "transaction amount"]),
    debit: findIndex(["debit", "paid out", "money out", "withdrawal", "spent"]),
    credit: findIndex(["credit", "paid in", "money in", "deposit"]),
    balance: findIndex(["balance", "running balance"]),
  };
}

function normalizeStatementRow(row, indexes, rowIndex = 0) {
  const dateValue = row[indexes.date] || row[0] || "";
  const description = row[indexes.description] || row[1] || "Transaction";
  const typeText = indexes.type >= 0 ? row[indexes.type] || "" : "";
  const amount = indexes.amount >= 0 ? parseMoneyValue(row[indexes.amount]) : 0;
  const debit = indexes.debit >= 0 ? parseMoneyValue(row[indexes.debit]) : 0;
  const credit = indexes.credit >= 0 ? parseMoneyValue(row[indexes.credit]) : 0;
  const balance = indexes.balance >= 0 ? parseOptionalMoneyValue(row[indexes.balance]) : null;
  const directionHint = getStatementDirectionHint(`${typeText} ${description}`);
  let spending = indexes.debit >= 0 && debit !== 0 ? Math.abs(debit) : amount < 0 ? Math.abs(amount) : 0;
  let income = indexes.credit >= 0 && credit !== 0 ? Math.abs(credit) : amount > 0 ? amount : 0;
  const visibleAmount = Math.max(Math.abs(debit), Math.abs(credit), Math.abs(amount));
  const date = parseStatementDate(dateValue);

  if (directionHint === "in" && visibleAmount > 0) {
    income = visibleAmount;
    spending = 0;
  }

  if (directionHint === "out" && visibleAmount > 0) {
    spending = visibleAmount;
    income = 0;
  }

  if (!date) {
    return null;
  }

  if (isStatementNonTransactionText(description)) {
    return null;
  }

  if (!spending && !income) {
    return Number.isFinite(balance)
      ? {
          date,
          description: description.trim() || "Balance",
          merchant: "Balance",
          spending: 0,
          income: 0,
          balance,
          balanceCheck: "",
          sourceOrder: rowIndex,
          category: "Other",
          isBalanceOnly: true,
        }
      : null;
  }

  return {
    date,
    description: description.trim(),
    merchant: normalizeMerchant(description),
    spending,
    income,
    balance: Number.isFinite(balance) ? balance : null,
    balanceCheck: "",
    sourceOrder: rowIndex,
    category: categorizeStatement(description),
  };
}

function parseMoneyValue(value) {
  const text = String(value || "").trim();
  if (!text) {
    return 0;
  }

  const isNegative = /\(|-|dr\b/i.test(text);
  const cleaned = text.replace(/[^\d.,-]/g, "").replace(/,/g, "").replace(/\.(?=.*\.)/g, "").replace(/\.$/, "");
  const number = Number(cleaned);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return isNegative ? -Math.abs(number) : number;
}

function parseOptionalMoneyValue(value) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }

  const amount = parseMoneyValue(text);
  return Number.isFinite(amount) ? amount : null;
}

function parseStatementDate(value) {
  const text = String(value || "").trim();
  const excelSerial = Number(text);
  if (/^\d{5}(?:\.\d+)?$/.test(text) && Number.isFinite(excelSerial)) {
    return toDateInputValue(new Date(Math.round((excelSerial - 25569) * 86400000)));
  }

  const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    return toDateInputValue(new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])));
  }

  const monthNameMatch = text.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})$/);
  if (monthNameMatch) {
    const monthIndex = monthNameToIndex(monthNameMatch[2]);
    const year = Number(monthNameMatch[3].length === 2 ? `20${monthNameMatch[3]}` : monthNameMatch[3]);
    if (monthIndex >= 0) {
      return toDateInputValue(new Date(year, monthIndex, Number(monthNameMatch[1])));
    }
  }

  const slashMatch = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (slashMatch) {
    const year = Number(slashMatch[3].length === 2 ? `20${slashMatch[3]}` : slashMatch[3]);
    return toDateInputValue(new Date(year, Number(slashMatch[2]) - 1, Number(slashMatch[1])));
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return toDateInputValue(parsed);
}

function monthNameToIndex(value) {
  const month = value.slice(0, 3).toLowerCase();
  return ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(month);
}

function categorizeStatement(description) {
  const text = description.toLowerCase();
  const match = statementCategoryRules.find((rule) => rule.words.some((word) => text.includes(word)));
  return match ? match.category : "Other";
}

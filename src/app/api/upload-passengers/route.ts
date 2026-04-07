import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Smart column detection
function detectColumns(headers: string[]) {
  const lower = headers.map((h) => (h || "").toString().toLowerCase().trim());

  const namePatterns = ["name", "naam", "passenger", "passagier", "guest", "gast", "full_name", "fullname", "pax"];
  const emailPatterns = ["email", "e-mail", "mail"];
  const phonePatterns = ["phone", "telefoon", "tel", "mobile", "mobiel"];
  const dobPatterns = ["dob", "date_of_birth", "geboortedatum", "birthday", "birth", "geboren"];
  const nationalityPatterns = ["nationality", "nationaliteit", "country", "land", "passport"];
  const notesPatterns = ["notes", "opmerkingen", "remarks", "comment", "info", "details", "special"];

  const find = (patterns: string[]) => {
    const idx = lower.findIndex((h) => patterns.some((p) => h.includes(p)));
    return idx >= 0 ? idx : null;
  };

  return {
    name: find(namePatterns),
    email: find(emailPatterns),
    phone: find(phonePatterns),
    dateOfBirth: find(dobPatterns),
    nationality: find(nationalityPatterns),
    notes: find(notesPatterns),
  };
}

// Parse HTML table rows from Word document
function parseHtmlTable(html: string) {
  // Extract all table rows
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  const stripTags = (s: string) => s.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").trim();

  const tableRows: string[][] = [];
  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const cells: string[] = [];
    let cellMatch;
    const rowHtml = rowMatch[1];
    const localCellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    while ((cellMatch = localCellRegex.exec(rowHtml)) !== null) {
      cells.push(stripTags(cellMatch[1]));
    }
    if (cells.length > 0) tableRows.push(cells);
  }

  return tableRows;
}

// Parse Word document — tries HTML table first, then falls back to text parsing
function parseWordContent(html: string, rawText: string) {
  // Check if there's a table in the HTML
  const tableRows = parseHtmlTable(html);

  if (tableRows.length >= 2) {
    // Table found — first row is header, rest is data
    const headerRow = tableRows[0];
    const dataRows = tableRows.slice(1).filter((row) => row.some((c) => c !== ""));

    const columns = detectColumns(headerRow);

    const passengers = dataRows.map((row, index) => {
      const getValue = (colIndex: number | null) => {
        if (colIndex === null || colIndex >= row.length) return null;
        return row[colIndex]?.trim() || null;
      };

      return {
        name: getValue(columns.name) || getValue(0) || `Passenger ${index + 1}`,
        email: getValue(columns.email),
        phone: getValue(columns.phone),
        dateOfBirth: getValue(columns.dateOfBirth),
        nationality: getValue(columns.nationality),
        notes: getValue(columns.notes),
      };
    }).filter((p) => p.name && p.name.trim() !== "");

    return {
      headers: headerRow,
      detectedColumns: {
        name: columns.name !== null ? headerRow[columns.name] : null,
        email: columns.email !== null ? headerRow[columns.email] : null,
        phone: columns.phone !== null ? headerRow[columns.phone] : null,
        dateOfBirth: columns.dateOfBirth !== null ? headerRow[columns.dateOfBirth] : null,
        nationality: columns.nationality !== null ? headerRow[columns.nationality] : null,
        notes: columns.notes !== null ? headerRow[columns.notes] : null,
      },
      passengers,
    };
  }

  // No table — parse as plain text list
  const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  const passengers = lines
    .filter((line) => {
      const lower = line.toLowerCase();
      if (lower.includes("passenger list") || lower.includes("guest list") || lower.includes("passagierslijst")) return false;
      if (lower.startsWith("name") && (lower.includes("email") || lower.includes("phone"))) return false;
      if (line.length < 3) return false;
      return true;
    })
    .map((line) => {
      let clean = line.replace(/^\d+[\.\)\-]\s*/, "").replace(/^[\-\•\*]\s*/, "").trim();

      let parts: string[];
      if (clean.includes("\t")) {
        parts = clean.split("\t").map((p) => p.trim());
      } else if (clean.includes(" | ")) {
        parts = clean.split(" | ").map((p) => p.trim());
      } else if (clean.includes(" - ")) {
        parts = clean.split(" - ").map((p) => p.trim());
      } else if (clean.includes(",") && clean.split(",").length >= 3) {
        parts = clean.split(",").map((p) => p.trim());
      } else {
        parts = [clean];
      }

      let name = parts[0] || clean;
      let email: string | null = null;
      let phone: string | null = null;
      let notes: string | null = null;
      const extras: string[] = [];

      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (part.includes("@")) {
          email = part;
        } else if (/^\+?\d[\d\s\-\(\)]+$/.test(part.replace(/\s/g, ""))) {
          phone = part;
        } else {
          extras.push(part);
        }
      }

      if (extras.length > 0) notes = extras.join(", ");

      return { name, email, phone, dateOfBirth: null as string | null, nationality: null as string | null, notes };
    })
    .filter((p) => p.name && p.name.trim() !== "");

  return {
    headers: ["Name", "Email", "Phone", "Notes"],
    detectedColumns: {
      name: "Name",
      email: passengers.some((p) => p.email) ? "Email" : null,
      phone: passengers.some((p) => p.phone) ? "Phone" : null,
      dateOfBirth: null,
      nationality: null,
      notes: passengers.some((p) => p.notes) ? "Notes" : null,
    },
    passengers,
  };
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract group name from filename
    const groupNameFromFile = file.name
      .replace(/\.(xlsx|xls|csv|docx|doc|pdf)$/i, "")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    // Handle Word documents
    if (fileName.endsWith(".docx")) {
      const [htmlResult, textResult] = await Promise.all([
        mammoth.convertToHtml({ buffer }),
        mammoth.extractRawText({ buffer }),
      ]);

      if (!textResult.value || textResult.value.trim().length < 5) {
        return NextResponse.json({ error: "Word document is empty or unreadable" }, { status: 400 });
      }

      const parsed = parseWordContent(htmlResult.value, textResult.value);

      if (parsed.passengers.length === 0) {
        return NextResponse.json({ error: "No passengers found in document. Make sure names are on separate lines or in a table." }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        fileName: file.name,
        suggestedGroupName: groupNameFromFile,
        totalPassengers: parsed.passengers.length,
        detectedColumns: parsed.detectedColumns,
        headers: parsed.headers,
        passengers: parsed.passengers,
      });
    }

    // Handle Excel / CSV
    if (fileName.endsWith(".csv") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const rawData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
      if (rawData.length < 2) {
        return NextResponse.json({ error: "File is empty or has no data rows" }, { status: 400 });
      }

      const headers = (rawData[0] || []).map((h) => String(h || "").trim());
      const dataRows = rawData.slice(1).filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ""));

      const rows = dataRows.map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, i) => {
          obj[h] = row[i] !== undefined ? row[i] : null;
        });
        return obj;
      });

      const columns = detectColumns(headers);

      const passengers = rows.map((row, index) => {
        const getValue = (colIndex: number | null) => {
          if (colIndex === null) return null;
          const val = row[headers[colIndex]];
          return val !== null && val !== undefined ? String(val).trim() : null;
        };

        const name = getValue(columns.name) || getValue(0) || `Passenger ${index + 1}`;

        return {
          name,
          email: getValue(columns.email),
          phone: getValue(columns.phone),
          dateOfBirth: getValue(columns.dateOfBirth),
          nationality: getValue(columns.nationality),
          notes: getValue(columns.notes),
        };
      }).filter((p) => p.name && p.name !== "Passenger 0" && p.name.trim() !== "");

      return NextResponse.json({
        success: true,
        fileName: file.name,
        suggestedGroupName: groupNameFromFile,
        totalPassengers: passengers.length,
        detectedColumns: {
          name: columns.name !== null ? headers[columns.name] : null,
          email: columns.email !== null ? headers[columns.email] : null,
          phone: columns.phone !== null ? headers[columns.phone] : null,
          dateOfBirth: columns.dateOfBirth !== null ? headers[columns.dateOfBirth] : null,
          nationality: columns.nationality !== null ? headers[columns.nationality] : null,
          notes: columns.notes !== null ? headers[columns.notes] : null,
        },
        headers,
        passengers,
      });
    }

    return NextResponse.json({ error: "Unsupported file format. Use .xlsx, .xls, .csv or .docx" }, { status: 400 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
  }
}

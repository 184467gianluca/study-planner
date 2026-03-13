import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "versions.json");

async function ensureDataFile() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify([]));
  }
}

export async function GET() {
  try {
    await ensureDataFile();
    const data = await fs.readFile(dataFile, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Failed to read versions", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDataFile();
    const newVersion = await request.json();
    const data = await fs.readFile(dataFile, "utf-8");
    const versions = JSON.parse(data);

    const version = {
      ...newVersion,
      id: newVersion.id || Date.now().toString(),
      timestamp: Date.now(),
    };

    // Prepend to show newest first
    versions.unshift(version);
    await fs.writeFile(dataFile, JSON.stringify(versions, null, 2));

    return NextResponse.json({ success: true, version });
  } catch (error) {
    console.error("Failed to save version", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await ensureDataFile();
    const data = await fs.readFile(dataFile, "utf-8");
    let versions = JSON.parse(data);
    versions = versions.filter((v: any) => v.id !== id);

    await fs.writeFile(dataFile, JSON.stringify(versions, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete version", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

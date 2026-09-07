import * as typst from "typst";
import * as fs from "fs/promises";
import * as path from "path";

export async function compileTypstFile(
  templateName: string,
  data: Record<string, string>,
): Promise<string> {
  const filePath = path.join(process.cwd(), "src", "templates", templateName);
  const outputPath = filePath.replace(/\.typ$/, `_${Date.now()}.pdf`);

  let content = await fs.readFile(filePath, "utf-8");

  for (const [key, value] of Object.entries(data)) {
    content = content.replace(new RegExp(`#${key}`, "g"), value);
  }

  const tempFilePath = filePath.replace(/\.typ$/, `_${Date.now()}_temp.typ`);
  await fs.writeFile(tempFilePath, content, "utf-8");

  try {
    await typst.compile(tempFilePath, outputPath);
    return outputPath;
  } finally {
    await fs.unlink(tempFilePath).catch(() => {});
  }
}

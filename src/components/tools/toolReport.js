import aalLogoDataUrl from "../../../public/logo.png?inline";
import stakeholders from "../../data/stakeholders.json";
import phases from "../../data/phases.json";
import { INDUSTRY_LABELS } from "../../lib/taskVisuals";

const stakeholderLabel = Object.fromEntries(stakeholders.map((s) => [s.id, s.label]));
const phaseLabel = Object.fromEntries(phases.map((p) => [p.id, p.label]));

export function savedToolRecords(savedToolIds, tools) {
  const ids = savedToolIds ?? new Set();
  return tools.filter((tool) => ids.has(tool.id));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function reportTag(label) {
  return `<span>${escapeHtml(label)}</span>`;
}

// Mirrors exportSavedReport() in TaskDetailOverlay.jsx (same page shell, tag
// style and print affordance), just aggregating saved TOOLS instead of saved
// use cases.
export function exportSavedToolsReport(toolRecords, contact = {}) {
  const rows = toolRecords
    .map((tool, index) => {
      const industries = (tool.industries ?? []).map((id) => INDUSTRY_LABELS[id] ?? id);
      const phaseLabels = (tool.phases ?? []).map((id) => phaseLabel[id] ?? id);
      const stakeholderLabels = (tool.stakeholders ?? []).map((id) => stakeholderLabel[id] ?? id);
      return `
        <article class="tool">
          <div class="tool-index">Tool ${index + 1}</div>
          <h2>${escapeHtml(tool.name)}</h2>
          <div class="meta">${escapeHtml(industries.join(" · "))}${
        tool.solutionTypes?.length ? ` · ${escapeHtml(tool.solutionTypes.join(", "))}` : ""
      }</div>
          <div class="tags">${(tool.painPoints ?? []).map(reportTag).join("")}</div>
          <p>${escapeHtml(tool.headline || "")}</p>
          <dl>
            <dt>Deployment</dt>
            <dd>${escapeHtml(tool.deploymentModels?.join(" | ") || "To be reviewed")}</dd>
            <dt>AI Techniques</dt>
            <dd>${escapeHtml(tool.aiTechniques?.join(" | ") || "To be reviewed")}</dd>
            <dt>Used in phases</dt>
            <dd>${escapeHtml(phaseLabels.join(" | ") || "—")}</dd>
            <dt>Stakeholders</dt>
            <dd>${escapeHtml(stakeholderLabels.join(" | ") || "—")}</dd>
            <dt>Use cases</dt>
            <dd>${(tool.useCaseIds ?? []).length} matched in the map</dd>
            ${
              tool.website
                ? `<dt>Website</dt><dd><span class="path-chip">${escapeHtml(tool.website)}</span></dd>`
                : ""
            }
          </dl>
        </article>
      `;
    })
    .join("");

  const preparedName = [contact.firstName, contact.surname].filter(Boolean).join(" ");
  const preparedLines = [
    preparedName && `<b>Prepared for:</b> ${escapeHtml(preparedName)}`,
    contact.company && `<b>Company:</b> ${escapeHtml(contact.company)}`,
    contact.position && `<b>Position:</b> ${escapeHtml(contact.position)}`,
    `<b>Generated:</b> ${new Date().toLocaleDateString()}`,
  ].filter(Boolean);

  const reportHtml = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>AAL Saved AI Tools Report</title>
        <style>
          @page { size: A4; margin: 16mm; }
          body { margin: 0; font-family: Inter, Arial, sans-serif; color: #101828; background: #eef3f8; font-size: 13px; }
          .page { max-width: 820px; margin: 22px auto; background: rgba(255,255,255,.94); border: 1px solid #fff; border-radius: 22px; padding: 28px; box-shadow: 0 20px 58px rgba(43,58,90,.13); }
          .header { display: flex; align-items: center; justify-content: space-between; gap: 22px; border-bottom: 1px solid #e2e8f0; padding-bottom: 18px; }
          .logo { width: 58px; height: 58px; border-radius: 13px; display: block; object-fit: cover; box-shadow: 0 12px 26px rgba(25,52,160,.16); }
          h1 { margin: 0; color: #1934a0; font-size: 26px; line-height: 1.12; }
          .subtitle { margin-top: 8px; color: #667085; font-size: 12px; line-height: 1.55; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 18px 0; }
          .summary div { border: 1px solid #dbe3ef; background: #f8fafc; border-radius: 13px; padding: 11px 12px; font-size: 12px; font-weight: 800; color: #1934a0; }
          .tool { break-inside: avoid; page-break-inside: avoid; border: 1px solid #dbe3ef; background: #fff; border-radius: 18px; padding: 18px; margin-top: 14px; }
          .tool-index { color: #667085; text-transform: uppercase; letter-spacing: .16em; font-size: 10px; font-weight: 900; }
          h2 { margin: 8px 0 6px; font-size: 19px; line-height: 1.24; }
          .meta { color: #667085; font-size: 11px; font-weight: 700; }
          .tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0; }
          .tags span { border-radius: 999px; border: 1px solid #c7d2fe; background: #eef2ff; color: #2742a6; padding: 4px 8px; font-size: 10px; font-weight: 800; }
          p { color: #344054; line-height: 1.55; margin: 10px 0; }
          dl { display: grid; grid-template-columns: 118px 1fr; gap: 8px 13px; margin-top: 14px; }
          dt { color: #667085; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: .1em; }
          dd { margin: 0; color: #101828; font-size: 12px; font-weight: 700; line-height: 1.42; word-break: break-word; }
          .path-chip { display: inline-block; border-radius: 999px; background: #eff6ff; border: 1px solid #bfdbfe; color: #315783; padding: 3px 7px; font-size: 10px; font-weight: 900; }
          .prepared-for { margin-top: 12px; font-size: 12px; line-height: 1.7; color: #475569; }
          .prepared-for b { color: #101828; }
          .actions { position: sticky; bottom: 18px; margin-top: 22px; display: flex; justify-content: flex-end; pointer-events: none; }
          button { pointer-events: auto; border: 0; border-radius: 999px; background: #1934a0; color: #fff; padding: 10px 15px; font-size: 11px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; box-shadow: 0 12px 28px rgba(25,52,160,.18); }
          @media print { body { background: #fff; font-size: 11px; } .page { box-shadow: none; margin: 0; max-width: none; border: 0; border-radius: 0; padding: 0; } .tool { padding: 14px; margin-top: 10px; } .actions { display: none; } }
        </style>
        <script>
          function printReport() {
            requestAnimationFrame(function () {
              window.focus();
              window.print();
            });
          }
        </script>
      </head>
      <body>
        <main class="page">
          <header class="header">
            <div>
              <h1>Saved AI Tools Report</h1>
              <div class="subtitle">AAL Innovation · RAECO AI Map<br />Generated from tools saved to your report in the prototype.</div>
              <div class="prepared-for">${preparedLines.map((line) => `<div>${line}</div>`).join("")}</div>
            </div>
            <img class="logo" src="${aalLogoDataUrl}" alt="AAL Innovation" />
          </header>
          <section class="summary">
            <div>${toolRecords.length} saved tools</div>
            <div>${new Set(toolRecords.flatMap((t) => t.industries ?? [])).size} industries covered</div>
            <div>${new Set(toolRecords.flatMap((t) => t.painPoints ?? [])).size} pain point types</div>
          </section>
          ${rows || "<p>No saved tools yet.</p>"}
          <div class="actions"><button type="button" onclick="printReport()">Print / Save PDF</button></div>
        </main>
      </body>
    </html>
  `;
  const reportBlob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
  const reportUrl = URL.createObjectURL(reportBlob);
  const reportWindow = window.open(reportUrl, "_blank");

  if (!reportWindow) {
    const link = document.createElement("a");
    link.href = reportUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

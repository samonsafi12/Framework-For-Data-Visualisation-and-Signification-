import Papa from "papaparse";
import type { DataPoint } from "../core/state";

export function parseCsvToSeries(file: File): Promise<DataPoint[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as any[];
          const out: DataPoint[] = [];

          for (const r of rows) {
            const t = (r.Date ?? r.date ?? r.Time ?? r.time ?? r.Timestamp ?? r.timestamp ?? "").toString();
            const closeStr = (r.Close ?? r.close ?? r.CLOSE ?? r.AdjClose ?? r["Adj Close"] ?? "").toString();

            if (!closeStr) continue;
            const close = Number(closeStr);
            if (!Number.isFinite(close)) continue;

            out.push({ t: t || `row-${out.length + 1}`, close });
          }

          resolve(out);
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(err),
    });
  });
}

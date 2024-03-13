// 引入 node-xlsx 模块
import xlsx from "node-xlsx";
import fs from "fs-extra";
import path from "path";
// 在 ECMAScript 模块中
const currentModuleUrl = new URL(import.meta.url);
export const __dirname = path.dirname(currentModuleUrl.pathname);

/**
 *
 * @returns the datas from dataset excel
 */
export const getDatas = (excelFilePath, index) => {
  const sheets = xlsx.parse(excelFilePath);
  const sheet = sheets[0];
  return sheet.data.slice(index + 1);
};

/**
 *
 * @param {*} datas
 * @returns
 */
export const getAllClassifications = (datas) => {
  const classifications = datas.reduce((prev, current) => {
    const classification = current[2];
    return [...new Set([...prev, classification])];
  }, []);
  return classifications;
};

export const getCheckpoint = (dir) => {
  const p = path.resolve(__dirname, dir, "checkpoint.json");
  fs.ensureFileSync(p);
  try {
    const checkpoint = fs.readJsonSync(p);
    return checkpoint;
  } catch {
    const defaultCheckPoint = { index: 0, results: {} };
    fs.outputFileSync(p, JSON.stringify(defaultCheckPoint));
    return defaultCheckPoint;
  }
};

export const writeCheckpoint = (checkpoint, dir) => {
  const p = path.resolve(__dirname, dir, "checkpoint.json");
  fs.ensureFileSync(p);
  fs.writeJsonSync(p, checkpoint);
};

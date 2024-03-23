import { getCheckpoint, writeCheckpoint, __dirname } from "./process-data.js";
import fs from "fs-extra";
import path from "path";
import OpenAI from "openai";
const openai = new OpenAI();
const main = async (type) => {
  const model = "ft:gpt-3.5-turbo-0125:personal::948GqbYi";
  const topN = 1;
  const outputDir = path.resolve(
    __dirname,
    "app",
    "component",
    model,
    type,
    `top${topN}`
  );
  let { index, results } = getCheckpoint(outputDir);
  const wirte = (fullPrompts) =>
    writeCheckpoint({ index, fullPrompts, results }, outputDir);
  let f;
  const validationDatas = fs.readJSONSync(`./${type}.json`).slice(index);
  try {
    for (const {
      messages,
      classification,
      name,
      description,
      fullPrompts,
    } of validationDatas) {
      f = fullPrompts;
      if (index === validationDatas.length) {
        break;
      }
      const completion = await openai.chat.completions.create({
        messages,
        model,
      });
      const res = completion.choices[0].message.content;
      const equal =
        topN > 1
          ? res.split("/").some((c) => c.trim() === classification)
          : classification === res;
      const result = {
        name,
        description,
        classification,
        result: res,
        equal,
      };
      results[index] = result;
      console.log(`${model}-${index}`, result);
      index++;
      if (index && index % 10 === 0) {
        wirte(fullPrompts);
      }
    }
  } catch (error) {
    fs.ensureFileSync("./error.log");
    fs.writeJSONSync("./error.log", { message: error.message });
    console.error(error);
  } finally {
    wirte(f);
  }
};

main('validate');
main('test');
import OpenAI from "openai";
import fs from "fs-extra";
import {
  getDatas,
  getAllClassifications,
  getCheckpoint,
  writeCheckpoint,
  __dirname,
} from "./process-data.js";
import path from "path";
const openai = new OpenAI();

const defaultModel = "gpt-3.5-turbo";
export async function classificationGPT({
  model = defaultModel,
  dataFile = "./data.csv",
  topN = 1,
}) {
  const outputDir = path.resolve(__dirname, "app", model, `top${topN}`);
  let { index, results } = getCheckpoint(outputDir);
  const datas = getDatas(dataFile, index);
  const classifications = getAllClassifications(getDatas(dataFile, 0));
  const topNPrompts = [
    "You are a service classifier.",
    "Give me the classification of the service by the given service name and description.",
    `You must output ${topN} of the classification${
      topN > 1 ? "s" : ""
    } in the category below which you think ${
      topN > 1 ? "are" : "is"
    } the highest probability${
      topN > 1 ? ", and use / to seperate each classification:" : ":"
    }`,
    "\n",
  ].join(" ");
  const fullPrompts = topNPrompts + classifications.join("\n");
  const wirte = () =>
    writeCheckpoint({ index, fullPrompts, results }, outputDir);
  try {
    for (const data of datas) {
      if (index === datas.length) {
        break;
      }
      const [name, description, classification] = data;
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: fullPrompts,
          },
          {
            role: "user",
            content: [
              `Service Name: ${name}`,
              `Description: ${description}`,
            ].join("\n"),
          },
        ],
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
        wirte();
      }
    }
  } catch (error) {
    fs.ensureFileSync("./error.log");
    fs.writeJSONSync({ message: error.message });
    console.error(error);
  } finally {
    wirte();
  }
}

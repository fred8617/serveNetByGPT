import fs from "fs-extra";
import chunk from "lodash/chunk.js";
import OpenAI from "openai";
import {
  getDatas,
  getAllClassifications,
  getCheckpoint,
  writeCheckpoint,
  __dirname,
} from "./process-data.js";
const datas = getDatas("./data.csv", 0);
const topN = 1;
const classifications = getAllClassifications(datas);
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
const dataset = Object.fromEntries(
  classifications.map((clz) => {
    const dataset = datas.filter((e) => e[2] === clz);
    const length = dataset.length;
    const groups = chunk(dataset, Math.round(length * 0.8));
    return [
      clz,
      {
        train: groups[0],
        test: groups[1],
      },
    ];
  })
);
const jsonName = "./fine-tune.json";
fs.ensureFileSync(jsonName);
fs.writeJSONSync(jsonName, dataset);
const trainDatas = Object.values(dataset)
  .map((d) => d.train)
  .flat();
const testDatas = Object.values(dataset)
  .map((d) => d.test)
  .flat();
const fullPrompts = topNPrompts + classifications.join("\n");
const jsonlText = trainDatas
  .map(([name, description, classification]) =>
    JSON.stringify({
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
        {
          role: "assistant",
          content: classification,
        },
      ],
    })
  )
  .join("\n");
const filename = "./fine-tune.jsonl";
fs.ensureFileSync(filename);
fs.writeFileSync(filename, jsonlText);

const jsonlValidation = testDatas.map(
  ([name, description, classification]) => ({
    name,
    description,
    classification,
    fullPrompts,
    messages: [
      {
        role: "system",
        content: fullPrompts,
      },
      {
        role: "user",
        content: [`Service Name: ${name}`, `Description: ${description}`].join(
          "\n"
        ),
      },
    ],
  })
);

const vfilename = "./validation.json";
fs.ensureFileSync(vfilename);
fs.writeJSONSync(vfilename, jsonlValidation);
// const openai = new OpenAI();

// // If you have access to Node fs we recommend using fs.createReadStream():
// await openai.files.create({
//   file: fs.createReadStream(filename),
//   purpose: "fine-tune",
// });

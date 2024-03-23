"use client";
import gpt3p5Top1OriginJson from "./gpt-3.5-turbo/top1/checkpoint.json";
import gpt3p5Top5OriginJson from "./gpt-3.5-turbo/top5/checkpoint.json";
import gpt4Top1OriginJson from "./gpt-4-0125-preview/top1/checkpoint.json";
import gpt4Top5OriginJson from "./gpt-4-0125-preview/top5/checkpoint.json";
import gpt3p5FinetuneTop1Json from "./ft:gpt-3.5-turbo-0125:personal::92f0eZFZ/top1/checkpoint.json";
import serveNetTop5Benchmark from "./serveNet-top5-benchmark.json";
import serveNetTop1Benchmark from "./serveNet-top1-benchmark.json";
import { Table, Divider, Typography, Tooltip, Slider, Form, Affix } from "antd";
import { BaseType } from "antd/es/typography/Base";
import { useCallback, useMemo, useState } from "react";
import sampleSize from "lodash/sampleSize";
const gpt3p5Top1Origin = gpt3p5Top1OriginJson as Data;
const gpt3p5Top5Origin = gpt3p5Top5OriginJson as Data;
const gpt4Top1Origin = gpt4Top1OriginJson as Data;
const gpt4Top5Origin = gpt4Top5OriginJson as Data;
const { Title, Text } = Typography;
type Result = {
  description: string;
  equal: boolean;
  classification: string;
  result: string;
};
type Data = {
  index: number;
  fullPrompts: string;
  results: Record<string, Result>;
};
type AccData = {
  id: string;
  top1Acc: string;
  top5Acc: string;
};

const getClassifications = (data: Data) => {
  return Object.values(data.results).map((r) => r.classification);
};
const allClassifications = [...new Set(getClassifications(gpt3p5Top1Origin))];
console.log(gpt3p5Top1Origin.fullPrompts);

console.log("gpt-3.5-classifiaction", [
  ...new Set(Object.values(gpt3p5Top1Origin.results).map((r) => r.result)),
]);
console.log(
  "gpt-3.5 not in the classifiactions",
  Object.values(gpt3p5Top1Origin.results).filter(
    (r) => !allClassifications.includes(r.result)
  )
);
console.log("gpt-3.5-ft-classifiaction", [
  ...new Set(
    Object.values(gpt3p5FinetuneTop1Json.results).map((r) => r.result)
  ),
]);
console.log(
  "gpt-3.5-ft not in the classifiactions",
  Object.values(gpt3p5FinetuneTop1Json.results).filter(
    (r) => !allClassifications.includes(r.result)
  )
);

console.log("gpt-4-classifiaction", [
  ...new Set(Object.values(gpt4Top1Origin.results).map((r) => r.result)),
]);
console.log(
  "gpt-4 not in the classifiactions",
  Object.values(gpt4Top1Origin.results).filter(
    (r) => !allClassifications.includes(r.result)
  )
);

const getPercentString = (num: number) => {
  return parseFloat((num * 100).toString()).toFixed(2) + "%";
};

const getAccPercentString = (a: number, b: number) => {
  return getPercentString(a / b);
};
const getAcc = (data: Data) => {
  return getAccPercentString(
    Object.values(data.results).filter((r) => r.equal).length,
    data.index
  );
};

const getAccByClassifiaction = (data: Data, classification: string) => {
  const dataInClassifiaction = Object.values(data.results).filter(
    (r) => r.classification === classification
  );
  return getAccPercentString(
    dataInClassifiaction.filter((r) => r.equal).length,
    dataInClassifiaction.length
  );
};

const defaultSampleNumber = 2210;
export default function Page() {
  const [sampleNumber, setSampleNumber] = useState<number>(
    gpt3p5Top1Origin.index
  );
  const { gpt3p5Top5, gpt4Top1, gpt4Top5, gpt3p5Top1, gpt3p5FinetuneTop1 } =
    useMemo(() => {
      const gpt3p5Top5: Data = {
        index: sampleNumber,
        fullPrompts: gpt3p5Top5Origin.fullPrompts,
        results: {},
      };
      const gpt4Top1: Data = {
        index: sampleNumber,
        fullPrompts: gpt4Top1Origin.fullPrompts,
        results: {},
      };
      const gpt4Top5: Data = {
        index: sampleNumber,
        fullPrompts: gpt4Top5Origin.fullPrompts,
        results: {},
      };
      const gpt3p5Top1: Data = {
        index: sampleNumber,
        fullPrompts: gpt3p5Top1Origin.fullPrompts,
        results: sampleSize(
          Object.entries(gpt3p5Top1Origin.results),
          sampleNumber
        ).reduce((prev, [key, value], index) => {
          prev[index] = value;
          gpt3p5Top5.results[index] = gpt3p5Top5Origin.results[key];
          gpt4Top1.results[index] = gpt4Top1Origin.results[key];
          gpt4Top5.results[index] = gpt4Top5Origin.results[key];
          return prev;
        }, {}),
      };
      return {
        gpt3p5Top5,
        gpt4Top1,
        gpt4Top5,
        gpt3p5Top1,
        gpt3p5FinetuneTop1: gpt3p5FinetuneTop1Json,
      };
    }, [sampleNumber]);

  const classifications = useMemo(
    () => [
      ...new Set([
        ...getClassifications(gpt3p5Top1),
        ...getClassifications(gpt3p5Top5),
        ...getClassifications(gpt4Top1),
        ...getClassifications(gpt4Top5),
        ...getClassifications(gpt3p5FinetuneTop1),
      ]),
    ],
    [gpt3p5Top1, gpt3p5Top5, gpt4Top1, gpt4Top5]
  );
  const {
    gpt3p5Top1Acc,
    gpt3p5Top5Acc,
    gpt4Top1Acc,
    gpt4Top5Acc,
    gpt3p5FinetuneTop1Acc,
  } = useMemo(() => {
    const gpt3p5Top1Acc = getAcc(gpt3p5Top1);
    const gpt3p5FinetuneTop1Acc = getAcc(gpt3p5FinetuneTop1);
    const gpt3p5Top5Acc = getAcc(gpt3p5Top5);
    const gpt4Top1Acc = getAcc(gpt4Top1);
    const gpt4Top5Acc = getAcc(gpt4Top5);
    return {
      gpt3p5Top1Acc,
      gpt3p5FinetuneTop1Acc,
      gpt3p5Top5Acc,
      gpt4Top1Acc,
      gpt4Top5Acc,
    };
  }, [gpt3p5Top1, gpt3p5Top5, gpt4Top1, gpt4Top5]);

  const classificationsAggregated = useCallback(
    (data: Data) =>
      classifications.reduce<
        Record<string, { count: number; right: number; wrong: number }>
      >((prev, current) => {
        const datas = Object.values(data.results).filter(
          (r) => r.classification === current
        );
        const count = datas.length;
        const right = datas.filter((r) => r.equal).length;
        const wrong = count - right;
        return {
          ...prev,
          [current]: {
            count,
            right,
            wrong,
          },
        };
      }, {}),
    [classifications]
  );
  const aggregated = useMemo(() => {
    return {
      gpt3p5Top1: classificationsAggregated(gpt3p5Top1),
      gpt3p5FinetuneTop1: classificationsAggregated(gpt3p5FinetuneTop1),
      gpt3p5Top5: classificationsAggregated(gpt3p5Top5),
      gpt4Top1: classificationsAggregated(gpt4Top1),
      gpt4Top5: classificationsAggregated(gpt4Top5),
    };
  }, [gpt3p5Top1, gpt3p5Top5, gpt4Top1, gpt4Top5]);

  const naiveModelAccDatas: AccData[] = useMemo(() => {
    return [
      {
        id: "ServeNet(Origin)",
        top1Acc: "63.31%",
        top5Acc: "88.40%",
      },
      {
        id: "ServeNet",
        top1Acc: "69.95%",
        top5Acc: "91.58%",
      },
      {
        id: "gpt-3.5-turbo",
        top1Acc: gpt3p5Top1Acc,
        top5Acc: gpt3p5Top5Acc,
      },
      {
        id: "gpt-3.5-turbo-fine-tuned",
        top1Acc: gpt3p5FinetuneTop1Acc,
        top5Acc: "/",
      },
      {
        id: "gpt-4",
        top1Acc: gpt4Top1Acc,
        top5Acc: gpt4Top5Acc,
      },
    ];
  }, [gpt3p5Top1Acc, gpt3p5Top5Acc, gpt4Top1Acc, gpt4Top5Acc]);
  const datasOnEachClassification = useMemo(
    () =>
      classifications.map((classification) => ({
        id: classification,
        serveNetTop5: getPercentString(serveNetTop5Benchmark[classification]),
        serveNetTop1: getPercentString(serveNetTop1Benchmark[classification]),
        gpt3p5Top1: getAccByClassifiaction(gpt3p5Top1, classification),
        gpt3p5FinetuneTop1: getAccByClassifiaction(
          gpt3p5FinetuneTop1,
          classification
        ),
        gpt3p5Top5: getAccByClassifiaction(gpt3p5Top5, classification),
        gpt4Top1: getAccByClassifiaction(gpt4Top1, classification),
        gpt4Top5: getAccByClassifiaction(gpt4Top5, classification),
      })),
    [classifications, gpt3p5Top1, gpt3p5Top5, gpt4Top1, gpt4Top5]
  );
  const render =
    (
      compareKey: "serveNetTop5" | "serveNetTop1",
      aggregatedKey: keyof typeof aggregated
    ) =>
    (value: string, record: (typeof datasOnEachClassification)[0]) => {
      const dataAggregated = aggregated[aggregatedKey][record.id];
      const serveNetPercent = Number(record[compareKey].replace("%", ""));
      const percent = Number(value.replace("%", ""));
      let type: BaseType = percent >= serveNetPercent ? "success" : "danger";
      switch (percent) {
        case 0:
          type = "danger";
          break;
      }
      return (
        <Tooltip
          title={`
        Total: ${dataAggregated.count}
        Right: ${dataAggregated.right}
        Wrong: ${dataAggregated.wrong}
    `}
        >
          <Text delete={percent === 0} strong={percent === 100} type={type}>
            {value}
          </Text>
        </Tooltip>
      );
    };
  const sorter = (key) => (a, b) =>
    Number(a[key].replace("%", "")) - Number(b[key].replace("%", ""));

  return (
    <>
      <Affix offsetTop={0}>
        <Form style={{ background: "#fff" }}>
          <Form.Item label="Random Sample Number">
            <Slider
              onChange={(number) => setSampleNumber(number)}
              value={sampleNumber}
              min={defaultSampleNumber}
              max={gpt3p5Top1Origin.index}
            />
          </Form.Item>
        </Form>
      </Affix>

      <Table<AccData>
        size="small"
        rowKey={"id"}
        pagination={false}
        title={() => <Title level={5}>Model Accuracy</Title>}
        dataSource={naiveModelAccDatas}
        columns={[
          { dataIndex: "id", title: "Model" },
          { dataIndex: "top1Acc", title: "Top-1 Accuracy" },
          { dataIndex: "top5Acc", title: "Top-5 Accuracy" },
        ]}
      />
      <Divider />
      <Table<(typeof datasOnEachClassification)[0]>
        sticky={{ offsetHeader: 34 }}
        expandable={{
          expandedRowRender: (record) => {
            const render = (key) => {
              return (value, record) => {
                const type = record[key] ? "success" : "danger";
                return <Text type={type}>{value}</Text>;
              };
            };
            const sorter = (key) => (a) => a[key] ? 1 : -1;
            return (
              <Table
                pagination={false}
                size={"small"}
                scroll={{ y: 400 }}
                dataSource={Object.values(gpt3p5Top1.results)
                  .filter((data) => data.classification === record.id)
                  .map((data, index) => {
                    const gpt3p5Top5Expend = Object.values(
                      gpt3p5Top5.results
                    ).find((d) => d.description === data.description);
                    const gpt4Top1Expend = Object.values(gpt4Top1.results).find(
                      (d) => d.description === data.description
                    );
                    const gpt4Top5Expend = Object.values(gpt4Top5.results).find(
                      (d) => d.description === data.description
                    );

                    return {
                      ...data,
                      index,
                      gpt3p5Top1: data.result,
                      gpt3p5Top5: gpt3p5Top5Expend.result,
                      gpt4Top1: gpt4Top1Expend.result,
                      gpt4Top5: gpt4Top5Expend.result,
                      gpt3p5Top1Equal: data.equal,
                      // gpt3p5FinetuneTop1Equal
                      gpt3p5Top5Equal: gpt3p5Top5Expend.equal,
                      gpt4Top1Equal: gpt4Top1Expend.equal,
                      gpt4Top5Equal: gpt4Top5Expend.equal,
                    };
                  })}
                rowKey={"index"}
                columns={[
                  {
                    dataIndex: "name",
                    title: "name",
                  },
                  {
                    dataIndex: "description",
                    title: "description",
                    ellipsis: true,
                  },
                  {
                    dataIndex: "gpt3p5Top1",
                    title: "gpt-3.5-turbo Top-1",
                    render: render("gpt3p5Top1Equal"),
                    sorter: sorter("gpt3p5Top1Equal"),
                  },
                  // {
                  //   dataIndex: "gpt3p5FinetuneTop1",
                  //   title: "gpt-3.5-turbo-fine-tuned Top-1",
                  //   render: render("gpt3p5FinetuneTop1Equal"),
                  //   sorter: sorter("gpt3p5FinetuneTop1Equal"),
                  // },
                  {
                    dataIndex: "gpt3p5Top5",
                    title: "gpt-3.5-turbo Top-5",
                    render: render("gpt3p5Top5Equal"),
                    sorter: sorter("gpt3p5Top5Equal"),
                  },
                  {
                    dataIndex: "gpt4Top1",
                    title: "gpt-4 Top-1",
                    render: render("gpt4Top1Equal"),
                    sorter: sorter("gpt4Top1Equal"),
                  },
                  {
                    dataIndex: "gpt4Top5",
                    title: "gpt-4 Top-5",
                    render: render("gpt4Top5Equal"),
                    sorter: sorter("gpt4Top5Equal"),
                  },
                ]}
              />
            );
          },
        }}
        rowKey={"id"}
        scroll={{ y: "auto" }}
        size="small"
        pagination={false}
        title={() => (
          <Title level={5}>Model Accuracy On Each Classifications</Title>
        )}
        dataSource={datasOnEachClassification}
        columns={[
          {
            title: "Service Category",
            dataIndex: "id",
            sorter: (a, b) => a.id.localeCompare(b.id),
          },
          {
            title: "ServeNet Top-1",
            dataIndex: "serveNetTop1",
            sorter: sorter("serveNetTop1"),
            defaultSortOrder: "descend",
          },
          {
            title: "gpt-3.5-turbo Top-1",
            dataIndex: "gpt3p5Top1",
            render: render("serveNetTop1", "gpt3p5Top1"),
            sorter: sorter("gpt3p5Top1"),
          },
          {
            title: "gpt-3.5-turbo-fine-tuned Top-1",
            dataIndex: "gpt3p5FinetuneTop1",
            render: render("serveNetTop1", "gpt3p5FinetuneTop1"),
            sorter: sorter("gpt3p5FinetuneTop1"),
          },
          {
            title: "gpt-4 Top-1",
            dataIndex: "gpt4Top1",
            render: render("serveNetTop1", "gpt4Top1"),
            sorter: sorter("gpt4Top1"),
          },
          {
            title: "ServeNet Top-5",
            dataIndex: "serveNetTop5",
            sorter: sorter("serveNetTop5"),
          },
          {
            title: "gpt-3.5-turbo Top-5",
            dataIndex: "gpt3p5Top5",
            render: render("serveNetTop5", "gpt3p5Top5"),
            sorter: sorter("gpt3p5Top5"),
          },
          {
            title: "gpt-4 Top-5",
            dataIndex: "gpt4Top5",
            render: render("serveNetTop5", "gpt4Top5"),
            sorter: sorter("gpt4Top5"),
          },
        ]}
      />
    </>
  );
}

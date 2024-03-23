import dynamic from "next/dynamic";

const DynamicSidebarWithNoSSR = dynamic(() => import("./component"), {
  ssr: false,
});

export default function Page() {
  return <DynamicSidebarWithNoSSR />;
}
// 摘要 题目 serveNet-LT
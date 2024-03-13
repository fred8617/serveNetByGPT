import dynamic from "next/dynamic";

const DynamicSidebarWithNoSSR = dynamic(() => import("./component"), {
  ssr: false,
});

export default function Page() {
  return <DynamicSidebarWithNoSSR />;
}

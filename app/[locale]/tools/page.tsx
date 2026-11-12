import { messagesMetadata } from "@/lib/page-metadata";
import ToolsHub from "./ToolsHub";

export const generateMetadata = messagesMetadata("tools", "/tools");

export default function ToolsPage() {
  return <ToolsHub />;
}

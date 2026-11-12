import { messagesMetadata } from "@/lib/page-metadata";
import BlogIndex from "./BlogIndex";

export const generateMetadata = messagesMetadata("blog", "/blog");

export default function BlogPage() {
  return <BlogIndex />;
}

import BookSidebar from "./BookSidebar";
import Comments from "./Comments";

export default function BlogArticleShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">
      <div className="flex-1 min-w-0">
        {children}
        <Comments />
      </div>
      <aside className="w-64 shrink-0 hidden lg:block sticky top-28 self-start">
        <BookSidebar />
      </aside>
    </div>
  );
}

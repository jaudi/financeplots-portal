import BookSidebar from "./BookSidebar";
import Comments from "./Comments";
import ObserverSignup from "./ObserverSignup";

/** `books={false}` drops the "Recommended reading" sidebar (affiliate links)
 *  and keeps the text column at the width it has next to the sidebar. */
export default function BlogArticleShell({ children, books = true }: { children: React.ReactNode; books?: boolean }) {
  return (
    <div className={`${books ? "max-w-5xl" : "max-w-3xl"} mx-auto flex flex-col lg:flex-row gap-12`}>
      <div className="flex-1 min-w-0">
        {children}
        <ObserverSignup variant="blog" id="subscribe" className="mt-14" />
        <Comments />
      </div>
      {books && (
        <aside className="w-64 shrink-0 hidden lg:block sticky top-28 self-start">
          <BookSidebar />
        </aside>
      )}
    </div>
  );
}

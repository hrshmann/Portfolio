import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap nf">
      <p className="cap">Error 404 · File not found</p>
      <h1 className="sec-title">
        This file was <em>shredded.</em>
      </h1>
      <Link href="/" className="btn">
        Back to the main file
      </Link>
    </section>
  );
}

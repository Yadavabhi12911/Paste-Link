import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <div className="not-found-box">
        <h1>Paste not found</h1>
        <p>This paste does not exist, has expired, or has reached its view limit.</p>
        <Link href="/" className="link-home">
          Create a new paste
        </Link>
      </div>
    </main>
  );
}

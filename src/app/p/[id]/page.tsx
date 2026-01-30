import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPasteReadOnly } from "@/lib/pastes";
import { getCurrentTimeMs } from "@/lib/time";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;
  const headersList = await headers();
  const nowMs = getCurrentTimeMs(headersList);
  const paste = await getPasteReadOnly(id, nowMs);
  if (!paste) {
    notFound();
  }
  const gifUrl =
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWhsMjdtNHdldHh0bzIwMW93d25rdDloZzlzMjltaWo3cjFleXR0bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/sXP4m7Gr9NkE3aPVAp/giphy.gif";

  return (
    <main className="animate-in">
      <div className="paste-gif-wrap">
        <img
          src={gifUrl}
          alt=""
          width={280}
          height={280}
          className="paste-gif"
        />
      </div>
      <p style={{ marginBottom: "1rem", fontSize: "0.875rem" }} className="paste-cta">
        <Link href="/" className="link-cta">
          ✨ Create your own paste — it takes 5 seconds
        </Link>
      </p>
      <pre className="paste-content">{paste.content}</pre>
    </main>
  );
}

import { redirect } from "next/navigation";

interface RedirectPageProps {
  params: {
    code: string;
  };
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { code } = params;

  // Next.js static / system routes bypass
  if (code.startsWith("_") || code === "api" || code === "favicon.ico") {
    redirect("/link-not-found");
  }

  const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";

  try {
    const res = await fetch(`${backendUrl}/api/v1/urls/${code}`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      redirect("/link-not-found");
    }

    if (!res.ok) {
      redirect("/link-not-found");
    }

    const data = await res.json();
    if (data.is_expired) {
      redirect("/link-expired");
    }

    // Direct redirect through backend redirect endpoint to record click count
    redirect(`${backendUrl}/${code}`);
  } catch (err) {
    // If it's Next.js redirect throw, rethrow it
    if (err && typeof err === "object" && "digest" in err) {
      throw err;
    }
    redirect("/link-not-found");
  }
}

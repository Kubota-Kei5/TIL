// API Routes
// https://nextjs.org/docs/app/api-reference/file-conventions/route
import { ENDPOINT } from "@/constants";

export async function GET() {
  const data = await fetch(ENDPOINT).then((res) => res.json());

  return Response.json(data);
}

export async function POST(request) {
  const newArticle = await request.json();

  return Response.json(newArticle, { status: 201 });
}

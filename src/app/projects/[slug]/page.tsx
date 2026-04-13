import { MOCK_PROJECTS } from "@/lib/projects-mock";
import ProjectDetail from "./project-detail";

export function generateStaticParams() {
  return MOCK_PROJECTS.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProjectDetail slug={slug} />;
}

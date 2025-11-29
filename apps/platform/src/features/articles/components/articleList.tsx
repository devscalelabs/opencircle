import { Comment01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Avatar } from "@opencircle/ui";
import { Link, useNavigate } from "@tanstack/react-router";
import MDEditor from "@uiw/react-md-editor";
import { getInitials } from "../../../utils/common";
import { PostCardReactions } from "../../posts/components/postCardReactions";
import { PostCommentSummary } from "../../posts/components/postCommentSummary";
import { useArticles } from "../hooks/useArticles";
import { ArticleListSkeleton } from "./articleListSkeleton";

export const ArticleList = () => {
	const navigate = useNavigate();
	const { articles, isLoading } = useArticles();

	if (isLoading) {
		return <ArticleListSkeleton />;
	}

	return (
		<div>
			{articles.map((article) => {
				const initials = getInitials(article.user.name);

				return (
					<main
						key={article.id}
						className="space-y-4 border-border border-b p-4"
					>
						<div
							onClick={() => navigate({ to: `/articles/${article.id}` })}
							className="prose prose-invert max-w-lg cursor-pointer prose-headings:font-medium prose-headings:text-base prose-headings:text-foreground prose-p:text-foreground/40 prose-p:text-sm"
						>
							<h3 className="text-xl">{article.title}</h3>
							<MDEditor.Markdown
								source={`${article.content.slice(0, 200)}...`}
								className="!bg-transparent"
							/>
						</div>
						<section className="mt-4 flex items-center gap-2">
							<Avatar
								initials={initials}
								image_url={article.user.avatar_url || ""}
							/>
							<Link
								to="/$username"
								params={{ username: article.user.username }}
								className="group"
							>
								<div className="space-y-0.5">
									<div className="group-hover:underline">
										{article.user.name || article.user.email}
									</div>
									<p className="text-foreground/50 text-xs">
										{article.user.bio || article.user.username}
									</p>
								</div>
							</Link>
						</section>
						<section className="mt-4 flex items-center gap-4">
							<PostCardReactions post={article} />
							<div className="flex items-center gap-2 text-sm">
								<HugeiconsIcon icon={Comment01Icon} size={18} />
								<div>{article.comment_count}</div>
							</div>
							{article.comment_summary?.names && (
								<PostCommentSummary names={article.comment_summary.names} />
							)}
						</section>
					</main>
				);
			})}
		</div>
	);
};

from pathlib import Path

import frontmatter
from langchain_core.documents import Document


def load_markdown(file_path: str | Path) -> list[Document]:
    """Load a Markdown file and its YAML front matter as a LangChain document."""
    path = Path(file_path)
    post = frontmatter.load(path)
    metadata = {**post.metadata, "source": str(path)}

    return [Document(page_content=post.content, metadata=metadata)]

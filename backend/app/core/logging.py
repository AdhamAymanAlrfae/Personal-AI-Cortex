import logging

from rich.logging import RichHandler

from app.core.config import LOG_LEVEL


def configure_logging() -> None:
    logging.basicConfig(
        level=LOG_LEVEL,
        format="%(name)s: %(message)s",
        handlers=[
            RichHandler(
                log_time_format="[%Y-%m-%d %H:%M:%S]",
                show_level=True,
                show_path=False,
                show_time=True,
                rich_tracebacks=True,
            )
        ],
    )

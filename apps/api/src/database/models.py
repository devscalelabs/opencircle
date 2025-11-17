from __future__ import annotations

from enum import Enum
from typing import List, Optional

from sqlalchemy import JSON
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship
from sqlmodel import Field, Relationship

from src.core.base_models import BaseModel


class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"


class CourseStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class LessonType(str, Enum):
    VIDEO = "video"
    TEXT = "text"
    QUIZ = "quiz"
    ASSIGNMENT = "assignment"


class EnrollmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"


class InviteCodeStatus(str, Enum):
    ACTIVE = "active"
    USED = "used"
    EXPIRED = "expired"


class PasswordResetStatus(str, Enum):
    ACTIVE = "active"
    USED = "used"
    EXPIRED = "expired"


class PostType(str, Enum):
    POST = "post"
    COMMENT = "comment"
    ARTICLE = "article"
    POLL = "poll"


class InviteCode(BaseModel, table=True):
    __tablename__ = "invite_code"

    code: str = Field(index=True, unique=True)
    max_uses: int = Field(default=1)
    used_count: int = Field(default=0)
    expires_at: str | None = Field(default=None)
    status: InviteCodeStatus = Field(default=InviteCodeStatus.ACTIVE)
    created_by: str = Field(foreign_key="user.id")
    auto_join_channel_id: str | None = Field(foreign_key="channel.id", default=None)
    created_by_user: "User" = Relationship(
        sa_relationship=relationship("User", foreign_keys="InviteCode.created_by")
    )
    used_by: List["User"] = Relationship(
        sa_relationship=relationship(
            "User", back_populates="invite_code", foreign_keys="User.invite_code_id"
        )
    )
    target_channel: Optional["Channel"] = Relationship(
        sa_relationship=relationship(
            "Channel", foreign_keys="InviteCode.auto_join_channel_id"
        )
    )


class PasswordReset(BaseModel, table=True):
    __tablename__ = "password_reset"

    code: str = Field(index=True, unique=True)  # 6-letter code
    email: str = Field(index=True)
    status: PasswordResetStatus = Field(default=PasswordResetStatus.ACTIVE)
    expires_at: str  # ISO datetime string
    user_id: str = Field(foreign_key="user.id")
    user: "User" = Relationship(sa_relationship=relationship("User"))


class User(BaseModel, table=True):
    __tablename__ = "user"

    name: str | None = Field(default=None)
    bio: str | None = Field(default=None)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    password: str | None = Field(index=True)
    is_active: bool = Field(default=False)
    is_verified: bool = Field(default=False)
    avatar_url: str | None = Field(default=None)
    role: Role = Field(default=Role.USER)
    posts: List["Post"] = Relationship(
        sa_relationship=relationship("Post", back_populates="user")
    )
    medias: List["Media"] = Relationship(
        sa_relationship=relationship("Media", back_populates="user")
    )
    resources: List["Resource"] = Relationship(
        sa_relationship=relationship("Resource", back_populates="user")
    )
    channel_members: List["ChannelMember"] = Relationship(
        sa_relationship=relationship("ChannelMember", back_populates="user")
    )

    reactions: List["Reaction"] = Relationship(
        sa_relationship=relationship("Reaction", back_populates="user")
    )
    sent_notifications: List["Notification"] = Relationship(
        sa_relationship=relationship(
            "Notification", foreign_keys="Notification.sender_id"
        )
    )
    received_notifications: List["Notification"] = Relationship(
        sa_relationship=relationship(
            "Notification", foreign_keys="Notification.recipient_id"
        )
    )
    invite_code_id: str | None = Field(foreign_key="invite_code.id", default=None)
    invite_code: Optional["InviteCode"] = Relationship(
        sa_relationship=relationship(
            "InviteCode", back_populates="used_by", foreign_keys="User.invite_code_id"
        )
    )
    user_settings: "UserSettings" = Relationship(
        sa_relationship=relationship(
            "UserSettings", back_populates="user", uselist=False
        )
    )
    user_social: "UserSocial" = Relationship(
        sa_relationship=relationship("UserSocial", back_populates="user", uselist=False)
    )
    password_resets: List["PasswordReset"] = Relationship(
        sa_relationship=relationship("PasswordReset", back_populates="user")
    )


class UserSettings(BaseModel, table=True):
    __tablename__ = "user_settings"

    user_id: str = Field(foreign_key="user.id", unique=True)
    is_onboarded: bool = Field(default=False)
    user: "User" = Relationship(
        sa_relationship=relationship("User", back_populates="user_settings")
    )


class UserSocial(BaseModel, table=True):
    __tablename__ = "user_social"

    user_id: str = Field(foreign_key="user.id", unique=True)
    twitter_url: str | None = Field(default=None)
    linkedin_url: str | None = Field(default=None)
    github_url: str | None = Field(default=None)
    website_url: str | None = Field(default=None)
    user: "User" = Relationship(
        sa_relationship=relationship("User", back_populates="user_social")
    )


class Post(BaseModel, table=True):
    title: str | None = Field(default=None)
    content: str
    type: PostType = Field(default=PostType.POST)
    user_id: str = Field(foreign_key="user.id")
    channel_id: str | None = Field(foreign_key="channel.id", default=None)
    parent_id: str | None = Field(foreign_key="post.id", default=None)
    is_pinned: bool = Field(default=False)
    user: "User" = Relationship(
        sa_relationship=relationship("User", back_populates="posts")
    )
    channel: Optional["Channel"] = Relationship(
        sa_relationship=relationship("Channel", back_populates="posts")
    )
    parent: Optional["Post"] = Relationship(
        sa_relationship=relationship(
            "Post", back_populates="replies", remote_side="Post.id"
        )
    )
    replies: List["Post"] = Relationship(
        sa_relationship=relationship("Post", back_populates="parent")
    )
    medias: List["Media"] = Relationship(
        sa_relationship=relationship("Media", back_populates="post")
    )

    reactions: List["Reaction"] = Relationship(
        sa_relationship=relationship("Reaction", back_populates="post")
    )

    @hybrid_property
    def comment_count(self) -> int:
        from sqlalchemy import inspect, text

        sql = text("""
        WITH RECURSIVE rt AS (
            SELECT id FROM post WHERE parent_id = :post_id
            UNION ALL
            SELECT p.id FROM post p INNER JOIN rt ON p.parent_id = rt.id
        )
        SELECT COUNT(*) FROM rt
        """)
        session = inspect(self).session
        if session:
            return session.scalar(sql.bindparams(post_id=self.id))
        return 0

    @hybrid_property
    def reaction_count(self) -> int:
        return len(self.reactions)

    model_config = {"ignored_types": (hybrid_property,)}  # type: ignore


class Media(BaseModel, table=True):
    url: str = Field(index=True)
    post_id: str | None = Field(foreign_key="post.id", default=None)
    user_id: str = Field(foreign_key="user.id")
    post: "Post" = Relationship(
        sa_relationship=relationship("Post", back_populates="medias")
    )
    user: "User" = Relationship(
        sa_relationship=relationship("User", back_populates="medias")
    )


class ChannelType(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class Channel(BaseModel, table=True):
    __tablename__ = "channel"

    emoji: str = Field(default="😊")
    name: str = Field(index=True)
    description: str | None = Field(default=None)
    slug: str = Field(index=True, unique=True)
    type: ChannelType = Field(default=ChannelType.PUBLIC)
    members: List["ChannelMember"] = Relationship(
        sa_relationship=relationship("ChannelMember", back_populates="channel")
    )
    posts: List["Post"] = Relationship(
        sa_relationship=relationship("Post", back_populates="channel")
    )
    resources: List["Resource"] = Relationship(
        sa_relationship=relationship("Resource", back_populates="channel")
    )


class ChannelMember(BaseModel, table=True):
    channel_id: str = Field(foreign_key="channel.id")
    user_id: str = Field(foreign_key="user.id")
    channel: "Channel" = Relationship(
        sa_relationship=relationship("Channel", back_populates="members")
    )
    user: "User" = Relationship(
        sa_relationship=relationship("User", back_populates="channel_members")
    )


class NotificationType(str, Enum):
    MENTION = "mention"
    LIKE = "like"


class ActivityType(str, Enum):
    CREATE_POST = "create_post"
    LIKE_POST = "like_post"
    COMMENT_POST = "comment_post"
    LOGIN = "login"
    LOGOUT = "logout"


class Reaction(BaseModel, table=True):
    user_id: str = Field(foreign_key="user.id")
    post_id: str = Field(foreign_key="post.id")
    emoji: str
    user: "User" = Relationship(
        sa_relationship=relationship("User", back_populates="reactions")
    )
    post: "Post" = Relationship(
        sa_relationship=relationship("Post", back_populates="reactions")
    )


class Activity(BaseModel, table=True):
    user_id: str = Field(foreign_key="user.id")
    type: ActivityType
    target_id: str | None = Field(default=None)  # ID of the related object (post, etc.)
    target_type: str | None = Field(
        default=None
    )  # Type of the related object (post, etc.)
    data: dict | None = Field(default=None, sa_type=JSON)  # Additional activity data
    user: "User" = Relationship(sa_relationship=relationship("User"))


class Notification(BaseModel, table=True):
    recipient_id: str = Field(foreign_key="user.id")
    sender_id: str = Field(foreign_key="user.id")
    type: NotificationType
    data: dict | None = Field(default=None, sa_type=JSON)
    is_read: bool = Field(default=False)
    recipient: "User" = Relationship(
        sa_relationship=relationship(
            "User",
            back_populates="received_notifications",
            foreign_keys="[Notification.recipient_id]",
        )
    )
    sender: "User" = Relationship(
        sa_relationship=relationship(
            "User",
            back_populates="sent_notifications",
            foreign_keys="[Notification.sender_id]",
        )
    )


class Course(BaseModel, table=True):
    title: str = Field(index=True)
    description: str | None = Field(default=None)
    thumbnail_url: str | None = Field(default=None)
    status: CourseStatus = Field(default=CourseStatus.DRAFT)
    instructor_id: str = Field(foreign_key="user.id")
    price: float | None = Field(default=None)
    is_featured: bool = Field(default=False)
    instructor: "User" = Relationship(sa_relationship=relationship("User"))
    sections: List["Section"] = Relationship(
        sa_relationship=relationship(
            "Section", back_populates="course", order_by="Section.order"
        )
    )
    enrollments: List["EnrolledCourse"] = Relationship(
        sa_relationship=relationship("EnrolledCourse", back_populates="course")
    )


class Section(BaseModel, table=True):
    title: str = Field(index=True)
    description: str | None = Field(default=None)
    order: int = Field(index=True)
    course_id: str = Field(foreign_key="course.id")
    course: "Course" = Relationship(
        sa_relationship=relationship("Course", back_populates="sections")
    )
    lessons: List["Lesson"] = Relationship(
        sa_relationship=relationship(
            "Lesson", back_populates="section", order_by="Lesson.order"
        )
    )


class Lesson(BaseModel, table=True):
    title: str = Field(index=True)
    content: str | None = Field(default=None)
    video_url: str | None = Field(default=None)
    order: int = Field(index=True)
    type: LessonType = Field(default=LessonType.TEXT)
    section_id: str = Field(foreign_key="section.id")
    section: "Section" = Relationship(
        sa_relationship=relationship("Section", back_populates="lessons")
    )


class EnrolledCourse(BaseModel, table=True):
    user_id: str = Field(foreign_key="user.id")
    course_id: str = Field(foreign_key="course.id")
    status: EnrollmentStatus = Field(default=EnrollmentStatus.ACTIVE)
    enrolled_at: str | None = Field(default=None)
    completed_at: str | None = Field(default=None)
    user: "User" = Relationship(sa_relationship=relationship("User"))
    course: "Course" = Relationship(
        sa_relationship=relationship("Course", back_populates="enrollments")
    )


class UrlPreview(BaseModel, table=True):
    url: str = Field(index=True, unique=True)
    title: str | None = Field(default=None)
    description: str | None = Field(default=None)
    image_url: str | None = Field(default=None)


class Resource(BaseModel, table=True):
    url: str = Field(index=True)
    description: str | None = Field(default=None)
    user_id: str = Field(foreign_key="user.id")
    channel_id: str = Field(foreign_key="channel.id")
    user: "User" = Relationship(
        sa_relationship=relationship("User", back_populates="resources")
    )
    channel: "Channel" = Relationship(
        sa_relationship=relationship("Channel", back_populates="resources")
    )


class AppSettings(BaseModel, table=True):
    __tablename__ = "app_settings"

    # Override id to use a constant value, ensuring only one record exists
    id: str = Field(default="singleton", primary_key=True)
    app_name: str = Field(default="OpenCircle")
    app_logo_url: str | None = Field(default=None)
    enable_sign_up: bool = Field(default=True)
    enable_opencircle_branding: bool = Field(default=True)


class AppLink(BaseModel, table=True):
    __tablename__ = "app_links"

    label: str = Field(default="OpenCircle")
    url: str = Field(index=True)


class UserPresence(BaseModel, table=True):
    __tablename__ = "user_presence"

    user_id: str = Field(foreign_key="user.id", index=True)
    connection_id: str = Field(index=True)  # WebSocket connection ID
    connected_at: str = Field(index=True)  # ISO datetime when connected
    disconnected_at: str | None = Field(
        default=None, index=True
    )  # ISO datetime when disconnected
    duration_seconds: float | None = Field(default=None)  # Total connection duration
    user: "User" = Relationship(sa_relationship=relationship("User"))

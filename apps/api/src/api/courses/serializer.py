from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from src.api.user.serializer import UserResponse
from src.database.models import CourseStatus, EnrollmentStatus, LessonType


class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: CourseStatus = CourseStatus.DRAFT
    instructor_id: str
    price: Optional[float] = None
    is_featured: bool = False


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: Optional[CourseStatus] = None
    instructor_id: Optional[str] = None
    price: Optional[float] = None
    is_featured: Optional[bool] = None


class CourseResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: CourseStatus
    instructor_id: str
    price: Optional[float] = None
    is_featured: bool
    instructor: Optional[UserResponse] = None
    sections: List["SectionResponse"] = Field(default=[])
    enrollments: List["CourseEnrollmentResponse"] = Field(default=[])
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SectionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    order: int
    course_id: str


class SectionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    course_id: Optional[str] = None


class SectionResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    order: int
    course_id: str
    lessons: List["LessonResponse"] = Field(default=[])
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LessonCreate(BaseModel):
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    order: int
    type: LessonType = LessonType.TEXT
    section_id: str


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    order: Optional[int] = None
    type: Optional[LessonType] = None
    section_id: Optional[str] = None


class LessonResponse(BaseModel):
    id: str
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    order: int
    type: LessonType
    section_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LessonWithSectionCourseResponse(BaseModel):
    """Lesson response that includes section and course information"""

    id: str
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    order: int
    type: LessonType
    section_id: str
    section: "SectionMinimalResponse"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SectionMinimalResponse(BaseModel):
    """Minimal section response to avoid circular references"""

    id: str
    title: str
    description: Optional[str] = None
    order: int
    course_id: str
    course: "CourseMinimalResponse"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseMinimalResponse(BaseModel):
    """Minimal course response to avoid circular references"""

    id: str
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    status: CourseStatus
    instructor_id: str
    price: Optional[float] = None
    is_featured: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnrolledCourseCreate(BaseModel):
    user_id: str
    course_id: str
    status: EnrollmentStatus = EnrollmentStatus.ACTIVE
    enrolled_at: Optional[str] = None
    completed_at: Optional[str] = None


class EnrolledCourseUpdate(BaseModel):
    user_id: Optional[str] = None
    course_id: Optional[str] = None
    status: Optional[EnrollmentStatus] = None
    enrolled_at: Optional[str] = None
    completed_at: Optional[str] = None


class CourseEnrollmentResponse(BaseModel):
    """Minimal enrollment response for course enrollments list"""

    id: str
    user_id: str
    status: EnrollmentStatus
    enrolled_at: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnrolledCourseCreateResponse(BaseModel):
    """Response model for enrollment creation without circular reference"""

    id: str
    user_id: str
    course_id: str
    status: EnrollmentStatus
    enrolled_at: Optional[str] = None
    completed_at: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnrolledCourseResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    status: EnrollmentStatus
    enrolled_at: Optional[str] = None
    completed_at: Optional[str] = None
    user: Optional[UserResponse] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Resolve forward references for Pydantic v2
CourseResponse.model_rebuild()
SectionResponse.model_rebuild()
LessonResponse.model_rebuild()
LessonWithSectionCourseResponse.model_rebuild()
SectionMinimalResponse.model_rebuild()
CourseMinimalResponse.model_rebuild()
EnrolledCourseResponse.model_rebuild()
CourseEnrollmentResponse.model_rebuild()

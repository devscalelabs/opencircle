from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import selectinload
from sqlmodel import Session, desc, select

from src.database.models import (
    Course,
    CourseStatus,
    EnrolledCourse,
    Lesson,
    Role,
    Section,
    User,
)


def soft_delete(db: Session, record) -> None:
    """Soft delete a record by setting deleted_at timestamp."""
    record.deleted_at = datetime.now(timezone.utc)
    db.add(record)


# Course methods
def create_course(db: Session, course_data: dict) -> Course:
    """Create a new course."""
    course = Course(**course_data)
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def get_course(db: Session, course_id: str) -> Optional[Course]:
    """Get a course by ID with sections and lessons."""
    statement = (
        select(Course)
        .where(Course.id == course_id, Course.deleted_at.is_(None))
        .options(selectinload(Course.sections).selectinload(Section.lessons))
    )
    return db.exec(statement).first()


def update_course(db: Session, course_id: str, update_data: dict) -> Optional[Course]:
    """Update a course by ID."""
    course = db.get(Course, course_id)
    if not course:
        return None
    for key, value in update_data.items():
        setattr(course, key, value)
    db.commit()
    db.refresh(course)
    return course


def delete_course(db: Session, course_id: str) -> bool:
    """Soft delete a course by ID."""
    course = db.get(Course, course_id)
    if not course:
        return False

    # Soft delete related enrollments first
    enrollment_statement = select(EnrolledCourse).where(
        EnrolledCourse.course_id == course_id
    )
    enrollment_records = db.exec(enrollment_statement).all()
    for enrollment in enrollment_records:
        soft_delete(db, enrollment)

    section_statement = select(Section).where(Section.course_id == course_id)
    section_records = db.exec(section_statement).all()
    for section in section_records:
        lesson_statement = select(Lesson).where(Lesson.section_id == section.id)
        lesson_records = db.exec(lesson_statement).all()
        for lesson in lesson_records:
            soft_delete(db, lesson)

        soft_delete(db, section)

    soft_delete(db, course)
    db.commit()
    return True


def get_all_courses(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    instructor_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: Optional[User] = None,
) -> List[Course]:
    """Get all courses with pagination and optional filters."""
    statement = (
        select(Course)
        .where(Course.deleted_at.is_(None))
        .order_by(desc(Course.created_at))
        .offset(skip)
        .limit(limit)
    )

    if instructor_id:
        statement = statement.where(Course.instructor_id == instructor_id)

    # Admin users can see all courses, others default to published only
    if status:
        statement = statement.where(Course.status == status)
    elif not current_user or current_user.role != Role.ADMIN:
        statement = statement.where(Course.status == CourseStatus.PUBLISHED)

    return list(db.exec(statement).all())


def get_featured_courses(
    db: Session,
    skip: int = 0,
    limit: int = 100,
) -> List[Course]:
    """Get featured courses that are published."""
    statement = (
        select(Course)
        .where(Course.is_featured)
        .where(Course.status == CourseStatus.PUBLISHED)
        .where(Course.deleted_at.is_(None))
        .order_by(desc(Course.created_at))
        .offset(skip)
        .limit(limit)
    )

    return list(db.exec(statement).all())


# Section methods
def create_section(db: Session, section_data: dict) -> Section:
    """Create a new section."""
    section = Section(**section_data)
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


def get_section(db: Session, section_id: str) -> Optional[Section]:
    """Get a section by ID."""
    statement = select(Section).where(Section.id == section_id, Section.deleted_at.is_(None))
    return db.exec(statement).first()


def update_section(
    db: Session, section_id: str, update_data: dict
) -> Optional[Section]:
    """Update a section by ID."""
    section = db.get(Section, section_id)
    if not section:
        return None
    for key, value in update_data.items():
        setattr(section, key, value)
    db.commit()
    db.refresh(section)
    return section


def delete_section(db: Session, section_id: str) -> bool:
    """Soft delete a section by ID."""
    section = db.get(Section, section_id)
    if not section:
        return False
    soft_delete(db, section)
    db.commit()
    return True


def get_all_sections(
    db: Session, skip: int = 0, limit: int = 100, course_id: Optional[str] = None
) -> List[Section]:
    """Get all sections with pagination and optional course filter."""
    statement = select(Section).where(Section.deleted_at.is_(None)).offset(skip).limit(limit)

    if course_id:
        statement = statement.where(Section.course_id == course_id)

    return list(db.exec(statement).all())


# Lesson methods
def create_lesson(db: Session, lesson_data: dict) -> Lesson:
    """Create a new lesson."""
    lesson = Lesson(**lesson_data)
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


def get_lesson(db: Session, lesson_id: str) -> Optional[Lesson]:
    """Get a lesson by ID with section and course relationships."""
    statement = (
        select(Lesson)
        .where(Lesson.id == lesson_id, Lesson.deleted_at.is_(None))
        .options(selectinload(Lesson.section).selectinload(Section.course))
    )
    return db.exec(statement).first()


def update_lesson(db: Session, lesson_id: str, update_data: dict) -> Optional[Lesson]:
    """Update a lesson by ID."""
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        return None
    for key, value in update_data.items():
        setattr(lesson, key, value)
    db.commit()
    db.refresh(lesson)
    return lesson


def delete_lesson(db: Session, lesson_id: str) -> bool:
    """Soft delete a lesson by ID."""
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        return False
    soft_delete(db, lesson)
    db.commit()
    return True


def get_all_lessons(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    section_id: Optional[str] = None,
    type: Optional[str] = None,
) -> List[Lesson]:
    """Get all lessons with pagination and optional filters."""
    statement = select(Lesson).where(Lesson.deleted_at.is_(None)).offset(skip).limit(limit)

    if section_id:
        statement = statement.where(Lesson.section_id == section_id)

    if type:
        statement = statement.where(Lesson.type == type)

    return list(db.exec(statement).all())


def create_enrollment(db: Session, enrollment_data: dict) -> EnrolledCourse:
    """Create a new enrollment."""
    # Set enrolled_at to current timestamp if not provided
    if (
        "enrolled_at" not in enrollment_data
        or enrollment_data.get("enrolled_at") is None
    ):
        enrollment_data["enrolled_at"] = datetime.now().isoformat()

    enrollment = EnrolledCourse(**enrollment_data)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


def get_enrollment(db: Session, enrollment_id: str) -> Optional[EnrolledCourse]:
    """Get an enrollment by ID."""
    statement = select(EnrolledCourse).where(
        EnrolledCourse.id == enrollment_id, EnrolledCourse.deleted_at.is_(None)
    )
    return db.exec(statement).first()


def update_enrollment(
    db: Session, enrollment_id: str, update_data: dict
) -> Optional[EnrolledCourse]:
    """Update an enrollment by ID."""
    enrollment = db.get(EnrolledCourse, enrollment_id)
    if not enrollment:
        return None
    for key, value in update_data.items():
        setattr(enrollment, key, value)
    db.commit()
    db.refresh(enrollment)
    return enrollment


def delete_enrollment(db: Session, enrollment_id: str) -> bool:
    """Soft delete an enrollment by ID."""
    enrollment = db.get(EnrolledCourse, enrollment_id)
    if not enrollment:
        return False
    soft_delete(db, enrollment)
    db.commit()
    return True


def get_all_enrollments(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    course_id: Optional[str] = None,
    status: Optional[str] = None,
) -> List[EnrolledCourse]:
    """Get all enrollments with pagination and optional filters."""
    statement = (
        select(EnrolledCourse).where(EnrolledCourse.deleted_at.is_(None)).offset(skip).limit(limit)
    )

    if user_id:
        statement = statement.where(EnrolledCourse.user_id == user_id)

    if course_id:
        statement = statement.where(EnrolledCourse.course_id == course_id)

    if status:
        statement = statement.where(EnrolledCourse.status == status)

    # Order by newest first (created_at descending)
    statement = statement.order_by(desc(EnrolledCourse.created_at))

    return list(db.exec(statement).all())

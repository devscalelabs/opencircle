from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from src.api.channels.api import get_current_user_optional
from src.database.engine import get_session as get_db
from src.database.models import User
from src.modules.courses.courses_methods import (
    # Course methods
    create_course,
    # Enrollment methods
    create_enrollment,
    # Lesson methods
    create_lesson,
    # Section methods
    create_section,
    delete_course,
    delete_enrollment,
    delete_lesson,
    delete_section,
    get_all_courses,
    get_all_enrollments,
    get_all_lessons,
    get_all_sections,
    get_course,
    get_enrollment,
    get_featured_courses,
    get_lesson,
    get_section,
    update_course,
    update_enrollment,
    update_lesson,
    update_section,
)

from .serializer import (
    # Course serializers
    CourseCreate,
    CourseResponse,
    CourseUpdate,
    # Enrollment serializers
    EnrolledCourseCreate,
    EnrolledCourseCreateResponse,
    EnrolledCourseResponse,
    EnrolledCourseUpdate,
    # Lesson serializers
    LessonCreate,
    LessonResponse,
    LessonUpdate,
    LessonWithSectionCourseResponse,
    # Section serializers
    SectionCreate,
    SectionResponse,
    SectionUpdate,
)

router = APIRouter()


# Course endpoints
@router.post("/courses/", response_model=CourseResponse)
def create_course_endpoint(course: CourseCreate, db: Session = Depends(get_db)):
    course_data = course.model_dump()
    return create_course(db, course_data)


@router.get("/courses/{course_id}", response_model=CourseResponse)
def get_course_endpoint(course_id: str, db: Session = Depends(get_db)):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Debug: Print what we're getting
    print(f"Course: {course.title}")
    print(f"Sections count: {len(course.sections) if course.sections else 0}")
    for i, section in enumerate(course.sections):
        print(f"Section {i}: {section.title}")
        print(f"  Lessons count: {len(section.lessons) if section.lessons else 0}")
        if section.lessons:
            for j, lesson in enumerate(section.lessons):
                print(f"    Lesson {j}: {lesson.title}")

    return course


@router.get("/courses/", response_model=List[CourseResponse])
def get_all_courses_endpoint(
    skip: int = 0,
    limit: int = 100,
    instructor_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    return get_all_courses(db, skip, limit, instructor_id, status, current_user)


@router.get("/courses/featured/", response_model=List[CourseResponse])
def get_featured_courses_endpoint(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    return get_featured_courses(db, skip, limit)


@router.put("/courses/{course_id}", response_model=CourseResponse)
def update_course_endpoint(
    course_id: str, course: CourseUpdate, db: Session = Depends(get_db)
):
    update_data = {k: v for k, v in course.model_dump().items() if v is not None}
    updated_course = update_course(db, course_id, update_data)
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated_course


@router.delete("/courses/{course_id}")
def delete_course_endpoint(course_id: str, db: Session = Depends(get_db)):
    if not delete_course(db, course_id):
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted"}


# Section endpoints
@router.post("/sections/", response_model=SectionResponse)
def create_section_endpoint(section: SectionCreate, db: Session = Depends(get_db)):
    section_data = section.model_dump()
    return create_section(db, section_data)


@router.get("/sections/{section_id}", response_model=SectionResponse)
def get_section_endpoint(section_id: str, db: Session = Depends(get_db)):
    section = get_section(db, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section


@router.get("/sections/", response_model=List[SectionResponse])
def get_all_sections_endpoint(
    skip: int = 0,
    limit: int = 100,
    course_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return get_all_sections(db, skip, limit, course_id)


@router.put("/sections/{section_id}", response_model=SectionResponse)
def update_section_endpoint(
    section_id: str, section: SectionUpdate, db: Session = Depends(get_db)
):
    update_data = {k: v for k, v in section.model_dump().items() if v is not None}
    updated_section = update_section(db, section_id, update_data)
    if not updated_section:
        raise HTTPException(status_code=404, detail="Section not found")
    return updated_section


@router.delete("/sections/{section_id}")
def delete_section_endpoint(section_id: str, db: Session = Depends(get_db)):
    if not delete_section(db, section_id):
        raise HTTPException(status_code=404, detail="Section not found")
    return {"message": "Section deleted"}


# Lesson endpoints
@router.post("/lessons/", response_model=LessonResponse)
def create_lesson_endpoint(lesson: LessonCreate, db: Session = Depends(get_db)):
    lesson_data = lesson.model_dump()
    return create_lesson(db, lesson_data)


@router.get("/lessons/{lesson_id}", response_model=LessonWithSectionCourseResponse)
def get_lesson_endpoint(lesson_id: str, db: Session = Depends(get_db)):
    lesson = get_lesson(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.get("/lessons/", response_model=List[LessonResponse])
def get_all_lessons_endpoint(
    skip: int = 0,
    limit: int = 100,
    section_id: Optional[str] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return get_all_lessons(db, skip, limit, section_id, type)


@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
def update_lesson_endpoint(
    lesson_id: str, lesson: LessonUpdate, db: Session = Depends(get_db)
):
    update_data = {k: v for k, v in lesson.model_dump().items() if v is not None}
    updated_lesson = update_lesson(db, lesson_id, update_data)
    if not updated_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return updated_lesson


@router.delete("/lessons/{lesson_id}")
def delete_lesson_endpoint(lesson_id: str, db: Session = Depends(get_db)):
    if not delete_lesson(db, lesson_id):
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"message": "Lesson deleted"}


# Enrollment endpoints
@router.post("/enrollments/", response_model=EnrolledCourseCreateResponse)
def create_enrollment_endpoint(
    enrollment: EnrolledCourseCreate, db: Session = Depends(get_db)
):
    enrollment_data = enrollment.model_dump()
    return create_enrollment(db, enrollment_data)


@router.get("/enrollments/{enrollment_id}", response_model=EnrolledCourseResponse)
def get_enrollment_endpoint(enrollment_id: str, db: Session = Depends(get_db)):
    enrollment = get_enrollment(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment


@router.get("/enrollments/", response_model=List[EnrolledCourseResponse])
def get_all_enrollments_endpoint(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    course_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return get_all_enrollments(db, skip, limit, user_id, course_id, status)


@router.put("/enrollments/{enrollment_id}", response_model=EnrolledCourseResponse)
def update_enrollment_endpoint(
    enrollment_id: str, enrollment: EnrolledCourseUpdate, db: Session = Depends(get_db)
):
    update_data = {k: v for k, v in enrollment.model_dump().items() if v is not None}
    updated_enrollment = update_enrollment(db, enrollment_id, update_data)
    if not updated_enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return updated_enrollment


@router.delete("/enrollments/{enrollment_id}")
def delete_enrollment_endpoint(enrollment_id: str, db: Session = Depends(get_db)):
    if not delete_enrollment(db, enrollment_id):
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return {"message": "Enrollment deleted"}

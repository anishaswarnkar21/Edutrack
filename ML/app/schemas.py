from typing import List

from pydantic import BaseModel, Field, field_validator


class QuizRequest(BaseModel):
    lessonText: str = Field(..., min_length=1)
    # Allow up to 20 questions and default to 16 when not provided.
    numQuestions: int = Field(default=16, ge=1, le=20)


class QuestionSchema(BaseModel):
    questionText: str
    options: List[str]
    correctAnswerIndex: int

    @field_validator("options")
    @classmethod
    def exactly_four_options(cls, value: List[str]) -> List[str]:
        if len(value) != 4:
            raise ValueError("options must contain exactly 4 items")
        return value

    @field_validator("correctAnswerIndex")
    @classmethod
    def index_in_range(cls, value: int) -> int:
        if not 0 <= value <= 3:
            raise ValueError("correctAnswerIndex must be between 0 and 3")
        return value


class QuizResponse(BaseModel):
    questions: List[QuestionSchema]


class HealthResponse(BaseModel):
    status: str
    modelSource: str
    device: str
    modelLoaded: bool = True

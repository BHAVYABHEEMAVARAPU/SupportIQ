
from typing import Optional, Literal

from pydantic import BaseModel, Field


class TicketCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=100)
    email: str
    subject: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=5000)


class TicketUpdate(BaseModel):
    status: Optional[
        Literal["Open", "In Progress", "Resolved", "Closed"]
    ] = None

    priority: Optional[
        Literal["Low", "Medium", "High", "Critical"]
    ] = None

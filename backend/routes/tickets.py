
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query

from ai_service import analyze_ticket, generate_suggested_reply
from database import get_tickets_collection
from models import TicketCreate, TicketUpdate

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


def serialize_ticket(ticket):
    """Convert MongoDB's ObjectId into a JSON-compatible string."""
    ticket["id"] = str(ticket.pop("_id"))
    return ticket


@router.post("/", status_code=201)
def create_ticket(payload: TicketCreate):
    """Create a ticket and automatically analyze its content."""
    collection = get_tickets_collection()

    ticket = payload.model_dump()

    # Analyze the ticket.
    analysis = analyze_ticket(
        ticket["subject"],
        ticket["description"],
    )
    ticket.update(analysis)

    # Add default status and timestamps.
    now = datetime.now(timezone.utc)
    ticket.update({
        "status": "Open",
        "created_at": now,
        "updated_at": now,
    })

    # Save the ticket to MongoDB.
    result = collection.insert_one(ticket)

    # Return a JSON-safe response.
    ticket["id"] = str(result.inserted_id)
    ticket.pop("_id", None)

    return ticket


@router.get("/")
def list_tickets(
    status: str = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
):
    """List tickets, optionally filtered by status."""
    collection = get_tickets_collection()

    query = {"status": status} if status else {}

    tickets = list(
        collection.find(query)
        .sort("created_at", -1)
        .limit(limit)
    )

    return [
        serialize_ticket(ticket)
        for ticket in tickets
    ]


@router.get("/{ticket_id}")
def get_ticket(ticket_id: str):
    """Retrieve a single ticket by its MongoDB ID."""
    if not ObjectId.is_valid(ticket_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid ticket ID",
        )

    ticket = get_tickets_collection().find_one(
        {"_id": ObjectId(ticket_id)}
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    return serialize_ticket(ticket)


@router.patch("/{ticket_id}")
def update_ticket(
    ticket_id: str,
    payload: TicketUpdate,
):
    """Update a ticket's status or priority."""
    if not ObjectId.is_valid(ticket_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid ticket ID",
        )

    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=400,
            detail="No updates provided",
        )

    updates["updated_at"] = datetime.now(timezone.utc)

    collection = get_tickets_collection()

    result = collection.update_one(
        {"_id": ObjectId(ticket_id)},
        {"$set": updates},
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    ticket = collection.find_one(
        {"_id": ObjectId(ticket_id)}
    )

    return serialize_ticket(ticket)


@router.post("/{ticket_id}/suggest-reply")
def suggest_ticket_reply(ticket_id: str):
    """Generate a suggested support reply for a ticket."""
    if not ObjectId.is_valid(ticket_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid ticket ID",
        )

    ticket = get_tickets_collection().find_one(
        {"_id": ObjectId(ticket_id)}
    )

    if ticket is None:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    reply = generate_suggested_reply(ticket)

    return {
        "ticket_id": str(ticket["_id"]),
        "suggested_reply": reply,
    }

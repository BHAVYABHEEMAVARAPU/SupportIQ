
import re


def analyze_ticket(subject: str, description: str) -> dict:
    """Analyze a support ticket using lightweight text rules."""

    text = f"{subject} {description}".lower()
    words = set(re.findall(r"\b[\w']+\b", text))

    # 1. Ticket categorization
    categories = {
        "Billing": {
            "billing", "payment", "invoice", "refund",
            "charged", "transaction", "subscription", "price",
        },
        "Account Access": {
            "login", "log", "password", "account", "signin",
            "sign", "locked", "authentication", "access",
        },
        "Bug Report": {
            "bug", "crash", "error", "broken", "exception",
            "glitch", "freeze", "freezes", "unexpected",
        },
        "Technical Support": {
            "install", "installation", "server", "network",
            "connection", "slow", "loading", "configure",
            "configuration", "technical",
        },
    }

    scores = {
        category: len(words & keywords)
        for category, keywords in categories.items()
    }

    best_category = max(scores, key=scores.get)

    if scores[best_category] == 0:
        category = "General Inquiry"
    else:
        category = best_category

    # 2. Sentiment analysis (rule-based baseline)
    negative_words = {
        "angry", "bad", "broken", "disappointed", "frustrated",
        "hate", "issue", "problem", "terrible", "unable",
        "wrong", "failed", "failure", "unhappy", "worst",
    }

    positive_words = {
        "great", "good", "excellent", "happy", "love",
        "thanks", "thank", "helpful", "wonderful", "resolved",
    }

    negative_score = len(words & negative_words)
    positive_score = len(words & positive_words)

    if negative_score > positive_score:
        sentiment = "Negative"
    elif positive_score > negative_score:
        sentiment = "Positive"
    else:
        sentiment = "Neutral"

    # 3. Priority recommendation
    critical_phrases = [
        "data breach",
        "security breach",
        "account hacked",
        "data loss",
        "all users",
        "service down",
        "production down",
    ]

    high_phrases = [
        "urgent",
        "as soon as possible",
        "cannot access",
        "can't access",
        "business stopped",
        "completely broken",
        "payment failed",
    ]

    if any(phrase in text for phrase in critical_phrases):
        priority = "Critical"
    elif any(phrase in text for phrase in high_phrases):
        priority = "High"
    elif negative_score >= 2:
        priority = "High"
    elif category == "General Inquiry" and sentiment == "Positive":
        priority = "Low"
    else:
        priority = "Medium"

    return {
        "category": category,
        "sentiment": sentiment,
        "priority": priority,
    }


def generate_suggested_reply(ticket: dict) -> str:
    """Generate a suggested customer-support reply."""

    name = ticket.get("customer_name") or "there"
    subject = ticket.get("subject") or "your request"
    category = ticket.get("category", "General Inquiry")
    sentiment = ticket.get("sentiment", "Neutral")

    # Select a reply based on the ticket category.
    if category == "Billing":
        message = (
            "We understand your billing concern. "
            "Please share the relevant invoice or transaction reference "
            "so our support team can investigate the issue."
        )

    elif category == "Account Access":
        message = (
            "We're sorry you're having trouble accessing your account. "
            "Please share the error message you're seeing. "
            "Never share your password or verification codes."
        )

    elif category == "Bug Report":
        message = (
            "Thank you for reporting this issue. "
            "Our team will investigate it. Please share the steps "
            "to reproduce the problem and any relevant error messages."
        )

    elif category == "Technical Support":
        message = (
            "We're happy to help resolve your technical issue. "
            "Please share the steps that led to the problem and "
            "any error messages you received."
        )

    else:
        message = (
            "Thank you for contacting our support team. "
            "Could you provide additional details to help us "
            "understand and resolve your request?"
        )

    # Personalize the opening based on the detected sentiment.
    if sentiment == "Negative":
        opening = (
            f"Hi {name},\n\n"
            "We're sorry for the frustration this issue has caused. "
        )
    else:
        opening = (
            f"Hi {name},\n\n"
            "Thank you for reaching out to us. "
        )

    # Return the complete suggested reply.
    return (
        f"{opening}{message}\n\n"
        f"Regarding: {subject}\n\n"
        "Please let us know if you have any other questions.\n\n"
        "Best regards,\n"
        "SupportIQ Support Team"
    )

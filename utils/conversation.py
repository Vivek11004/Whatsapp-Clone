def generate_conversation_key(
    user1_id: int,
    user2_id: int
):

    smaller = min(user1_id, user2_id)
    larger = max(user1_id, user2_id)

    return f"{smaller}_{larger}"
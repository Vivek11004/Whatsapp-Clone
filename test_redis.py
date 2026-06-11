import asyncio

from core.redis import redis_client


async def main():

    await redis_client.set(
        "chat",
        "redis working"
    )

    value = await redis_client.get("chat")

    print(value)


asyncio.run(main())
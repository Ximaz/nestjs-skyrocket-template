# NestJS Skyrocket Template (under construction)

This project aims to provide an optimized NestJS workflow to create nice APIs.

To do so, I am basing myself on the following article that I found quite
interesting, and not ChatGPT generated, like some others I came across :

https://medium.com/@ahmed.soliman/how-to-make-nestjs-blazing-fast-5949e178346f

## Tech Stack

### Package manager (PNPM) ✅

I will go with `pnpm` for my projects. I think you can use any other one, just
personnal preference, and it has no direct impact on how well your application
is running (As far as I know).

### Typescript ✅

Obviously.

### HTTP Server (Fastify) ✅

To handle requests, I will configure NestJS to use Fastify over ExpressJS.

### Caching (Redis) ✅

To cache responses and relieve database overhead, I will use a Redis cache.

### Logging (Nest Winston) ✅

Based on the article I read, using a good logger is crucial in order to not
block the main thread. I will use the NestJS Winston logger.

### Scopes (Nest IoC) ✅

In the article, it is recommanded not to inject scope when creating controllers
and services, as it can lead to memory overhead. You should use those for
specific situations, but most of the time, you will not need them.

### Compression (Brotli algorithm) ✅

While reading the article, I stumbled on the `Compression` section. I totally
did forget about such thing while creating my backend application, whereas it
should have been a point I must address, because it is as important as any
other point.

The article showcased Gzip vs Brotli, and Brotli seems to do better according
to the provided context in the article. I may be wrong, as it surely depends on
the configuration and the purpose of the web application, but I am all-in, the
worst that can happen is I will learn. And I believe it can not be worse than
no compression at all.

### ORM (MikroORM) 🏗️

I heard many things about ORMs. I have personally tried Prisma and Drizzle, and
I read some opinions about them. In one hand, Prisma offers great a great
developer experience, which I agree to, but the trade off are performances, and
in the other hand, Drizzle offers performance, but the trade off is you have to
deal with everything yourself. I'm not talking about raw SQL itself, but rather
error handling and so on.

I then read about another ORM called MikroORM which aims to take the good about
both ORMs, so I will incorporate it.

### Database (PostgreSQL) 🏗️

This section is one I can not address in my template, because it depends on you
as a developer, to correctly index your database columns. If you need to use a
string type for a unique value you want to search from (email, username, ...),
then you must index it correctly.

What proper indexing does is it allows your queries that are trying to match
string run faster. That is the most important part I understood from it, I will
not explain it in depth here.

Also, I will use a PostgreSQL database, because that is the one I am the most
confortable with. But I guess you can configure another one youself.

### Async vs Sync methods ✅

You should try to avoid as much as possible to use synchronous I/O operations
as it blocks the main thread (being the only one your application has).

Instead, use asynchronous I/O operations. For instance, you should prefer to
use `await readFile(...)` from `node:fs/promise` than `readFileSync` from the
`node:fs` package.

### Workers

As mentioned in the previous section, your application runs on a single thread.
It can lead to computing overhead if you have to process big opeartions.

A solution to this issue is to use workers. There is an article which explains
how to do this right here :
https://medium.com/@Abdelrahman_Rezk/understanding-worker-threads-in-nestjs-a-hands-on-guide-with-fibonacci-example-6f09998e9129

### OpenAPI 🏗️

One of the most crucial point of an API is its documentation. THe main goal of
an API is not to be a black box but to actually know what it does, what you
should feed it and what output you should expect, in the greatest details.

To document your API with the less effort as possible, use the Nest Swagger
package. It will allow you to describe your routes, their queries, params, DTOs
and response. It's very useful and it even lets you test your API inside the
web browser, so you do not have to wait for the frontend team or use another
tool like Postman.

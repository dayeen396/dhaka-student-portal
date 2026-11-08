import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createApiServer } from "../server/index.js";

const seedPath = fileURLToPath(new URL("../server/data.json", import.meta.url));

test("API serves portal data and validates persisted course-interest requests", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "student-portal-test-"));
  const storePath = path.join(directory, "data.json");
  await writeFile(storePath, await readFile(seedPath));

  const server = createApiServer({ storePath });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await rm(directory, { recursive: true, force: true });
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/api`;
  const get = (path) => fetch(`${baseUrl}${path}`);

  const health = await get("/health");
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, "ok");

  const dashboard = await (await get("/dashboard")).json();
  assert.equal(dashboard.stats.courses, 6);
  assert.equal(dashboard.stats.students, 5);

  const filteredCourses = await (await get("/courses?q=web")).json();
  assert.equal(filteredCourses.courses.length, 1);
  assert.equal(filteredCourses.courses[0].id, "web-development");

  const categoryCourses = await (await get("/courses?category=Foundations")).json();
  assert.equal(categoryCourses.courses.length, 3);

  const filteredStudents = await (await get("/students?q=software")).json();
  assert.equal(filteredStudents.students.length, 2);

  const invalid = await fetch(`${baseUrl}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "A", email: "not-an-email", courseId: "unknown" })
  });
  assert.equal(invalid.status, 400);
  assert.deepEqual(Object.keys((await invalid.json()).fields).sort(), ["email", "name"]);

  const unknownCourse = await fetch(`${baseUrl}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Demo Student", email: "student@example.com", courseId: "unknown" })
  });
  assert.equal(unknownCourse.status, 400);
  assert.ok((await unknownCourse.json()).fields.courseId);

  const malformed = await fetch(`${baseUrl}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{"
  });
  assert.equal(malformed.status, 400);

  const payload = {
    name: "Demo Student",
    email: "demo@example.com",
    courseId: "web-development",
    message: "Interested in building accessible sites."
  };
  const [first, second] = await Promise.all([
    fetch(`${baseUrl}/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
    fetch(`${baseUrl}/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, email: "another@example.com" })
    })
  ]);
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.equal((await readFile(storePath, "utf8")).match(/"status": "received"/g).length, 2);

  const duplicate = await fetch(`${baseUrl}/enrollments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  assert.equal(duplicate.status, 409);

  const missingRoute = await get("/missing");
  assert.equal(missingRoute.status, 404);
});

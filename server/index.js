import { createServer } from "node:http";
import { readFile, rename, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { randomUUID } from "node:crypto";

const port = Number(process.env.API_PORT ?? process.env.PORT ?? 3001);
const host = process.env.HOST ?? "127.0.0.1";
const seedPath = fileURLToPath(new URL("./data.json", import.meta.url));
const defaultStorePath = fileURLToPath(new URL("./store.json", import.meta.url));
const publicPath = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const bodyLimit = 16_384;
let writeQueue = Promise.resolve();

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"]
]);

async function loadData(storePath) {
  try {
    return JSON.parse(await readFile(storePath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT" || storePath !== defaultStorePath) throw error;
    return JSON.parse(await readFile(seedPath, "utf8"));
  }
}

async function saveData(data, storePath) {
  const temporaryPath = `${storePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await rename(temporaryPath, storePath);
}

function updateData(storePath, update) {
  const operation = writeQueue.then(async () => {
    const data = await loadData(storePath);
    return update(data);
  });
  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(payload));
}

async function serveFrontend(request, response, pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return sendJson(response, 400, { error: "The requested URL is not valid." });
  }

  const resolvedPath = path.resolve(publicPath, `.${decodedPath}`);
  if (resolvedPath !== publicPath && !resolvedPath.startsWith(`${publicPath}${path.sep}`)) {
    return sendJson(response, 403, { error: "The requested path is not available." });
  }

  let filePath = resolvedPath;
  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes.get(path.extname(filePath)) ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(request.method === "HEAD" ? undefined : file);
    return;
  } catch (error) {
    if (error.code !== "ENOENT" && error.code !== "EISDIR") throw error;
  }

  if (path.extname(decodedPath)) {
    return sendJson(response, 404, { error: "Page or asset not found." });
  }

  filePath = path.join(publicPath, "index.html");
  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(request.method === "HEAD" ? undefined : file);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    sendJson(response, 404, { error: "The production site has not been built. Run npm run build first." });
  }
}

async function readJsonBody(request) {
  let size = 0;
  const chunks = [];

  for await (const chunk of request) {
    size += chunk.length;
    if (size > bodyLimit) {
      const error = new Error("Request body exceeds the allowed size.");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.status = 400;
    throw error;
  }
}

function normalizeText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

async function handleRequest(request, response, storePath) {
  const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
  const { pathname, searchParams } = url;

  if (request.method === "GET" && pathname === "/api/health") {
    return sendJson(response, 200, { status: "ok", service: "student-portal-api" });
  }

  if ((request.method === "GET" || request.method === "HEAD") && pathname === "/project.html") {
    response.writeHead(302, { Location: "/" });
    response.end();
    return;
  }

  const isDataRoute = request.method === "GET"
    && ["/api/dashboard", "/api/courses", "/api/students", "/api/events", "/api/news", "/api/resources"].includes(pathname);
  const isEnrollmentRoute = request.method === "POST" && pathname === "/api/enrollments";
  if (!isDataRoute && !isEnrollmentRoute) {
    if ((request.method === "GET" || request.method === "HEAD") && !pathname.startsWith("/api")) {
      return serveFrontend(request, response, pathname);
    }
    return sendJson(response, 404, { error: "API endpoint not found." });
  }

  const data = await loadData(storePath);

  if (request.method === "GET" && pathname === "/api/dashboard") {
    return sendJson(response, 200, {
      stats: {
        courses: data.courses.length,
        students: data.students.length,
        events: data.events.length,
        resources: data.resources.length
      },
      featuredCourses: data.courses.slice(0, 3),
      upcomingEvents: data.events.slice(0, 3),
      latestNews: data.news.slice(0, 3)
    });
  }

  if (request.method === "GET" && pathname === "/api/courses") {
    const query = normalizeText(searchParams.get("q"), 100).toLowerCase();
    const category = normalizeText(searchParams.get("category"), 60).toLowerCase();
    const courses = data.courses.filter((course) => {
      const matchesQuery = !query
        || `${course.title} ${course.code} ${course.description} ${course.category}`.toLowerCase().includes(query);
      const matchesCategory = !category || category === "all" || course.category.toLowerCase() === category;
      return matchesQuery && matchesCategory;
    });
    return sendJson(response, 200, { courses });
  }

  if (request.method === "GET" && pathname === "/api/students") {
    const query = normalizeText(searchParams.get("q"), 100).toLowerCase();
    const students = data.students.filter((student) =>
      `${student.name} ${student.studentId} ${student.major} ${student.year}`.toLowerCase().includes(query)
    );
    return sendJson(response, 200, { students });
  }

  if (request.method === "GET" && pathname === "/api/events") {
    return sendJson(response, 200, { events: data.events });
  }

  if (request.method === "GET" && pathname === "/api/news") {
    return sendJson(response, 200, { news: data.news });
  }

  if (request.method === "GET" && pathname === "/api/resources") {
    return sendJson(response, 200, { resources: data.resources });
  }

  if (request.method === "POST" && pathname === "/api/enrollments") {
    const body = await readJsonBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return sendJson(response, 400, { error: "Request body must be a JSON object." });
    }

    const studentName = normalizeText(body.name, 100);
    const email = normalizeText(body.email, 254).toLowerCase();
    const courseId = normalizeText(body.courseId, 80);
    const message = normalizeText(body.message, 400);
    const errors = {};

    if (studentName.length < 2) errors.name = "Enter your name (at least 2 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!courseId) errors.courseId = "Choose a course from the catalog.";

    if (Object.keys(errors).length) {
      return sendJson(response, 400, { error: "Please correct the highlighted fields.", fields: errors });
    }

    const result = await updateData(storePath, async (current) => {
      const course = current.courses.find((item) => item.id === courseId);
      if (!course) {
        return {
          status: 400,
          payload: { error: "Please correct the highlighted fields.", fields: { courseId: "Choose a course from the catalog." } }
        };
      }

      if (current.enrollments.some((item) => item.email === email && item.courseId === courseId)) {
        return { status: 409, payload: { error: "This email already has an interest request for that course." } };
      }

      const enrollment = {
        id: randomUUID(),
        name: studentName,
        email,
        courseId,
        courseTitle: course.title,
        message,
        status: "received",
        createdAt: new Date().toISOString()
      };

      current.enrollments.push(enrollment);
      await saveData(current, storePath);
      return { status: 201, payload: { enrollment } };
    });
    return sendJson(response, result.status, result.payload);
  }

  return sendJson(response, 404, { error: "API endpoint not found." });
}

export function createApiServer({ storePath = defaultStorePath } = {}) {
  return createServer(async (request, response) => {
    try {
      await handleRequest(request, response, storePath);
    } catch (error) {
      if (response.headersSent) {
        response.destroy(error);
        return;
      }

      const status = Number.isInteger(error.status) ? error.status : 500;
      if (status >= 500) console.error("API request failed:", error);
      sendJson(response, status, {
        error: status >= 500 ? "The server could not complete the request." : error.message
      });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createApiServer();
  server.listen(port, host, () => {
    console.log(`Student portal listening on http://${host}:${port}`);
  });
}
